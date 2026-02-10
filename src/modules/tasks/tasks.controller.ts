import { Request, Response } from "express";
import { TasksService } from "./tasks.service";
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "./schemas/task.schema";

export class TasksController {
  private service: TasksService;

  constructor() {
    this.service = new TasksService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const query = taskQuerySchema.parse(req.query);
      const result = await this.service.findAll(query);
      res.json({
        data: result.data,
        meta: {
          total: result.total,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 10,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const task = await this.service.findById(id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json({ data: task });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const payload = createTaskSchema.parse(req.body);
      const task = await this.service.create(payload);
      res.status(201).json({ data: task });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const payload = updateTaskSchema.parse(req.body);
      const task = await this.service.update(id, payload);
      res.json({ data: task });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "ID is required" });
      await this.service.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  complete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "ID is required" });

      // We validate body against Service Log schema, NOT Task schema
      // We need to import createServiceLogSchema
      const { createServiceLogSchema } = require("../service-logs/schemas/service-log.schema");
      const payload = createServiceLogSchema.parse(req.body);

      const result = await this.service.completeTask(id, payload);
      res.status(201).json({ data: result });
    } catch (error: any) {
      console.error("Complete Task Error:", error);
      res.status(400).json({ error: error.message });
    }
  };
}
