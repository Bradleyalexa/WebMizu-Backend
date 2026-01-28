export interface Job {
  id: string;
  name: string;
  description?: string | null;
  defaultPrice: number;
  createdAt: string;
}
