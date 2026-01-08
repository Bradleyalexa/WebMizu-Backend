import { supabaseAdmin } from "../../db/supabase";
import { Database } from "../../../../../packages/types/supabase";
import { Technician } from "./domain/technician";
import { CreateTechnicianDTO, UpdateTechnicianDTO } from "./dto/technician.dto";

type TechnicianRow = Database["public"]["Tables"]["technicians"]["Row"];

export class TechnicianRepository {
  private toDomain(row: TechnicianRow): Technician {
    return {
      id: row.id,
      name: row.name || "",
      phone: row.phone,
      photoUrl: row.photo_url,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }

  async findAll({
    limit = 20,
    offset = 0,
    q,
  }: {
    limit?: number;
    offset?: number;
    q?: string;
  }): Promise<{ items: Technician[]; total: number }> {
    let query = supabaseAdmin
      .from("technicians")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      items: (data || []).map(this.toDomain),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Technician | null> {
    const { data, error } = await supabaseAdmin
      .from("technicians")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return this.toDomain(data);
  }

  async create(payload: CreateTechnicianDTO): Promise<Technician> {
    const { data, error } = await supabaseAdmin
      .from("technicians")
      .insert({
        name: payload.name,
        phone: payload.phone ?? null, // Ensure explicit null if undefined
        photo_url: payload.photo_url ?? null,
        notes: payload.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return this.toDomain(data);
  }

  async update(id: string, payload: UpdateTechnicianDTO): Promise<Technician> {
    const { data, error } = await supabaseAdmin
      .from("technicians")
      .update({
        ...payload,
        // If undefined, don't update. Supabase ignores undefined keys in JS object usually?
        // Actually best to explicitly handle partials or let Supabase handle it if object only has keys.
        // We will pass the payload directly as clean partial.
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.toDomain(data);
  }
}
