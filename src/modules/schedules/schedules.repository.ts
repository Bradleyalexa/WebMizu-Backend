import { supabaseAdmin } from "../../db/supabase";
import { Schedule } from "./domain/schedule";
import { CreateScheduleDTO, UpdateScheduleDTO, ScheduleQueryDTO } from "./dto/schedule.dto";

export class SchedulesRepository {
  private table = "schedule_expected" as any; // Type pending

  private mapToDomain(row: any): Schedule {
    return {
      id: row.id,
      customerId: row.customer_products?.customers?.id,
      customerProductId: row.customer_product_id,
      contractId: row.contract_id,
      jobId: row.job_id,
      expectedDate: row.expected_date,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,

      // Joined fields
      jobName: row.jobs?.name,
      customerName:
        row.customer_products?.customers?.profiles?.name ||
        row.customer_products?.customers?.name ||
        "Unknown",
      productName: row.customer_products?.product_catalog?.name,
      productModel: row.customer_products?.product_catalog?.model,
      address: row.customer_products?.installation_location,
    };
  }

  async findAll(query: ScheduleQueryDTO): Promise<{ data: Schedule[]; total: number }> {
    const { page, limit, startDate, endDate, status } = query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let queryBuilder = supabaseAdmin.from(this.table).select(
      `
        *,
        jobs ( name ),
        customer_products!inner (
          id,
          installation_location,
          product_catalog ( name, model ),
          customers!inner (
            id,
            profiles!inner ( name )
          )
        )
      `,
      { count: "exact" },
    );

    if (status) queryBuilder = queryBuilder.eq("status", status);
    if (query.customerProductId)
      queryBuilder = queryBuilder.eq("customer_product_id", query.customerProductId);
    if (startDate) queryBuilder = queryBuilder.gte("expected_date", startDate);
    if (endDate) queryBuilder = queryBuilder.lte("expected_date", endDate);
    if (query.search) {
      // 3-step search refactored for maximum robustness:
      // 1. Find matching Profile IDs (which are Customer IDs)
      console.log("Searching Profiles for:", query.search);
      const { data: matchingProfiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("name", `%${query.search}%`);

      if (profileError) console.error("Search Step 1 (Profiles) Error:", profileError);

      const customerIds = matchingProfiles ? matchingProfiles.map((p: any) => p.id) : [];
      let matchedProductIds: string[] = [];

      // 2. Find Products for these Customers
      if (customerIds.length > 0) {
        const { data: matchingProducts, error: productError } = await supabaseAdmin
          .from("customer_products")
          .select("id")
          .in("customer_id", customerIds); // Assuming customer_id FK links to customers(id) which matches profiles(id)

        if (productError) console.error("Search Step 2 (Products) Error:", productError);
        matchedProductIds = matchingProducts ? matchingProducts.map((p: any) => p.id) : [];
      }

      // 3. Find Schedule IDs for these Products
      let matchedScheduleIds: string[] = [];
      if (matchedProductIds.length > 0) {
        const { data: matchingSchedules, error: scheduleError } = await supabaseAdmin
          .from(this.table)
          .select("id")
          .in("customer_product_id", matchedProductIds);

        if (scheduleError) console.error("Search Step 3 (Schedules) Error:", scheduleError);
        matchedScheduleIds = matchingSchedules ? matchingSchedules.map((s: any) => s.id) : [];
      }

      // 4. Apply Filter
      if (matchedScheduleIds.length > 0) {
        const idsString = matchedScheduleIds.join(",");
        queryBuilder = queryBuilder.or(`notes.ilike.%${query.search}%,id.in.(${idsString})`);
      } else {
        queryBuilder = queryBuilder.ilike("notes", `%${query.search}%`);
      }
    }

    const { data, count, error } = await queryBuilder
      .range(from, to)
      .order("expected_date", { ascending: true }); // Upcoming first

    if (error) throw error;

    return {
      data: (data || []).map(this.mapToDomain),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Schedule | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select(
        `
        *,
        jobs ( name ),
        customer_products (
          id,
          installation_location,
          product_catalog ( name, model ),
          customers (
            id,
            profiles ( name )
          )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) return null;
    return this.mapToDomain(data);
  }

  async create(payload: CreateScheduleDTO): Promise<Schedule> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .insert({
        customer_product_id: payload.customer_product_id,
        contract_id: payload.contract_id,
        job_id: payload.job_id,
        expected_date: payload.expected_date,
        status: payload.status,
        notes: payload.notes,
      })
      .select()
      .single();

    if (error) throw error;
    // For manual create, we might return simpler object or fetch full to get joined names
    // Simplest is direct map, UI can refresh for names
    return this.mapToDomain(data);
  }

  async update(id: string, payload: UpdateScheduleDTO): Promise<Schedule> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .update({
        ...payload,
        // Ensure field mapping if needed (snake_case conversion often handled by DTO or manual here)
        // payload keys match schema snake_case mostly
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
