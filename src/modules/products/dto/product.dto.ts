export type CreateProductDTO = {
  name: string;
  description?: string;
  price?: number;
  model?: string;
  categoryId?: string;
  imageUrl?: string;
};

export type UpdateProductDTO = Partial<CreateProductDTO>;

export type ProductResponseDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  model: string | null;
  categoryId: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
};
