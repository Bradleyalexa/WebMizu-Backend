import { Router } from "express";
import { ServiceLogController } from "./service-logs.controller";

const router = Router();
const controller = new ServiceLogController();

router.put("/:id", controller.update);

export default router;
