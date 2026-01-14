import { supabaseAdmin } from "../../db/supabase";
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerQueryDTO } from "./dto/customer.dto";
import { Customer } from "./domain/customer";
import { Database } from "../../../../../packages/types/supabase";

export class CustomerRepository {
  private supabase = supabaseAdmin;


  private mapToDomain(data: any): Customer {
    return {
      id: data.id,
      name: data.profiles?.name || "Unknown",
      email: data.profiles?.email || "", // Now available from profiles
      phone: data.phone,
      address: data.address,
      addressType: data.address_type,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async findAll(query: CustomerQueryDTO): Promise<{ data: Customer[]; total: number }> {
    const { page, limit, search } = query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // Use RPC for search to handle complex OR logic across joined tables
    if (search) {
      const { data, count, error } = await (this.supabase as any)
        .rpc("search_customers", { search_text: search }, { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return {
        data: (data || []).map(this.mapToDomain),
        total: count || 0,
      };
    }

    // Default list query
    const { data, count, error } = await this.supabase
      .from("customers")
      .select(`
        *,
        profiles!inner (
          name,
          email
        )
      `, { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      data: (data || []).map(this.mapToDomain),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabase
      .from("customers")
      .select(`
        *,
        profiles!inner (
          name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) return null;
    return this.mapToDomain(data);
  }

  async create(payload: CreateCustomerDTO): Promise<Customer> {
    // 1. Create Auth User (Triggers handle_new_user -> creates Profile & Customer)
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password || "12345678", // Default password if not provided
      email_confirm: true,
      user_metadata: {
        name: payload.name, // Trigger uses this to populate profiles.name
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    const id = authData.user.id;

    // 2. Update Customer details (Trigger only created the row with ID)
    const { data, error: updateError } = await this.supabase
      .from("customers")
      .update({
        phone: payload.phone,
        address: payload.address,
        address_type: payload.addressType,
        status: payload.status,
      })
      .eq("id", id)
      .select(`
        *,
        profiles!inner (
          name,
          email
        )
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return this.mapToDomain(data);
  }

  async update(id: string, payload: UpdateCustomerDTO): Promise<Customer> {
    // 1. Update Profile if name is provided (Email logic depends if we allow changing it here)
    // For now, only name update in profile. Email update involves Auth API usually.
    if (payload.name) {
      const { error: profileError } = await this.supabase
        .from("profiles")
        .update({ name: payload.name })
        .eq("id", id);
      
      if (profileError) throw profileError;
    }

    // 2. Update Customer fields
    const customerUpdates: any = {};
    if (payload.phone !== undefined) customerUpdates.phone = payload.phone;
    if (payload.address !== undefined) customerUpdates.address = payload.address;
    if (payload.addressType !== undefined) customerUpdates.address_type = payload.addressType;
    if (payload.status !== undefined) customerUpdates.status = payload.status;

    if (Object.keys(customerUpdates).length > 0) {
      const { error: customerError } = await this.supabase
        .from("customers")
        .update(customerUpdates)
        .eq("id", id);

      if (customerError) throw customerError;
    }

    // 3. Return updated data
    return this.findById(id) as Promise<Customer>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("customers")
      .update({ status: 'inactive' })
      .eq("id", id);

    if (error) throw error;
  }
}
