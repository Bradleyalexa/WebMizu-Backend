import { Request, Response } from "express";
import { ServiceLogRepository } from "./service-log.repository";
import { updateServiceLogSchema } from "./schemas/service-log.schema";

export class ServiceLogController {
  private repository: ServiceLogRepository;

  constructor() {
    this.repository = new ServiceLogRepository();
  }

  findAll = async (req: Request, res: Response, next: any) => {
    try {
      const search = req.query["search"] as string;
      const customerProductId = req.query["customerProductId"] as string;
      const customerId = req.query["customerId"] as string;

      const logs = await this.repository.findAll({
        search,
        customerProductId,
        customerId,
      });

      res.json({ success: true, data: logs });
    } catch (error: any) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: any) => {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ success: false, error: "ID is required" });

      const payload = updateServiceLogSchema.parse(req.body);
      const log = await this.repository.update(id, payload);
      res.json({ success: true, data: log });
    } catch (error: any) {
      next(error);
    }
  };
}
