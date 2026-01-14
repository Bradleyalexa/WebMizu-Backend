import { CategoryRepository } from "./category.repository";

export class CategoryService {
  private repo = new CategoryRepository();

  async findAll() {
    return this.repo.findAll();
  }
}
