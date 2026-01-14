import { Router, Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";
import { authGuard } from "../../middleware/auth.middleware";

const router = Router();
const service = new CategoryService();

router.get(
  "/",
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.findAll();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
