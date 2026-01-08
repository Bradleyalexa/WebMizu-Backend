import { TechnicianRepository } from "./technician.repository";
import { CreateTechnicianDTO, UpdateTechnicianDTO } from "./dto/technician.dto";
import { Technician } from "./domain/technician";

export class TechnicianService {
  private repo: TechnicianRepository;

  constructor() {
    this.repo = new TechnicianRepository();
  }

  async getTechnicians(params: { limit?: number; offset?: number; q?: string }) {
    return this.repo.findAll(params);
  }

  async getTechnicianById(id: string): Promise<Technician> {
    const technician = await this.repo.findById(id);
    if (!technician) {
      throw new Error(`Technician with ID ${id} not found`);
    }
    return technician;
  }

  async createTechnician(payload: CreateTechnicianDTO): Promise<Technician> {
    return this.repo.create(payload);
  }

  async updateTechnician(id: string, payload: UpdateTechnicianDTO): Promise<Technician> {
    // Check existence first
    await this.getTechnicianById(id);
    return this.repo.update(id, payload);
  }
}
