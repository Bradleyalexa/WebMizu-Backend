import { TasksRepository } from "./tasks.repository";
import { SchedulesRepository } from "../schedules/schedules.repository";
import { CreateServiceLogDTO } from "../service-logs/dto/service-log.dto";
import { ServiceLogRepository } from "../service-logs/service-log.repository";
import { CreateTaskDTO, UpdateTaskDTO, TaskQueryDTO } from "./dto/task.dto";

export class TasksService {
  private repository: TasksRepository;
  private schedulesRepo: SchedulesRepository;
  private logsRepo: ServiceLogRepository;

  constructor() {
    this.repository = new TasksRepository();
    this.schedulesRepo = new SchedulesRepository();
    this.logsRepo = new ServiceLogRepository();
  }

  async findAll(query: TaskQueryDTO) {
    // 1. Fetch Manual Tasks
    // Use a larger limit for tasks to ensure calendar population
    const tasksResult = await this.repository.findAll({ ...query, limit: "500" });
    const tasks = tasksResult.data;

    // 2. Fetch Planned Schedules (contracts), typically 'pending'
    const schedulesResult = await this.schedulesRepo.findAll({ ...query, limit: "500", status: query.status === 'completed' ? undefined : 'pending' });
    // Note: If status is 'completed', we might not want pending schedules, but we'll filter below or let the repo handle it.
    // Actually, schedulesRepo.findAll above forces status='pending' hardcoded in original code.
    // Let's allow flexible status if query asks for it, but for "Service History" logic:
    // User wants: Pending = Schedules + Tasks(pending). Completed = ServiceLog + Tasks(completed).
    
    // We keep original logic for pending schedules:
    let schedules = schedulesResult.data;
    if (query.status === 'completed' || query.status === 'done') {
        schedules = []; // Schedules are inherently future/pending planning usually. 
    }

    // 3. Fetch Service Logs (Completed History)
    // Only if status is 'completed', 'done', or undefined (all)
    let serviceLogs: any[] = [];
    if (!query.status || query.status === 'completed' || query.status === 'done') {
        const logs = await this.logsRepo.findAll({ 
            search: query.search, 
            customerProductId: query.customerProductId 
        });
        serviceLogs = logs.map(l => ({
            id: l.id,
            customerId: null, // ServiceLog doesn't directly expose customerId in domain but accessible via relations if needed
            customerProductId: l.customerProductId,
            contractId: null,
            expectedId: l.expectedId,
            jobId: null, // Log has job name/pekerjaan
            taskDate: l.serviceDate,
            status: 'completed',
            taskType: 'service_log',
            title: l.pekerjaan || "Service Log", 
            description: l.notes,
            createdAt: l.createdAt,
            jobName: l.serviceType, // Using serviceType as job category
            customerName: l.customerName,
            productName: l.productName,
            productModel: l.productModel,
            address: l.installationLocation,
            technicianName: l.technicianName,
            technicianId: l.technicianId,
            source: 'service_log',
            taskId: l.taskId // Important for deduplication
        }));
    }

    // 4. Map Schedules to Task Domain
    const mappedSchedules: any[] = schedules.map(s => ({
        id: s.id,
        customerProductId: s.customerProductId,
        contractId: s.contractId || null,
        jobId: s.jobId,
        taskDate: s.expectedDate,
        status: s.status, 
        taskType: 'service',
        title: "Planned Service", 
        description: s.notes || "Planned Service Schedule",
        createdAt: s.createdAt,
        jobName: s.jobName,
        customerName: s.customerName,
        productName: s.productName,
        address: s.address,
        technicianId: null,
        source: 'schedule'
    }));

    // 5. Deduplicate Tasks that have a linked Service Log
    // If a Service Log exists for a task, we show the Log instead of the Task (as it contains the completion details)
    const logTaskIds = new Set(serviceLogs.map(l => l.taskId).filter(id => !!id));
    const uniqueTasks = tasks.filter(t => !logTaskIds.has(t.id));

    // 6. Merge and Sort
    const unified = [...uniqueTasks, ...mappedSchedules, ...serviceLogs];
    unified.sort((a, b) => new Date(b.taskDate).getTime() - new Date(a.taskDate).getTime());

    // 7. Return with pagination slice (in-memory)
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = unified.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        total: unified.length
    };
  }

  async findById(id: string) {
    const task = await this.repository.findById(id);
    if (task) {
        console.log(`[DEBUG] Task Found: ${task.id}, Status: ${task.status}, ExpectedID: ${task.expectedId}`);
        
        // 1. Try finding log by Task ID (for Manual Tasks or linked ones)
        let serviceLog = await this.logsRepo.findByTaskId(task.id);
        
        // 2. Fallback: Try Expected ID (Schedule) if not found and link exists
        if (!serviceLog && task.expectedId) {
             serviceLog = await this.logsRepo.findByExpectedId(task.expectedId);
        }

        console.log(`[DEBUG] ServiceLog lookup result:`, serviceLog ? "Found" : "Null");
        (task as any).serviceLog = serviceLog;
        
        return task;
    }

    // Check Schedules if not found
    // Check Schedules if not found
    const schedule = await this.schedulesRepo.findById(id);
    if (schedule) {
        // Try to find if a service log exists for this schedule (even if status is pending/done)
        // This is key for the "Done" view.
        const serviceLog = await this.logsRepo.findByExpectedId(schedule.id);

        return {
            id: schedule.id,
            customerId: schedule.customerId,
            customerProductId: schedule.customerProductId,
            contractId: schedule.contractId || null,
            jobId: schedule.jobId,
            taskDate: schedule.expectedDate,
            status: schedule.status, // Use actual status (e.g. 'done')
            taskType: 'service',
            description: schedule.notes || "Planned Service Schedule",
            createdAt: schedule.createdAt,
            jobName: schedule.jobName,
            customerName: schedule.customerName,
            productName: schedule.productName,
            productModel: schedule.productModel,
            address: schedule.address,
            technicianId: null,
            source: 'schedule',
            serviceLog: serviceLog // Attach log if found
        } as any; 
    }

    return null;
  }

  async create(data: CreateTaskDTO) {
    const task = await this.repository.create(data);
    
    // If this task is created from a schedule (expected_id), update the schedule status
    if (data.expected_id) {
        try {
            // We assume 'scheduled' is a valid status as confirmed by user
            await this.schedulesRepo.update(data.expected_id, { status: 'scheduled' } as any);
        } catch (err) {
            console.error("Failed to update schedule status to 'scheduled'.", err);
            // Throwing error to make it visible to user
            throw new Error(`Failed to update Schedule status: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }
    
    return task;
  }

  async update(id: string, data: UpdateTaskDTO) {
    // 1. Try updating as Task first
    try {
        const task = await this.repository.findById(id);
        if (task) {
            return await this.repository.update(id, data);
        }
    } catch (e) {
        // Ignore error and try schedule
    }

    // 2. Try updating as Schedule
    const schedule = await this.schedulesRepo.findById(id);
    if (schedule) {
        // Map Task DTO to Schedule DTO
        const scheduleUpdatePayload: any = {};
        if (data.task_date) scheduleUpdatePayload.expected_date = data.task_date;
        if (data.description) scheduleUpdatePayload.notes = data.description;
        if (data.status === 'completed') scheduleUpdatePayload.status = 'done';
        if (data.status === 'canceled') scheduleUpdatePayload.status = 'canceled';
        if (data.status === 'pending') scheduleUpdatePayload.status = 'pending';
        
        return await this.schedulesRepo.update(id, scheduleUpdatePayload);
    }

    throw new Error("Task or Schedule not found");
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
  async completeTask(id: string, logData: CreateServiceLogDTO) {
    // 1. Create the Service Log
    // We need to ensure logData has the correct expected_id or job_id if applicable
    // Ideally the FE passes everything, but we can enrich if needed.
    const log = await this.logsRepo.create({
        ...logData,
        expected_id: (logData.expected_id && logData.expected_id !== "") ? logData.expected_id : null,
        job_id: (logData.job_id && logData.job_id !== "") ? logData.job_id : null,
        task_id: id // Link to Task ID
    });

    // 2. Update Task Status to 'completed'
    // or Schedule Status to 'done'
    try {
        await this.update(id, { status: 'completed' });
    } catch (err) {
        // If update fails, we might want to rollback log creation?
        // For MVP, simplistic erroring is okay, but ideally we warn user.
        console.error("Failed to mark task as completed after log creation:", err);
        throw new Error("Service Log created, but failed to update Task status.");
    }

    return log;
  }
}
