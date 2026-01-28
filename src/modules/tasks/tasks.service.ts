import { TasksRepository } from "./tasks.repository";
import { CreateTaskDTO, UpdateTaskDTO, TaskQueryDTO } from "./dto/task.dto";

export class TasksService {
  private repository: TasksRepository;

  constructor() {
    this.repository = new TasksRepository();
  }

  async findAll(query: TaskQueryDTO) {
    return this.repository.findAll(query);
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async create(data: CreateTaskDTO) {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateTaskDTO) {
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
