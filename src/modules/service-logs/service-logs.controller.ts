import { Request, Response } from "express";
import { ServiceLogRepository } from "./service-log.repository";
import { updateServiceLogSchema } from "./schemas/service-log.schema";

export class ServiceLogController {
  private repository: ServiceLogRepository;

  constructor() {
    this.repository = new ServiceLogRepository();
  }

  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      if (!id) return res.status(400).json({ error: "ID is required" });

      const payload = updateServiceLogSchema.parse(req.body);
      const log = await this.repository.update(id, payload);
      res.json({ data: log });
    } catch (error: any) {
      console.error("Update Service Log Error:", error);
      res.status(400).json({ error: error.message });
    }
  };
}
