
import express from "express";

import authenticate from "../middleware/auth.middleware.js";

import {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  remove,
} from "../controllers/task.controller.js";

const router = express.Router();

// Protect every task endpoint
router.use(authenticate);

// Task CRUD and status
router.get("/projects/:id/tasks", getAll);
router.post("/projects/:id/tasks", create);

router.patch("/:id/status", updateStatus);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
