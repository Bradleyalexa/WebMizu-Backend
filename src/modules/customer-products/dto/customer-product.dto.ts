export interface CreateCustomerProductDTO {
  customer_id: string;
  product_catalog_id: string;
  installation_technician_id?: string;
  installation_date?: string;
  installation_location?: string;
  cust_product_price?: number;
  quantity_owned?: number;
  status?: "active" | "inactive" | "tradeIn";
  description?: string;
  photo_url?: string;
  notes?: string;
}

export interface UpdateCustomerProductDTO extends Partial<CreateCustomerProductDTO> {}

export interface CustomerProductResponseDTO {
  id: string;
  customer_id: string;
  product_catalog_id: string;
  order_product_id?: string | null;
  installation_technician_id?: string | null;
  status: string;
  quantity_owned: number;
  cust_product_price?: number | null;
  installation_date?: string | null;
  installation_location?: string | null;
  description?: string | null;
  photo_url?: string | null;
  notes?: string | null;
  created_at: string;

  // Enriched fields
  product_name?: string;
  product_model?: string;
  technician_name?: string;
  contract_status?: string; // Optional: logic to fetch this
}
