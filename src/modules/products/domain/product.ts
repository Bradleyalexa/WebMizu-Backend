export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  model: string | null;
  categoryId: string | null;
  imageUrl: string | null;
  createdAt: string | null;
};

export type ProductCategory = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | null;
};
