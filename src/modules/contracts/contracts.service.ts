import { ContractsRepository } from "./contracts.repository";
import { CreateContractDTO } from "./dto/create-contract.dto";
import { UpdateContractDTO } from "./dto/update-contract.dto";
import { Contract } from "./domain/contract";

export class ContractsService {
  private repo: ContractsRepository;

  constructor() {
    this.repo = new ContractsRepository();
  }

  async create(dto: CreateContractDTO): Promise<Contract> {
    const { customer_product_id, start_date, end_date, interval_months, total_service, contract_url, notes } = dto;

    // 1. Create Contract
    const contract = await this.repo.create({
        customer_product_id,
        start_date,
        end_date,
        interval_months,
        total_service,
        services_used: 0,
        status: 'active',
        contract_url,
        notes,
        price: dto.price || 0,
    });

    // 2. Generate Schedules
    const schedules = [];
    let currentDate = new Date(start_date);
    const lastDate = new Date(end_date);

    if (interval_months <= 0) throw new Error("Interval must be positive");

    for (let i = 0; i < total_service; i++) {
      schedules.push({
        customer_product_id,
        contract_id: contract.id,
        expected_date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
        interval_months,
        source_type: 'contract',
        status: 'pending',
      });

      // Add interval months for next service
      currentDate.setMonth(currentDate.getMonth() + interval_months);
    }

    if (schedules.length > 0) {
       await this.repo.createSchedules(schedules);
    }

    return contract;
  }

  async findAll(query?: { status?: string, productName?: string }): Promise<Contract[]> {
    return this.repo.findAll(query);
  }

  async findOne(id: string): Promise<Contract | null> {
    return this.repo.findById(id);
  }

  async update(id: string, dto: UpdateContractDTO): Promise<Contract> {
    // Convert DTO camelCase/interface to snake_case for DB if manual mapping needed, 
    // BUT the repository expects snake_case for standard fields usually, or we should map it here.
    // The previous implementation of repo passed `data` directly to `update`.
    // Let's check `customer-product.service.ts` update method in Step 89.
    // It constructed `dbData` manually. I should do that too for safety.
    
    const dbData: any = {};
    if (dto.customer_product_id !== undefined) dbData.customer_product_id = dto.customer_product_id;
    if (dto.start_date !== undefined) dbData.start_date = dto.start_date;
    if (dto.end_date !== undefined) dbData.end_date = dto.end_date;
    if (dto.interval_months !== undefined) dbData.interval_months = dto.interval_months;
    if (dto.total_service !== undefined) dbData.total_service = dto.total_service;
    if (dto.services_used !== undefined) dbData.services_used = dto.services_used;
    if (dto.status !== undefined) dbData.status = dto.status;
    if (dto.contract_url !== undefined) dbData.contract_url = dto.contract_url;
    if (dto.notes !== undefined) dbData.notes = dto.notes;
    if (dto.price !== undefined) dbData.price = dto.price;

    return this.repo.update(id, dbData);
  }

  async remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }
}
