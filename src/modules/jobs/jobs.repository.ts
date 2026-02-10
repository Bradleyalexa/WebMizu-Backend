import { supabaseAdmin } from "../../db/supabase";
import { Job } from "./domain/job";
import { CreateJobDTO, UpdateJobDTO, JobQueryDTO } from "./dto/job.dto";

export class JobsRepository {
  private table = "jobs" as any; // Type generation pending

  private mapToDomain(row: any): Job {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      defaultPrice: row.default_price,
      createdAt: row.created_at,
    };
  }

  async findAll(query: JobQueryDTO): Promise<{ data: Job[]; total: number }> {
    const { page, limit, search } = query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let queryBuilder = supabaseAdmin.from(this.table).select("*", { count: "exact" });

    if (search) {
      queryBuilder = queryBuilder.ilike("name", `%${search}%`);
    }

    const { data, count, error } = await queryBuilder
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      data: (data || []).map(this.mapToDomain),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Job | null> {
    const { data, error } = await supabaseAdmin.from(this.table).select("*").eq("id", id).single();

    if (error) return null;
    return this.mapToDomain(data);
  }

  async create(payload: CreateJobDTO): Promise<Job> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .insert({
        name: payload.name,
        description: payload.description,
        default_price: payload.default_price,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToDomain(data);
  }

  async update(id: string, payload: UpdateJobDTO): Promise<Job> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .update({
        ...payload,
        default_price: payload.default_price, // Ensure naming match if typical DTO doesn't map snake_case
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from(this.table).delete().eq("id", id);

    if (error) throw error;
  }
}
