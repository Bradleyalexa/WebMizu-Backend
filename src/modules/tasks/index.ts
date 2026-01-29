import { Router } from "express";
import { TasksController } from "./tasks.controller";

const router = Router();
const controller = new TasksController();

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.post("/:id/complete", controller.complete);

export default router;
