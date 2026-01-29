import { supabaseAdmin } from "../../db/supabase";
import { ServiceLog } from "./domain/service-log";

export class ServiceLogRepository {
  private table = "service_log";

  private mapToDomain(row: any): ServiceLog {
    return {
      id: row.id,
      expectedId: row.expected_id,
      customerProductId: row.customer_product_id,
      technicianId: row.technician_id,
      serviceDate: row.service_date,
      serviceType: row.service_type,
      pekerjaan: row.pekerjaan,
      hargaService: row.harga_service,
      teknisiFee: row.teknisi_fee,
      jobEvidence: row.job_evidence,
      notes: row.notes,
      createdAt: row.created_at,

      // Relations
      technicianName: row.technicians?.name || "Unknown",
      customerName: row.customer_products?.customers?.profiles?.name || row.customer_products?.customers?.name || "Unknown",
      productName: row.customer_products?.product_catalog?.name || "Unknown Product",
      productModel: row.customer_products?.product_catalog?.model,
      installationLocation: row.customer_products?.installation_location
    };
  }

  async findAll(search?: string): Promise<ServiceLog[]> {
    let queryBuilder = supabaseAdmin
      .from(this.table)
      .select(`
        *,
        technicians ( name ),
        customer_products!inner (
          id,
          installation_location,
          product_catalog ( name, model ),
          customers!inner (
            id,
            profiles ( name )
          )
        )
      `)
      .order("service_date", { ascending: false });

    if (search) {
        // Search logic: customer name or product name
        // Supabase foreign table search is tricky, easiest is to rely on !inner joins and filter there if possible
        // or just local filter if dataset is small. But let's try direct filters if supabase allows OR across relations (hard).
        // Since we are doing !inner, we can filter on the *joined* columns? No, need direct column syntax like "customers.profiles.name.ilike.%search%"
        
        // Simpler approach for now: Post-filter or complex OR raw filter. 
        // Let's use !inner and filter on customer name or product name
        // The !inner forces the join, so we can filter on the relation's column if we use the right syntax.
        // Actually, for multiple OR conditions across tables, it's safer to fetch more and filter unless we use complex RPC.
        // Let's stick to a robust simple search which search strictly on "pekerjaan" (job) or similar locally first.
        // If the user wants to search by customer name, we need to embed it. 
        
        // Robust search: Customer Name OR Job OR Notes
        // 1. Find matching matching Customer IDs via Profiles
        const { data: matchingProfiles, error: profileError } = await supabaseAdmin
             .from('profiles')
             .select('id')
             .ilike('name', `%${search}%`);
        
        let customerIds: string[] = [];
        if (!profileError && matchingProfiles) {
             customerIds = matchingProfiles.map((p: any) => p.id);
        }

        // 2. Find matching Product IDs for these customers (Service Log links to CustomerProduct, not Customer directly)
        let customerProductIds: string[] = [];
        if (customerIds.length > 0) {
             const { data: matchingProducts, error: productError } = await supabaseAdmin
                 .from('customer_products')
                 .select('id')
                 .in('customer_id', customerIds);
             
             if (!productError && matchingProducts) {
                 customerProductIds = matchingProducts.map((p: any) => p.id);
             }
        }
        
        // 3. Construct Query
        let orQuery = `pekerjaan.ilike.%${search}%,notes.ilike.%${search}%`;
        if (customerProductIds.length > 0) {
            const idsString = customerProductIds.join(',');
            // customer_product_id is the FK in service_log
            orQuery += `,customer_product_id.in.(${idsString})`;
        }
        
        queryBuilder = queryBuilder.or(orQuery);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return (data || []).map(this.mapToDomain);
  }

  async create(data: CreateServiceLogDTO): Promise<ServiceLog> {
    const { data: result, error } = await supabaseAdmin
      .from(this.table)
      .insert(data)
      .select(`
        *,
        technicians ( name ),
        customer_products (
          id,
          installation_location,
          product_catalog ( name, model ),
          customers (
            id,
            profiles ( name )
          )
        )
      `)
      .single();

    if (error) throw error;
    return this.mapToDomain(result);
  }
}
