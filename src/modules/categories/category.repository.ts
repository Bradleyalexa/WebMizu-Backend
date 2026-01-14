import { supabaseAdmin } from "../../db/supabase";
import { Category } from "./domain/category";

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
      .from("product_category")
      .select("*")
      .order("name");

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
    }));
  }
}
