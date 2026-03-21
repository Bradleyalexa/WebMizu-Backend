import { Request, Response, NextFunction } from "express";
import { ContractsService } from "./contracts.service";
import { createContractSchema, updateContractSchema } from "./schemas/contract.schema";
import { SuccessResponse } from "@packages/types/api/response";

import { Contract } from "./domain/contract";

export class ContractsController {
  private service: ContractsService;

  constructor() {
    this.service = new ContractsService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createContractSchema.parse(req.body);
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
      const status = req.query["status"] as string;
      const productName = req.query["productName"] as string;
      const customerId = req.query["customerId"] as string;
      const page = req.query["page"] ? parseInt(req.query["page"] as string) : 1;
      const limit = req.query["limit"] ? parseInt(req.query["limit"] as string) : 50;

      const result = await this.service.findAll({
        status: status === "all" ? undefined : status,
        productName,
        customerId,
        page,
        limit,
      });

      const response: SuccessResponse<Contract[]> = {
        success: true,
        data: result.data,
        error: null,
      } as any;

      // Add total to response for frontend awareness
      (response as any).total = result.total;

      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID is required");

      const result = await this.service.findOne(id);
      if (!result) {
        return res.status(404).json({ success: false, data: null, error: "Contract not found" });
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
      const id = req.params.id as string;
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
      const id = req.params.id as string;
      if (!id) throw new Error("ID is required");

      await this.service.remove(id);

      const response: SuccessResponse<null> = {
        success: true,
        data: null,
        error: null,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };
}
