import { CustomerProductRepository } from "./customer-product.repository";
import { CreateCustomerProductDTO, CustomerProductResponseDTO, UpdateCustomerProductDTO } from "./dto/customer-product.dto";
import { CustomerProduct } from "./domain/customer-product";

export class CustomerProductService {
  private repo: CustomerProductRepository;

  constructor() {
    this.repo = new CustomerProductRepository();
  }

  async createCustomerProduct(dto: CreateCustomerProductDTO): Promise<CustomerProductResponseDTO> {
    // Map DTO to DB (snake_case)
    const dbData = {
      customer_id: dto.customer_id,
      product_catalog_id: dto.product_catalog_id,
      installation_technician_id: dto.installation_technician_id,
      installation_date: dto.installation_date,
      installation_location: dto.installation_location,
      cust_product_price: dto.cust_product_price, // Already mapped in DTO
      quantity_owned: dto.quantity_owned,
      status: dto.status,
      description: dto.description,
      photo_url: dto.photo_url,
      notes: dto.notes,
    };

    const domain = await this.repo.create(dbData);
    return this.toDTO(domain);
  }

  async getCustomerProducts(customerId: string): Promise<CustomerProductResponseDTO[]> {
    const items = await this.repo.findByCustomerId(customerId);
    return items.map(this.toDTO);
  }

  async getCustomerProductById(id: string): Promise<CustomerProductResponseDTO> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new Error(`Customer Product with ID ${id} not found`);
    }
    return this.toDTO(item);
  }

  async updateCustomerProduct(id: string, dto: UpdateCustomerProductDTO): Promise<CustomerProductResponseDTO> {
    // Filter undefined fields
    const dbData: any = {};
    if (dto.product_catalog_id !== undefined) dbData.product_catalog_id = dto.product_catalog_id;
    if (dto.installation_technician_id !== undefined) dbData.installation_technician_id = dto.installation_technician_id;
    if (dto.installation_date !== undefined) dbData.installation_date = dto.installation_date;
    if (dto.installation_location !== undefined) dbData.installation_location = dto.installation_location;
    if (dto.cust_product_price !== undefined) dbData.cust_product_price = dto.cust_product_price;
    if (dto.quantity_owned !== undefined) dbData.quantity_owned = dto.quantity_owned;
    if (dto.status !== undefined) dbData.status = dto.status;
    if (dto.description !== undefined) dbData.description = dto.description;
    if (dto.photo_url !== undefined) dbData.photo_url = dto.photo_url;
    if (dto.notes !== undefined) dbData.notes = dto.notes;

    const domain = await this.repo.update(id, dbData);
    return this.toDTO(domain);
  }

  private toDTO(domain: CustomerProduct & { contractStatus?: string }): CustomerProductResponseDTO {
    return {
      id: domain.id,
      customer_id: domain.customerId,
      product_catalog_id: domain.productCatalogId,
      order_product_id: domain.orderProductId,
      installation_technician_id: domain.installationTechnicianId,
      status: domain.status,
      quantity_owned: domain.quantityOwned,
      cust_product_price: domain.custProductPrice,
      installation_date: domain.installationDate,
      installation_location: domain.installationLocation,
      description: domain.description,
      photo_url: domain.photoUrl,
      notes: domain.notes,
      created_at: domain.createdAt,
      
      // Enriched
      product_name: domain.productName,
      product_model: domain.productModel,
      technician_name: domain.technicianName,
      contract_status: domain.contractStatus || 'Unknown',
    };
  }
}
