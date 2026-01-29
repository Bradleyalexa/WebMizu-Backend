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

    // 2. Fetch Planned Schedules (Contracts)
    // We treat them as 'pending' tasks for the calendar view
    const schedulesResult = await this.schedulesRepo.findAll({ ...query, limit: "500", status: 'pending' });
    const schedules = schedulesResult.data;

    // 3. Map Schedules to Task Domain
    const mappedSchedules: any[] = schedules.map(s => ({
        id: s.id, // Use schedule ID
        customerProductId: s.customerProductId,
        contractId: s.contractId || null,
        jobId: s.jobId,
        taskDate: s.expectedDate, // Map expectedDate to taskDate
        status: 'pending', // Schedules are pending execution
        taskType: 'service', // or 'planned'
        description: s.notes || "Planned Service Schedule",
        createdAt: s.createdAt,
        jobName: s.jobName,
        customerName: s.customerName,
        productName: s.productName,
        address: s.address,
        technicianId: null, // Schedules don't have technician yet
        source: 'schedule' // Flag to identify origin
    }));

    // 4. Merge and Sort
    const unified = [...tasks, ...mappedSchedules];
    unified.sort((a, b) => new Date(b.taskDate).getTime() - new Date(a.taskDate).getTime());

    // 5. Return (respecting original total format or just array)
    // TasksRepository returns { data, total }. We should probably match that.
    
    // Note: If the controller expects pagination, this unified list might be too big if we don't slice.
    // However, for Calendar view, we usually want all.
    // Let's slice if page/limit exists in query.
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    
    // If strict pagination is requested and limit is small (e.g. table view), we slice.
    // If limit is large (e.g. 100 from TasksPage), we likely return all up to 100/1000.
    
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
    if (task) return task;

    // Check Schedules if not found
    const schedule = await this.schedulesRepo.findById(id);
    if (schedule) {
        return {
            id: schedule.id,
            customerId: schedule.customerId,
            customerProductId: schedule.customerProductId,
            contractId: schedule.contractId || null,
            jobId: schedule.jobId,
            taskDate: schedule.expectedDate,
            status: 'pending', // Schedules are pending execution
            taskType: 'service',
            description: schedule.notes || "Planned Service Schedule",
            createdAt: schedule.createdAt,
            jobName: schedule.jobName,
            customerName: schedule.customerName,
            productName: schedule.productName,
            productModel: schedule.productModel,
            address: schedule.address,
            technicianId: null,
            source: 'schedule'
        } as any; // Cast to match Task interface partially
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
        expected_id: id, // Link back to the task/schedule if it makes sense logically (schema has expected_id)
        // Note: Task might be manual, so expected_id might refer to a Task ID or Schedule ID. 
        // If schema expects valid Schedule ID, and this is a manual Task, it might fail foreign key constraint if strict.
        // However, 'expected_id' is nullable in DB schema we saw.
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
