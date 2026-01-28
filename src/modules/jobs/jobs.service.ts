import { JobsRepository } from "./jobs.repository";
import { CreateJobDTO, UpdateJobDTO, JobQueryDTO } from "./dto/job.dto";

export class JobsService {
  private repository: JobsRepository;

  constructor() {
    this.repository = new JobsRepository();
  }

  async findAll(query: JobQueryDTO) {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    const job = await this.repository.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  }

  async create(payload: CreateJobDTO) {
    return this.repository.create(payload);
  }

  async update(id: string, payload: UpdateJobDTO) {
    // Verify exists
    await this.findOne(id);
    return this.repository.update(id, payload);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.delete(id);
  }
}
