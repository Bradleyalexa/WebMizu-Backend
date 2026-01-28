import { Router } from "express";
import { SchedulesController } from "./schedules.controller";

const router = Router();
const controller = new SchedulesController();

router.post("/", controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
