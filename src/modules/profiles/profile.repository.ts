import { supabaseAdmin } from "../../db/supabase";
import { Database } from "@packages/types/supabase";
import { Profile } from "./domain/profile";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export class ProfileRepository {
  private toDomain(row: ProfileRow): Profile {
    return {
      id: row.id,
      name: row.name,
      role: row.role, // "admin" | "customer"
      createdAt: row.created_at,
    };
  }

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found code
      throw error;
    }

    return this.toDomain(data);
  }
}
