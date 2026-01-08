export interface ProfileResponseDTO {
  id: string;
  name: string | null;
  role: "admin" | "customer";
}
