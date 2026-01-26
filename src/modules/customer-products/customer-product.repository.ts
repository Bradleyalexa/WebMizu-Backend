import { supabaseAdmin } from "../../db/supabase";
import { CustomerProduct } from "./domain/customer-product";

export class CustomerProductRepository {
  private readonly table = "customer_products";
  private readonly selectQuery = `
    *,
    product_catalog (
      name,
      model
    ),
    technicians (
      name
    ),
    contracts (
      status
    ),
    order_product (
      order_id,
      status:orders(status)
    )
  `;

  async create(data: any): Promise<CustomerProduct> {
    const { data: created, error } = await supabaseAdmin
      .from(this.table)
      .insert(data)
      .select(this.selectQuery)
      .single();

    if (error) throw error;
    return this.mapToDomainAsync(created);
  }

  async findByCustomerId(customerId: string): Promise<CustomerProduct[]> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select(this.selectQuery)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Map in parallel
    return Promise.all((data || []).map((row) => this.mapToDomainAsync(row)));
  }

  async findById(id: string): Promise<CustomerProduct | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select(this.selectQuery)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return this.mapToDomainAsync(data);
  }

  async update(id: string, data: any): Promise<CustomerProduct> {
    const { data: updated, error } = await supabaseAdmin
      .from(this.table)
      .update(data)
      .eq("id", id)
      .select(this.selectQuery)
      .single();

    if (error) throw error;
    return this.mapToDomainAsync(updated);
  }

  private async signPhotoUrl(pathOrUrl: string | null): Promise<string | null> {
    if (!pathOrUrl) return null;
    
    // If it's already a full URL (http/https), assume it's legacy public or external
    if (pathOrUrl.startsWith('http')) return pathOrUrl;

    // Otherwise, assume it's a path in the 'customer-product' bucket
    try {
      const { data, error } = await supabaseAdmin
        .storage
        .from('customer-product')
        .createSignedUrl(pathOrUrl, 3600); // 1 hour expiry

      if (error || !data) {
        console.warn(`Failed to sign URL for path ${pathOrUrl}:`, error);
        return pathOrUrl; // Fallback to raw path if signing fails
      }
      
      return data.signedUrl;
    } catch (e) {
      console.warn(`Exception signing URL for path ${pathOrUrl}:`, e);
      return pathOrUrl;
    }
  }

  private async mapToDomainAsync(row: any): Promise<CustomerProduct> {
    // Determine contract status (active if any active contract exists)
    const contracts = row.contracts || [];
    const activeContract = contracts.some((c: any) => c.status === 'active');
    const contractStatus = activeContract ? 'Active' : (contracts.length > 0 ? 'Expired' : 'No Contract');

    // Get order status if linked
    const orderStatus = row.order_product?.orders?.status || 'Manual';

    // Sign the URL if present
    const signedUrl = await this.signPhotoUrl(row.photo_url);

    return {
      id: row.id,
      customerId: row.customer_id,
      productCatalogId: row.product_catalog_id,
      orderProductId: row.order_product_id,
      installationTechnicianId: row.installation_technician_id,
      status: row.status,
      quantityOwned: row.quantity_owned,
      custProductPrice: row.cust_product_price,
      installationDate: row.installation_date,
      installationLocation: row.installation_location,
      description: row.description,
      photoUrl: signedUrl,
      notes: row.notes,
      createdAt: row.created_at,
      
      // Joined fields
      productName: row.product_catalog?.name,
      productModel: row.product_catalog?.model,
      technicianName: row.technicians?.name,
      orderStatus: orderStatus as string,
      contractStatus: contractStatus
    } as CustomerProduct & { contractStatus: string };
  }
}
