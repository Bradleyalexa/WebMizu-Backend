import { Router } from "express";
import { ProfileController } from "./modules/profiles/profile.controller";
import { authGuard } from "./middleware/auth.middleware";
import { roleGuard } from "./middleware/role.middleware";

export const routes = Router();

const profileController = new ProfileController();

// Auth Routes
routes.get(
  "/auth/me",
  authGuard,
  roleGuard("admin"), // Requirement says "admin-only" for this specific endpoint example
  profileController.getMe
);

// Health Check
routes.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});
