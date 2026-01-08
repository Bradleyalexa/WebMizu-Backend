export interface Profile {
  id: string;
  name: string | null;
  role: "admin" | "customer";
  createdAt: string | null;
}
