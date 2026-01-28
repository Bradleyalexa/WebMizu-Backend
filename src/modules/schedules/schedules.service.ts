import { SchedulesRepository } from "./schedules.repository";
import { CreateScheduleDTO, UpdateScheduleDTO, ScheduleQueryDTO } from "./dto/schedule.dto";
import { TasksRepository } from "../tasks/tasks.repository";
import { ServiceLogRepository } from "../service-logs/service-log.repository";

export class SchedulesService {
  private repository: SchedulesRepository;
  private tasksRepo: TasksRepository;
  private logsRepo: ServiceLogRepository;

  constructor() {
    this.repository = new SchedulesRepository();
    this.tasksRepo = new TasksRepository();
    this.logsRepo = new ServiceLogRepository();
  }

  async findAll(query: ScheduleQueryDTO) {
    const { status } = query;
    let unified: any[] = [];

    // 1. Pending Data (Future/Current)
    if (!status || status === 'pending') {
        const { data: schedules } = await this.repository.findAll(query);
        const { data: tasks } = await this.tasksRepo.findAll({ limit: "100", status: "pending" });
        
        // Filter strictly for service tasks
        const serviceTasks = tasks.filter(t => (t as any).task_type === 'service');

        unified = [
            ...unified,
            ...schedules.map(s => ({
                ...s,
                source: 'schedule',
                displayStatus: 'pending', // Schedules are by definition planned/pending
                date: s.expectedDate,
                type: 'Planned (Contract)'
            })),
            ...serviceTasks.map(t => ({
                id: t.id,
                customerProductId: t.customerProductId,
                contractId: null,
                jobId: t.jobId,
                expectedDate: t.taskDate,
                status: t.status,
                notes: t.description,
                createdAt: t.createdAt,
                jobName: t.jobName,
                customerName: t.customerName,
                productName: t.productName || "Manual Task",
                address: t.address,
                source: 'task',
                displayStatus: 'pending',
                date: t.taskDate,
                type: 'Manual Service'
            }))
        ];
    }

    // 2. Completed Data (History)
    if (!status || status === 'done' || status === 'completed') {
        const { data: tasks } = await this.tasksRepo.findAll({ limit: "100", status: "completed" });
        const serviceTasks = tasks.filter(t => (t as any).task_type === 'service');
        const logs = await this.logsRepo.findAll();

        unified = [
            ...unified,
            ...serviceTasks.map(t => ({
                id: t.id,
                customerProductId: t.customerProductId,
                contractId: null,
                jobId: t.jobId,
                expectedDate: t.taskDate,
                status: 'completed',
                notes: t.description,
                createdAt: t.createdAt,
                jobName: t.jobName,
                customerName: t.customerName,
                productName: t.productName || "Manual Task",
                address: t.address,
                source: 'task',
                displayStatus: 'completed',
                date: t.taskDate,
                type: 'Manual Service'
            })),
            ...logs.map(l => ({
                id: l.id,
                customerProductId: l.customerProductId,
                contractId: null,
                jobId: null,
                expectedDate: l.serviceDate,
                status: 'completed',
                notes: l.notes,
                createdAt: l.createdAt,
                jobName: l.pekerjaan,
                customerName: l.customerName,
                productName: l.productName,
                productModel: l.productModel,
                address: l.installationLocation,
                source: 'log',
                displayStatus: 'completed',
                date: l.serviceDate,
                type: 'Completed Log'
            }))
        ];
    }

    // 3. Canceled Data
    if (!status || status === 'canceled') {
        const { data: tasks } = await this.tasksRepo.findAll({ limit: "100", status: "canceled" });
        const serviceTasks = tasks.filter(t => (t as any).task_type === 'service');
        
        unified = [
            ...unified,
            ...serviceTasks.map(t => ({
                id: t.id,
                customerProductId: t.customerProductId,
                contractId: null,
                jobId: t.jobId,
                expectedDate: t.taskDate,
                status: 'canceled',
                notes: t.description,
                createdAt: t.createdAt,
                jobName: t.jobName,
                customerName: t.customerName,
                productName: t.productName || "Manual Task",
                productModel: t.productModel,
                address: t.address,
                source: 'task',
                displayStatus: 'canceled',
                date: t.taskDate,
                type: 'Manual Service'
            }))
        ];
    }

    // Sort Descending (Newest First) for easy viewing
    unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { 
        data: unified, 
        total: unified.length 
    };
  }

  async findOne(id: string) {
    const schedule = await this.repository.findById(id);
    if (!schedule) {
      throw new Error("Schedule not found");
    }
    return schedule;
  }

  async create(payload: CreateScheduleDTO) {
    // Potentially validate logic here (e.g., check conflicts)
    return this.repository.create(payload);
  }

  async update(id: string, payload: UpdateScheduleDTO) {
    await this.findOne(id);
    return this.repository.update(id, payload);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.delete(id);
  }
}
