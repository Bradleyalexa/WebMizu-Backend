import { CreateContractDTO } from "./create-contract.dto";

export interface UpdateContractDTO extends Partial<CreateContractDTO> {
  services_used?: number;
  status?: "active" | "expired";
}
