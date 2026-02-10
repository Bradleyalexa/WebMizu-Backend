export interface CreateContractDTO {
  customer_product_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  interval_months: number;
  total_service: number;
  contract_url?: string;
  notes?: string;
  price?: number;
}
