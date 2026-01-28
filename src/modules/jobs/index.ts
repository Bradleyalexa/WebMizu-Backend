import { Router } from "express";
import { JobsController } from "./jobs.controller";

const router = Router();
const controller = new JobsController();

router.post("/", controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
