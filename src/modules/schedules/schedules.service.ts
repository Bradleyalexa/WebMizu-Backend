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
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    // Override pagination for fetching to ensure we get all data for aggregation
    // This effectively moves pagination to in-memory, which is necessary for
    // cross-table sorting and merging without complex SQL views.
    const fetchQuery = { ...query, page: "1", limit: "1000" };

    // RESTORED VARIABLES
    const { status } = query;
    let unified: any[] = [];

    // 1. Pending Data (Future/Current)
    if (!status || status === "pending" || status === "scheduled") {
      const { data: schedules } = await this.repository.findAll(fetchQuery);

      let serviceTasks: any[] = [];
      // Only fetch pending tasks if we are NOT strictly filtering for 'scheduled'
      // If status is 'scheduled', we only want the Scheduled items (from schedules repo)
      if (status !== "scheduled") {
        const { data: tasks } = await this.tasksRepo.findAll({
          limit: "1000",
          status: "pending",
          search: query.search,
        });
        serviceTasks = tasks;
      }

      unified = [
        ...unified,
        ...schedules.map((s) => ({
          ...s,
          source: "schedule",
          displayStatus: s.status, // Use actual status (pending/scheduled)
          date: s.expectedDate,
          type: "Planned (Contract)",
        })),
        ...serviceTasks.map((t) => ({
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
          source: "task",
          displayStatus: "pending",
          date: t.taskDate,
          type: "Manual Service",
        })),
      ];
    }

    // 2. Completed Data (History)
    if (!status || status === "done" || status === "completed") {
      const { data: tasks } = await this.tasksRepo.findAll({
        limit: "1000",
        status: "completed",
        search: query.search,
      });
      const serviceTasks = tasks; // Include all
      const logs = await this.logsRepo.findAll({ search: query.search });

      unified = [
        ...unified,
        ...serviceTasks.map((t) => ({
          id: t.id,
          customerProductId: t.customerProductId,
          contractId: null,
          jobId: t.jobId,
          expectedDate: t.taskDate,
          status: "completed",
          notes: t.description,
          createdAt: t.createdAt,
          jobName: t.jobName,
          customerName: t.customerName,
          productName: t.productName || "Manual Task",
          address: t.address,
          source: "task",
          displayStatus: "completed",
          date: t.taskDate,
          type: "Manual Service",
        })),
        ...logs.map((l) => ({
          id: l.id,
          customerProductId: l.customerProductId,
          contractId: null,
          jobId: null,
          expectedDate: l.serviceDate,
          status: "completed",
          notes: l.notes,
          createdAt: l.createdAt,
          jobName: l.pekerjaan,
          customerName: l.customerName,
          productName: l.productName,
          productModel: l.productModel,
          address: l.installationLocation,
          source: "log",
          displayStatus: "completed",
          date: l.serviceDate,
          type: "Completed Log",
        })),
      ];
    }

    // 3. Canceled Data
    if (!status || status === "canceled") {
      const { data: tasks } = await this.tasksRepo.findAll({
        limit: "1000",
        status: "canceled",
        search: query.search,
      });
      const serviceTasks = tasks; // Include all

      unified = [
        ...unified,
        ...serviceTasks.map((t) => ({
          id: t.id,
          customerProductId: t.customerProductId,
          contractId: null,
          jobId: t.jobId,
          expectedDate: t.taskDate,
          status: "canceled",
          notes: t.description,
          createdAt: t.createdAt,
          jobName: t.jobName,
          customerName: t.customerName,
          productName: t.productName || "Manual Task",
          productModel: t.productModel,
          address: t.address,
          source: "task",
          displayStatus: "canceled",
          date: t.taskDate,
          type: "Manual Service",
        })),
      ];
    }

    // IN-MEMORY SEARCH FILTER (Robustness)
    if (query.search) {
      const lowerSearch = query.search.toLowerCase();
      unified = unified.filter((item) => {
        return (
          (item.customerName && item.customerName.toLowerCase().includes(lowerSearch)) ||
          (item.productName && item.productName.toLowerCase().includes(lowerSearch)) ||
          (item.jobName && item.jobName.toLowerCase().includes(lowerSearch)) ||
          (item.notes && item.notes.toLowerCase().includes(lowerSearch))
        );
      });
    }

    // Sort Descending (Newest First) for easy viewing
    unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply Pagination In-Memory
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = unified.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: unified.length,
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
