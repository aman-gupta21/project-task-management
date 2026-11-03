
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import { authLimiter } from "./middleware/rateLimit.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Security
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json({ limit: "10kb" }));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Project Management API is running",
  });
});

// Authentication
app.use("/api/auth", authLimiter, authRoutes);

// Projects
app.use("/api/projects", projectRoutes);

// Tasks
app.use("/api/tasks", taskRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler MUST be last
app.use(errorHandler);

export default app;
