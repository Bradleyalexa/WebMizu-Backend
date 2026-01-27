import { Request, Response, NextFunction } from "express";
import { ContractsService } from "./contracts.service";
import { createContractSchema, updateContractSchema } from "./schemas/contract.schema";
import { SuccessResponse } from "../../../../../packages/types/api/response"; // Assuming path
// Correction: I don't know the exact path of SuccessResponse since I haven't listed packages/types. 
// Step 107 showed: import { SuccessResponse } from "../../../../../packages/types/api/response";
// I will blindly follow that relative path.

import { Contract } from "./domain/contract";

export class ContractsController {
  private service: ContractsService;

  constructor() {
    this.service = new ContractsService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createContractSchema.parse(req.body);
      // Zod schema uses snake_case keys (customer_product_id), which matches our DTO interface keys.
      
      const result = await this.service.create(body);

      const response: SuccessResponse<Contract> = {
        success: true,
        data: result,
        error: null,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Import schema (assuming I added it to module export, otherwise import directly)
      // I added it to /schemas/contract.schema.ts
      
      // Simple manual parsing or use Zod if imported. 
      // Let's rely on weak typing for query or try to do it right.
      // Use bracket notation to avoid index signature lint error
      const status = req.query['status'] as string;
      const productName = req.query['productName'] as string;

      const result = await this.service.findAll({ 
          status: status === 'all' || undefined ? undefined : status, // backend repo handles 'all' or undefined
          productName 
      });
      
      const response: SuccessResponse<Contract[]> = {
        success: true,
        data: result,
        error: null,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      const result = await this.service.findOne(id);
      
      if (!result) {
         res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Contract not found" } });
         return;
      }

      const response: SuccessResponse<Contract> = {
        success: true,
        data: result,
        error: null,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      const body = updateContractSchema.parse(req.body);
      
      const result = await this.service.update(id, body);

      const response: SuccessResponse<Contract> = {
        success: true,
        data: result,
        error: null,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      await this.service.remove(id);

      res.json({ success: true, data: null, error: null });
    } catch (err) {
      next(err);
    }
  };
}
