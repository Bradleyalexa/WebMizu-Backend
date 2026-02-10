export interface CustomerProduct {
  id: string;
  customerId: string;
  productCatalogId: string;
  orderProductId?: string | null;
  installationTechnicianId?: string | null;
  status: "active" | "inactive" | "tradeIn";
  quantityOwned: number;
  custProductPrice?: number | null;
  installationDate?: string | null; // ISO Date string
  installationLocation?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
  createdAt: string;

  // Joined fields
  productName?: string;
  productModel?: string;
  technicianName?: string;
  orderStatus?: string;
}
