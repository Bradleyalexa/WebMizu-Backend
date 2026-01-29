import { supabaseAdmin } from "../../db/supabase";
import { Contract } from "./domain/contract";

export class ContractsRepository {
  private readonly table = "contracts";
  private readonly scheduleTable = "schedule_expected";
  private readonly selectQuery = `
    *,
    customer_products (
      cust_product_price,
      installation_location,
      customers (
        id,
        profiles (
            name,
            email
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

  async create(data: any): Promise<Contract> {
    const { data: created, error } = await supabaseAdmin
      .from(this.table)
      .insert(data)
      .select(this.selectQuery)
      .single();

    if (error) throw error;
    return this.mapToDomainAsync(created);
  }

  async createSchedules(schedules: any[]): Promise<void> {
    const { error } = await supabaseAdmin
      .from(this.scheduleTable)
      .insert(schedules);

    if (error) throw error;
  }

  async findAll(query?: { status?: string, productName?: string }): Promise<Contract[]> {
    let queryBuilder = supabaseAdmin
      .from(this.table)
      .select(this.selectQuery)
      .order("created_at", { ascending: false });

    if (query?.status && query.status !== 'all') {
        queryBuilder = queryBuilder.eq('status', query.status);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    
    let contracts = await Promise.all((data || []).map((row) => this.mapToDomainAsync(row)));

    // Filter by Product Name in memory (since it's a joined relation and Supabase filtering on deep joins is tricky without flat table)
    // Or we could use !inner join to filter, but mapToDomain is simpler for fuzzy search on product name if volume is low.
    // Given the structure, simple client-side/app-side filter for product name search is acceptable for MVP scale.
    if (query?.productName) {
        const lowerTerm = query.productName.toLowerCase();
        contracts = contracts.filter(c => 
            c.productName?.toLowerCase().includes(lowerTerm) || 
            c.customerName?.toLowerCase().includes(lowerTerm)
        );
    }

    return contracts;
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
    return this.mapToDomainAsync(data);
  }

  async update(id: string, data: any): Promise<Contract> {
    const { data: updated, error } = await supabaseAdmin
      .from(this.table)
      .update(data)
      .eq("id", id)
      .select(this.selectQuery)
      .single();

    if (error) throw error;
    return this.mapToDomainAsync(updated);
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(this.table)
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }

  private async signContractUrl(pathOrUrl: string | null): Promise<string | null> {
    if (!pathOrUrl) return null;
    
    let path = pathOrUrl;

    // Handle legacy Public URLs: Extract path if it matches the pattern
    // Pattern: .../storage/v1/object/public/documents/{path}
    if (pathOrUrl.startsWith('http') && pathOrUrl.includes('/documents/')) {
        try {
            // Split by 'documents/' and take the second part
            // Example: .../documents/contracts/file.pdf -> contracts/file.pdf
            const parts = pathOrUrl.split('/documents/');
            if (parts.length > 1) {
                path = decodeURIComponent(parts[1]);
            }
        } catch (e) {
            // If parsing fails, use original (likely dead, but safe fallback)
            console.warn("Failed to parse legacy public URL:", pathOrUrl);
        }
    }

    try {
      const { data, error } = await supabaseAdmin
        .storage
        .from('documents')
        .createSignedUrl(path, 3600); // 1 hour

      if (error || !data) {
        console.warn(`Failed to sign contract URL for path ${path}:`, error);
        return pathOrUrl; // Return original if signing fails
      }
      
      return data.signedUrl;
    } catch (e) {
      console.warn(`Exception signing contract URL for path ${path}:`, e);
      return pathOrUrl;
    }
  }

  private async mapToDomainAsync(row: any): Promise<Contract> {
    const signedUrl = await this.signContractUrl(row.contract_url);

    return {
      id: row.id,
      customerProductId: row.customer_product_id,
      startDate: row.start_date,
      endDate: row.end_date,
      intervalMonths: row.interval_months,
      totalService: row.total_service,
      servicesUsed: row.services_used,
      status: row.status as any,
      contractUrl: signedUrl,
      notes: row.notes,
      createdAt: row.created_at,

      // Relations
      customerName: row.customer_products?.customers?.profiles?.name,
      customerId: row.customer_products?.customers?.id, 
      productName: `${row.customer_products?.product_catalog?.name || ''} ${row.customer_products?.product_catalog?.model || ''}`.trim(),
      installationLocation: row.customer_products?.installation_location,
      schedules: (row.schedule_expected || []).map((s: any) => ({
          ...s,
          taskId: s.tasks?.[0]?.id // Map the first task ID if exists (assuming 1:1 or 1:N)
      })),
      contractValue: row.price || 0,
    };
  }
}
