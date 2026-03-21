import { supabaseAdmin } from "../../db/supabase";
import { Contract } from "./domain/contract";

export class ContractsRepository {
  private readonly table = "contracts";
  private readonly scheduleTable = "schedule_expected";

  // Lightweight query for list view - only columns actually rendered in the table
  private readonly selectQueryList = `
    id,
    status,
    start_date,
    end_date,
    total_service,
    services_used,
    created_at,
    customer_products (
      customer_id,
      installation_location,
      customers (
        id,
        profiles ( name )
      ),
      product_catalog (
        name,
        model
      )
    )
  `;

  // Full query for detail view - includes all schedules
  private readonly selectQuery = `
    *,
    customer_products (
      id,
      customer_id,
      cust_product_price,
      installation_location,
      customers (
        id,
        profiles (
            name
        )
      ),
      product_catalog (
        name,
        model
      )
    ),
    schedule_expected (
      id,
      expected_date,
      status,
      source_type,
      tasks ( id )
    )
  `;


  async createSchedules(schedules: any[]): Promise<void> {
    const { error } = await supabaseAdmin.from(this.scheduleTable).insert(schedules);

    if (error) throw error;
  }

  async findAll(query?: { status?: string; productName?: string; customerId?: string; page?: number; limit?: number }): Promise<{ data: Contract[]; total: number }> {
    const pageNum = Number(query?.page) || 1;
    const limitNum = Number(query?.limit) || 20; // Reduced default: 20 rows is plenty for the list view
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // Filtering by product name requires !inner joins to push predicates into the JOIN
    const needsInnerJoin = !!query?.productName;
    const selectString = needsInnerJoin
      ? `
          id, status, start_date, end_date, total_service, services_used, created_at,
          customer_products!inner (
            customer_id,
            installation_location,
            customers!inner ( id, profiles!inner ( name ) ),
            product_catalog!inner ( name, model )
          )
        `
      : this.selectQueryList;

    // Skip count for customer-detail requests — they don't paginate and count is expensive
    const needsCount = !query?.customerId;

    let queryBuilder = supabaseAdmin
      .from(this.table)
      .select(selectString, needsCount ? { count: "planned" } : { count: undefined });

    if (query?.status && query.status !== "all") {
      queryBuilder = queryBuilder.eq("status", query.status as any);
    }

    if (query?.customerId) {
      queryBuilder = queryBuilder.eq("customer_products.customer_id", query.customerId);
    }

    if (query?.productName) {
      const term = `%${query.productName}%`;
      queryBuilder = queryBuilder.or(
        `customer_products.product_catalog.name.ilike.${term},customer_products.customers.profiles.name.ilike.${term},customer_products.product_catalog.model.ilike.${term}`
      );
    }

    const { data, count, error } = await queryBuilder
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Fetch Contracts Error:", error);
      throw error;
    }

    const contracts = (data || []).map((row: any) => this.mapToDomain(row));

    return {
      data: contracts,
      total: count || 0,
    };
  }

  private mapToDomain(row: any, signedUrl?: string | null): Contract {
    return {
      id: row.id,
      customerProductId: row.customer_product_id,
      startDate: row.start_date,
      endDate: row.end_date,
      intervalMonths: row.interval_months,
      totalService: row.total_service,
      servicesUsed: row.services_used,
      status: row.status as any,
      contractUrl: signedUrl !== undefined ? signedUrl : row.contract_url,
      notes: row.notes,
      createdAt: row.created_at,

      customerName: row.customer_products?.customers?.profiles?.name,
      customerId: row.customer_products?.customers?.id,
      productName:
        `${row.customer_products?.product_catalog?.name || ""} ${row.customer_products?.product_catalog?.model || ""}`.trim(),
      installationLocation: row.customer_products?.installation_location,
      schedules: (row.schedule_expected || [])
        .sort((a: any, b: any) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime())
        .map((s: any) => ({
          ...s,
          taskId: s.tasks?.[0]?.id,
        })),
      contractValue: row.price || 0,
    };
  }

  async findById(id: string): Promise<Contract | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select(this.selectQuery)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    const signedUrl = await this.signContractUrl(data.contract_url);
    return this.mapToDomain(data, signedUrl);
  }

  async update(id: string, data: any): Promise<Contract> {
    const { data: updated, error } = await supabaseAdmin
      .from(this.table)
      .update(data)
      .eq("id", id)
      .select(this.selectQuery)
      .single();

    if (error) throw error;
    
    const signedUrl = await this.signContractUrl(updated.contract_url);
    return this.mapToDomain(updated, signedUrl);
  }

  async create(data: any): Promise<Contract> {
    const { data: created, error } = await supabaseAdmin
      .from(this.table)
      .insert(data)
      .select(this.selectQuery)
      .single();

    if (error) throw error;
    
    const signedUrl = await this.signContractUrl(created.contract_url);
    return this.mapToDomain(created, signedUrl);
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from(this.table).delete().eq("id", id);

    if (error) throw error;
  }

  private async signContractUrl(pathOrUrl: string | null): Promise<string | null> {
    if (!pathOrUrl) return null;

    let path = pathOrUrl;

    if (pathOrUrl.startsWith("http") && pathOrUrl.includes("/documents/")) {
      try {
        const parts = pathOrUrl.split("/documents/");
        if (parts.length > 1) {
          path = decodeURIComponent(parts[1]);
        }
      } catch (e) {
        console.warn("Failed to parse legacy public URL:", pathOrUrl);
      }
    }

    try {
      const { data, error } = await supabaseAdmin.storage
        .from("documents")
        .createSignedUrl(path, 3600);

      if (error || !data) {
        console.warn(`Failed to sign contract URL for path ${path}:`, error);
        return pathOrUrl;
      }

      return data.signedUrl;
    } catch (e) {
      console.warn(`Exception signing contract URL for path ${path}:`, e);
      return pathOrUrl;
    }
  }
}
