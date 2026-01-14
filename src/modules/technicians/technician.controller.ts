import { Request, Response, NextFunction } from "express";
import { TechnicianService } from "./technician.service";
import { TechnicianResponseDTO } from "./dto/technician.dto";
import { createTechnicianSchema, updateTechnicianSchema } from "./schemas/technician.schema";
import { SuccessResponse } from "../../../../../packages/types/api/response";
import { z } from "zod";

export class TechnicianController {
  private service: TechnicianService;

  constructor() {
    this.service = new TechnicianService();
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 20;
      const offset = (page - 1) * limit;
      const q = req.query["q"] as string;

      const result = await this.service.getTechnicians({ limit, offset, q });

      res.json({
        success: true,
        data: {
          items: result.items.map(this.toDTO),
          total: result.total,
          page,
          limit
        },
        error: null,
      });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createTechnicianSchema.parse(req.body);
      const technician = await this.service.createTechnician(body);
      
      const response: SuccessResponse<TechnicianResponseDTO> = {
        success: true,
        data: this.toDTO(technician),
        error: null
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const body = updateTechnicianSchema.parse(req.body);

      const technician = await this.service.updateTechnician(id!, body);

      const response: SuccessResponse<TechnicianResponseDTO> = {
        success: true,
        data: this.toDTO(technician),
        error: null
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const technician = await this.service.getTechnicianById(id!);

      const response: SuccessResponse<TechnicianResponseDTO> = {
        success: true,
        data: this.toDTO(technician),
        error: null
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  private toDTO(tech: any): TechnicianResponseDTO {
    return {
      id: tech.id,
      name: tech.name,
      phone: tech.phone,
      photo_url: tech.photoUrl, // map Domain camelCase to DTO snake_case
      notes: tech.notes,
      created_at: tech.createdAt
    };
  }
}
