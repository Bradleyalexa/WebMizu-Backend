import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/config";
import { routes } from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: true, // Allow all origins for dev, or specify ["http://localhost:3000", "http://192.168.56.1:3000"]
    credentials: true,
  }),
);

// Body Parsing
app.use(express.json());

// API Routes
app.use("/api/v1", routes);

// Global Error Handler
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(config.server.port, () => {
    console.log(`Backend server running on port ${config.server.port}`);
  });
}

export default app;
