import { Request, Response, NextFunction } from "express";
import { JobsService } from "./jobs.service";
import { createJobSchema, updateJobSchema, jobQuerySchema } from "./schemas/job.schema";
// Assuming referencing same path as contracts controller
import { SuccessResponse } from "@packages/types/api/response";

export class JobsController {
  private service: JobsService;

  constructor() {
    this.service = new JobsService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = createJobSchema.parse(req.body);
      const job = await this.service.create(payload);

      const response: SuccessResponse<typeof job> = {
        success: true,
        data: job,
        error: null,
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = jobQuerySchema.parse(req.query);
      const { data, total } = await this.service.findAll(query);

      const response: SuccessResponse<typeof data> = {
        success: true,
        data,
        error: null,
        // meta is apparently not in SuccessResponse?
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params["id"] as string; // Fix index signature
      if (!id) throw new Error("ID is required");

      const job = await this.service.findOne(id);
      const response: SuccessResponse<typeof job> = {
        success: true,
        data: job,
        error: null,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params["id"] as string; // Fix index signature
      if (!id) throw new Error("ID is required");

      const payload = updateJobSchema.parse(req.body);
      const job = await this.service.update(id, payload);
      const response: SuccessResponse<typeof job> = {
        success: true,
        data: job,
        error: null,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params["id"] as string; // Fix index signature
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
