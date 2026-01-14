import { Router, Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import { createProductSchema, updateProductSchema } from "./schemas/product.schema";
import { authGuard } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";

const router = Router();
const service = new ProductService();

router.get(
  "/",
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const q = req.query['q'] as string;
      const categoryId = req.query['categoryId'] as string;
      const offset = (page - 1) * limit;

      const result = await service.findAll({ limit, offset, q, categoryId });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (!id) throw new Error("ID is required");
      const result = await service.findOne(id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authGuard,
  roleGuard("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = createProductSchema.parse(req.body);
      const result = await service.create(payload);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  authGuard,
  roleGuard("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (!id) throw new Error("ID is required");
      const payload = updateProductSchema.parse(req.body);
      const result = await service.update(id, payload);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authGuard,
  roleGuard("admin"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'];
      if (!id) throw new Error("ID is required");
      await service.delete(id);
      res.json({ success: true, message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
