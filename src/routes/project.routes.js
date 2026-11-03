
import express from "express";

import authenticate from "../middleware/auth.middleware.js";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
  addMember,
  getMembers,
  removeMember,
} from "../controllers/project.controller.js";

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Project CRUD
router.post("/", create);
router.get("/", getAll);

// Project member management
router.post("/:id/members", addMember);
router.get("/:id/members", getMembers);
router.delete("/:id/members/:userId", removeMember);

// Project details and updates
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
