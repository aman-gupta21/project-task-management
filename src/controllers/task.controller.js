
import { z } from "zod";

import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../services/task.service.js";

// Create task validation
const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(3000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedToId: z.string().min(1).nullable().optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
});

// Update task validation
const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(3000).nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedToId: z.string().min(1).nullable().optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

const statusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
});

// 1. CREATE TASK
export const create = async (req, res, next) => {
  try {
    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const task = await createTask(
      req.params.id,
      req.user.userId,
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET PROJECT TASKS
export const getAll = async (req, res, next) => {
  try {
    const querySchema = z.object({
      status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      assignedToId: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
    });

    const validation = querySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.issues,
      });
    }

    const result = await getProjectTasks(
      req.params.id,
      req.user.userId,
      validation.data
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET TASK DETAILS
export const getOne = async (req, res, next) => {
  try {
    const task = await getTaskById(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE TASK DETAILS
export const update = async (req, res, next) => {
  try {
    const validation = updateTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const task = await updateTask(
      req.params.id,
      req.user.userId,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 5. UPDATE TASK STATUS
export const updateStatus = async (req, res, next) => {
  try {
    const validation = statusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
        errors: validation.error.issues,
      });
    }

    const task = await updateTaskStatus(
      req.params.id,
      req.user.userId,
      validation.data.status
    );

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE TASK
export const remove = async (req, res, next) => {
  try {
    await deleteTask(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
