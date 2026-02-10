export interface Contract {
  id: string;
  customerProductId: string;
  startDate: string;
  endDate: string;
  intervalMonths: number;
  totalService: number;
  servicesUsed: number;
  status: "active" | "expired";
  contractUrl: string | null;
  notes: string | null;
  createdAt: string;
  contractValue?: number;

  // Relations
  customerName?: string;
  customerId?: string;
  productName?: string;
  installationLocation?: string;
  schedules?: {
    id: string;
    expected_date: string;
    status: string;
    source_type: string;
  }[];
}
