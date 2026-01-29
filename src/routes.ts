import { Router } from "express";
import { ProfileController } from "./modules/profiles/profile.controller";
import { TechnicianController } from "./modules/technicians/technician.controller";
import { authGuard } from "./middleware/auth.middleware";
import { roleGuard } from "./middleware/role.middleware";
import productRouter from "./modules/products/product.controller";
import categoryRouter from "./modules/categories/category.controller";

import { CustomerController } from "./modules/customers/customer.controller";

export const routes = Router();

const profileController = new ProfileController();
const technicianController = new TechnicianController();
const customerController = new CustomerController();

// Auth Routes
routes.get(
  "/auth/me",
  authGuard,
  roleGuard("admin"), // Requirement says "admin-only" for this specific endpoint example
  profileController.getMe
);

// Customer Routes
routes.get("/customers", authGuard, roleGuard("admin"), customerController.list);
routes.get("/customers/:id", authGuard, roleGuard("admin"), customerController.getOne);
routes.post("/customers", authGuard, roleGuard("admin"), customerController.create);
routes.put("/customers/:id", authGuard, roleGuard("admin"), customerController.update);
routes.delete("/customers/:id", authGuard, roleGuard("admin"), customerController.delete);

// Technician Routes
routes.get("/technicians", authGuard, roleGuard("admin"), technicianController.list);
routes.get("/technicians/:id", authGuard, roleGuard("admin"), technicianController.getOne);
routes.post("/technicians", authGuard, roleGuard("admin"), technicianController.create);
routes.patch("/technicians/:id", authGuard, roleGuard("admin"), technicianController.update);

// Product Routes (Module-based router)
routes.use("/products", productRouter);
routes.use("/categories", categoryRouter);

// Customer Product Routes
import { CustomerProductController } from "./modules/customer-products/customer-product.controller";
const customerProductController = new CustomerProductController();

routes.post("/customer-products", authGuard, roleGuard("admin"), customerProductController.create);
routes.get("/customer-products/customer/:customerId", authGuard, roleGuard("admin"), customerProductController.getByCustomer);
routes.get("/customer-products/:id", authGuard, roleGuard("admin"), customerProductController.getOne);
routes.patch("/customer-products/:id", authGuard, roleGuard("admin"), customerProductController.update);



// Contract Routes
import { ContractsController } from "./modules/contracts/contracts.controller";
const contractsController = new ContractsController();

routes.post("/contracts", authGuard, roleGuard("admin"), contractsController.create);
routes.get("/contracts", authGuard, roleGuard("admin"), contractsController.findAll);
routes.get("/contracts/:id", authGuard, roleGuard("admin"), contractsController.findOne);
routes.patch("/contracts/:id", authGuard, roleGuard("admin"), contractsController.update);
routes.delete("/contracts/:id", authGuard, roleGuard("admin"), contractsController.remove);

// Jobs Routes
import jobsRouter from "./modules/jobs";
routes.use("/jobs", authGuard, roleGuard("admin"), jobsRouter);

// Schedule Routes
// Schedule Routes
import schedulesRouter from "./modules/schedules";
import tasksRouter from "./modules/tasks";
import serviceLogsRouter from "./modules/service-logs";

routes.use("/schedules", authGuard, roleGuard("admin"), schedulesRouter);
routes.use("/tasks", authGuard, roleGuard("admin"), tasksRouter);
routes.use("/service-logs", authGuard, roleGuard("admin"), serviceLogsRouter);

// Health Check
routes.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});
