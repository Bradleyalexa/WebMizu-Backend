import { Request, Response, NextFunction } from "express";
import { SchedulesService } from "./schedules.service";
import { createScheduleSchema, updateScheduleSchema, scheduleQuerySchema } from "./schemas/schedule.schema";
import { SuccessResponse } from "../../../../../packages/types/api/response";

export class SchedulesController {
  private service: SchedulesService;

  constructor() {
    this.service = new SchedulesService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = createScheduleSchema.parse(req.body);
      const schedule = await this.service.create(payload);
      
      const response: SuccessResponse<typeof schedule> = {
        success: true,
        data: schedule,
        error: null
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = scheduleQuerySchema.parse(req.query);
      const { data, total } = await this.service.findAll(query);
      

      res.json({
        success: true,
        data,
        meta: {
            total,
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
        },
        error: null
      }); 
    } catch (err) {
      next(err);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (!id) throw new Error("ID is required");

      const schedule = await this.service.findOne(id);
      const response: SuccessResponse<typeof schedule> = {
        success: true,
        data: schedule,
        error: null
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (!id) throw new Error("ID is required");

      const payload = updateScheduleSchema.parse(req.body);
      const schedule = await this.service.update(id, payload);
      const response: SuccessResponse<typeof schedule> = {
        success: true,
        data: schedule,
        error: null
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (!id) throw new Error("ID is required");

      await this.service.remove(id);
      const response: SuccessResponse<null> = {
        success: true,
        data: null,
        error: null
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };
}
