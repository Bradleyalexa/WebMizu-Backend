export interface ServiceLog {
  id: string;
  expectedId?: string | null;
  customerProductId: string;
  technicianId: string;
  serviceDate: string;
  serviceType: 'contract' | 'perpanggil';
  pekerjaan: string;
  hargaService: number;
  teknisiFee?: number | null;
  jobEvidence?: any; // JSONB
  notes?: string | null;
  createdAt: string;

  // Joined fields
  technicianName?: string;
  customerName?: string;
  productName?: string;
  installationLocation?: string;
}
