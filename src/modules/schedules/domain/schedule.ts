export interface Schedule {
  id: string;
  customerProductId: string;
  contractId?: string;
  jobId?: string;
  expectedDate: string;
  status: 'pending' | 'scheduled' | 'done' | 'cancelled';
  notes?: string;
  createdAt: string;
  
  // Relations
  jobName?: string;
  customerName?: string;
  productName?: string;
  address?: string;
}
