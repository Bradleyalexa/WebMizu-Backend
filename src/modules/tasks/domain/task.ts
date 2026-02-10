export interface Task {
  id: string;
  taskDate: string; // ISO string (timestamptz)
  customerId?: string;
  customerProductId?: string;
  expectedId?: string; // Link to schedule
  contractId?: string;
  technicianId?: string;
  jobId?: string; // New FK
  title: string;
  description?: string;
  taskType?: "general" | "service";
  status: "pending" | "completed" | "canceled";
  createdAt: string;

  // Relations
  customerName?: string;
  technicianName?: string;
  jobName?: string;
  address?: string; // From customer_product
  productName?: string;
  productModel?: string;
}
