import { Request, Response } from "express";
import { CustomerService } from "./customer.service";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from "./schemas/customer.schema";

export class CustomerController {
  private customerService = new CustomerService();

  list = async (req: Request, res: Response) => {
    try {
      // Validate query params
      const query = customerQuerySchema.parse(req.query);
      const result = await this.customerService.findAll(query);
      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 10,
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      const customer = await this.customerService.findById(id);
      res.json({ success: true, data: customer });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      // Validate body
      const payload = createCustomerSchema.parse(req.body);
      const customer = await this.customerService.create(payload);
      res.status(201).json({ success: true, data: customer });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      const payload = updateCustomerSchema.parse(req.body);
      const customer = await this.customerService.update(id, payload);
      res.json({ success: true, data: customer });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      await this.customerService.delete(id);
      res.json({ success: true, message: "Customer deactivated successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
