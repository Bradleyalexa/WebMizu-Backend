import { Router } from "express";
import { ProfileController } from "./modules/profiles/profile.controller";
import { TechnicianController } from "./modules/technicians/technician.controller";
import { authGuard } from "./middleware/auth.middleware";
import { roleGuard } from "./middleware/role.middleware";

export const routes = Router();

const profileController = new ProfileController();
const technicianController = new TechnicianController();

// Auth Routes
routes.get(
  "/auth/me",
  authGuard,
  roleGuard("admin"), // Requirement says "admin-only" for this specific endpoint example
  profileController.getMe
);

// Technician Routes
routes.get("/technicians", authGuard, roleGuard("admin"), technicianController.list);
routes.get("/technicians/:id", authGuard, roleGuard("admin"), technicianController.getOne);
routes.post("/technicians", authGuard, roleGuard("admin"), technicianController.create);
routes.patch("/technicians/:id", authGuard, roleGuard("admin"), technicianController.update);

// Health Check
routes.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});
