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

  async findAll(): Promise<ServiceLog[]> {
    // Basic fetch all for now, can add filtering later manually or via simple args
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
            profiles ( name )
          )
        )
      `)
      .order("service_date", { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapToDomain);
  }
}
