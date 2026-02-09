import { supabaseAdmin } from "../../db/supabase";
import { ServiceLog } from "./domain/service-log";
import { CreateServiceLogDTO } from "./dto/service-log.dto";

export class ServiceLogRepository {
  private table = "service_log";

  private mapToDomain(row: any): ServiceLog {
    return {
      id: row.id,
      expectedId: row.expected_id,
      taskId: row.task_id,
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
      installationLocation: row.customer_products?.installation_location,
      customerAddress: row.customer_products?.customers?.address // Map address
    };
  }

  async findAll(query: { search?: string, customerProductId?: string }): Promise<ServiceLog[]> {
    const { search, customerProductId } = query;
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
            address,
            profiles ( name )
          )
        )
      `)
      .order("service_date", { ascending: false });

    if (customerProductId) {
        queryBuilder = queryBuilder.eq("customer_product_id", customerProductId);
    }

    if (search) {
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

  async create(data: CreateServiceLogDTO & { task_id?: string | null }): Promise<ServiceLog> {
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
            address,
            profiles ( name )
          )
        )
      `)
      .single();

    if (error) throw error;
    return this.mapToDomain(result);
  }

  async findByExpectedId(expectedId: string): Promise<ServiceLog | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select(`
        *,
        technicians ( name ),
        customer_products (
          id,
          installation_location,
          product_catalog ( name, model ),
          customers (
            id,
            address,
            profiles ( name )
          )
        )
      `)
      .eq("expected_id", expectedId)
      .single();

    if (error) return null;
    return this.mapToDomain(data);
  }

  async findByTaskId(taskId: string): Promise<ServiceLog | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select(`
        *,
        technicians ( name ),
        customer_products (
          id,
          installation_location,
          product_catalog ( name, model ),
          customers (
            id,
            address,
            profiles ( name )
          )
        )
      `)
      .eq("task_id", taskId)
      .single();

    if (error) return null;
    return this.mapToDomain(data);
  }

  async update(id: string, data: Partial<CreateServiceLogDTO>): Promise<ServiceLog> {
    const { data: result, error } = await supabaseAdmin
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select(`
        *,
        technicians ( name ),
        customer_products (
          id,
          installation_location,
          product_catalog ( name, model ),
          customers (
            id,
            address,
            profiles ( name )
          )
        )
      `)
      .single();

    if (error) throw error;
    return this.mapToDomain(result);
  }
}
