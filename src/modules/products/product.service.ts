import { ProductRepository } from "./product.repository";
import { CreateProductDTO, UpdateProductDTO } from "./dto/product.dto";

export class ProductService {
  private repo = new ProductRepository();

  async findAll(query: { limit?: number; offset?: number; q?: string; categoryId?: string }) {
    return this.repo.findAll(query);
  }

  async findOne(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new Error("Product not found");
    return product;
  }

  async create(payload: CreateProductDTO) {
    return this.repo.create(payload);
  }

  async update(id: string, payload: UpdateProductDTO) {
    await this.findOne(id); // Ensure exists
    return this.repo.update(id, payload);
  }

  async delete(id: string) {
    await this.findOne(id); // Ensure exists
    return this.repo.delete(id);
  }
}
