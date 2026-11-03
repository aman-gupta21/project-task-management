
import { z } from "zod";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectMembers,
  removeProjectMember,
} from "../services/project.service.js";

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

const addMemberSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

// 1. CREATE PROJECT
export const create = async (req, res, next) => {
  try {
    const validation = createProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const project = await createProject(
      req.user.userId,
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL PROJECTS
export const getAll = async (req, res, next) => {
  try {
    const projects = await getProjects(req.user.userId);

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET PROJECT DETAILS
export const getOne = async (req, res, next) => {
  try {
    const project = await getProjectById(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE PROJECT
export const update = async (req, res, next) => {
  try {
    const validation = updateProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const project = await updateProject(
      req.params.id,
      req.user.userId,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE PROJECT
export const remove = async (req, res, next) => {
  try {
    await deleteProject(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 6. ADD PROJECT MEMBER
export const addMember = async (req, res, next) => {
  try {
    const validation = addMemberSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const member = await addProjectMember(
      req.params.id,
      req.user.userId,
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// 7. GET PROJECT MEMBERS
export const getMembers = async (req, res, next) => {
  try {
    const members = await getProjectMembers(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// 8. REMOVE PROJECT MEMBER
export const removeMember = async (req, res, next) => {
  try {
    await removeProjectMember(
      req.params.id,
      req.user.userId,
      req.params.userId
    );

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
