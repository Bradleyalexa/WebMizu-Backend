import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import { SuccessResponse } from "../../../../../packages/types/api/response";
import { ProfileResponseDTO } from "./dto/profile.response.dto";

export class ProfileController {
  private service: ProfileService;

  constructor() {
    this.service = new ProfileService();
  }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // User is guaranteed to exist due to authGuard
      const userId = res.locals.user.id;

      const profile = await this.service.getProfile(userId);

      // Map to DTO
      const dto: ProfileResponseDTO = {
        id: profile.id,
        name: profile.name,
        role: profile.role,
      };

      const response: SuccessResponse<ProfileResponseDTO> = {
        success: true,
        data: dto,
        error: null,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  };
}
