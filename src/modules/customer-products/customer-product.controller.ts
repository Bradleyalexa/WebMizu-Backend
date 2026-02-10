import { Request, Response, NextFunction } from "express";
import { CustomerProductService } from "./customer-product.service";
import {
  createCustomerProductSchema,
  updateCustomerProductSchema,
} from "./schemas/customer-product.schema";
import { SuccessResponse } from "@packages/types/api/response";
import { CustomerProductResponseDTO } from "./dto/customer-product.dto";

export class CustomerProductController {
  private service: CustomerProductService;

  constructor() {
    this.service = new CustomerProductService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createCustomerProductSchema.parse(req.body);
      const result = await this.service.createCustomerProduct(body);

      const response: SuccessResponse<CustomerProductResponseDTO> = {
        success: true,
        data: result,
        error: null,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  getByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      if (!customerId) throw new Error("Customer ID is required");

      const result = await this.service.getCustomerProducts(customerId);

      const response: SuccessResponse<CustomerProductResponseDTO[]> = {
        success: true,
        data: result,
        error: null,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");

      const result = await this.service.getCustomerProductById(id);

      const response: SuccessResponse<CustomerProductResponseDTO> = {
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

      const body = updateCustomerProductSchema.parse(req.body);
      const result = await this.service.updateCustomerProduct(id, body);

      const response: SuccessResponse<CustomerProductResponseDTO> = {
        success: true,
        data: result,
        error: null,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };
}
