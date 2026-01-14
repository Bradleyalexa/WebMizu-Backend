import { CustomerRepository } from "./customer.repository";
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerQueryDTO } from "./dto/customer.dto";
import { Customer } from "./domain/customer";

export class CustomerService {
  private customerRepository = new CustomerRepository();


  async findAll(query: CustomerQueryDTO): Promise<{ data: Customer[]; total: number }> {
    return this.customerRepository.findAll(query);
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(payload: CreateCustomerDTO): Promise<Customer> {
    return this.customerRepository.create(payload);
  }

  async update(id: string, payload: UpdateCustomerDTO): Promise<Customer> {
    await this.findById(id); // Ensure exists
    return this.customerRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Ensure exists
    return this.customerRepository.delete(id);
  }
}
