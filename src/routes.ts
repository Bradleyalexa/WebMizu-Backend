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


// Health Check
routes.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});
