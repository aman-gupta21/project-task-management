
import express from "express";

import authenticate from "../middleware/auth.middleware.js";

import {
  getSummary,
  getProjectDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// Protect all dashboard APIs
router.use(authenticate);

// Overall dashboard
router.get("/summary", getSummary);

// Individual project dashboard
router.get("/projects/:id/summary", getProjectDashboard);

export default router;
