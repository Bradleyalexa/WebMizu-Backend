import { supabaseAdmin } from "../../db/supabase";
import { Database } from "../../../../../packages/types/supabase";
import { Product } from "./domain/product";
import { CreateProductDTO, UpdateProductDTO } from "./dto/product.dto";

type ProductRow = Database["public"]["Tables"]["product_catalog"]["Row"];

export class ProductRepository {
  private toDomain(row: ProductRow & { category?: { id: string; name: string } | null }): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      model: row.model,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      createdAt: row.created_at,
    };
  }

  async findAll({
    limit = 20,
    offset = 0,
    q,
    categoryId,
  }: {
    limit?: number;
    offset?: number;
    q?: string;
    categoryId?: string;
  }): Promise<{ items: Product[]; total: number }> {
    let query = supabaseAdmin
      .from("product_catalog")
      .select("*, category:product_category(id, name)", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`name.ilike.%${q}%,model.ilike.%${q}%`);
    }

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      items: (data || []).map((row: any) => this.toDomain(row)),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
      .from("product_catalog")
      .select("*, category:product_category(id, name)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return this.toDomain(data as any);
  }

  async create(payload: CreateProductDTO): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from("product_catalog")
      .insert({
        name: payload.name,
        description: payload.description ?? null,
        price: payload.price ?? 0,
        model: payload.model ?? null,
        category_id: payload.categoryId ?? null,
        image_url: payload.imageUrl ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toDomain(data);
  }

  async update(id: string, payload: UpdateProductDTO): Promise<Product> {
    const updateData: any = { ...payload };
    if (payload.imageUrl !== undefined) updateData.image_url = payload.imageUrl;
    if (payload.categoryId !== undefined) updateData.category_id = payload.categoryId;
    
    // Clean up DTO keys that don't match DB
    delete updateData.imageUrl;
    delete updateData.categoryId;

    const { data, error } = await supabaseAdmin
      .from("product_catalog")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("product_catalog")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
