
import prisma from "../config/database.js";

// Create custom errors
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Check whether user belongs to project
const getProjectAccess = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    include: {
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!project) {
    throw createError(
      "Project not found or access denied",
      404
    );
  }

  const isOwner = project.ownerId === userId;
  const isAdmin =
    isOwner || project.members[0]?.role === "ADMIN";

  return { project, isOwner, isAdmin };
};

// Check if assigned user belongs to project
const validateAssignee = async (projectId, assignedToId) => {
  if (!assignedToId) return;

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: assignedToId,
      },
    },
  });

  if (!membership) {
    throw createError(
      "Assigned user is not a member of this project",
      400
    );
  }
};

// Get task and verify project access
const getTaskAccess = async (taskId, userId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: {
            where: { userId },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!task) {
    throw createError("Task not found", 404);
  }

  const isMember =
    task.project.ownerId === userId ||
    task.project.members.length > 0;

  if (!isMember) {
    throw createError(
      "You do not have access to this task",
      403
    );
  }

  const isOwner = task.project.ownerId === userId;
  const isAdmin =
    isOwner ||
    task.project.members[0]?.role === "ADMIN";

  const isCreator = task.createdById === userId;
  const isAssignee = task.assignedToId === userId;

  return {
    task,
    isAdmin,
    isCreator,
    isAssignee,
  };
};

// Common task response
const taskInclude = {
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

// 1. CREATE TASK
export const createTask = async (
  projectId,
  userId,
  data
) => {
  await getProjectAccess(projectId, userId);

  if (data.assignedToId) {
    await validateAssignee(projectId, data.assignedToId);
  }

  return prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId,
      createdById: userId,
      assignedToId: data.assignedToId || null,
    },
    include: taskInclude,
  });
};

// 2. GET ALL TASKS WITH FILTERS AND PAGINATION
export const getProjectTasks = async (
  projectId,
  userId,
  filters
) => {
  await getProjectAccess(projectId, userId);

  const page = filters.page;
  const limit = filters.limit;

  const where = {
    projectId,
    ...(filters.status && {
      status: filters.status,
    }),
    ...(filters.priority && {
      priority: filters.priority,
    }),
    ...(filters.assignedToId && {
      assignedToId: filters.assignedToId,
    }),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 3. GET TASK BY ID
export const getTaskById = async (taskId, userId) => {
  const { task } = await getTaskAccess(taskId, userId);

  return prisma.task.findUnique({
    where: { id: task.id },
    include: {
      ...taskInclude,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

// 4. UPDATE TASK DETAILS
export const updateTask = async (
  taskId,
  userId,
  data
) => {
  const {
    task,
    isAdmin,
    isCreator,
  } = await getTaskAccess(taskId, userId);

  if (!isAdmin && !isCreator) {
    throw createError(
      "Only project admins or task creators can edit task details",
      403
    );
  }

  if (
    data.assignedToId !== undefined &&
    data.assignedToId !== null
  ) {
    await validateAssignee(
      task.projectId,
      data.assignedToId
    );
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && {
        title: data.title.trim(),
      }),

      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),

      ...(data.priority !== undefined && {
        priority: data.priority,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),

      ...(data.assignedToId !== undefined && {
        assignedToId: data.assignedToId,
      }),

      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    },
    include: taskInclude,
  });
};

// 5. UPDATE TASK STATUS
export const updateTaskStatus = async (
  taskId,
  userId,
  status
) => {
  const {
    isAdmin,
    isCreator,
    isAssignee,
  } = await getTaskAccess(taskId, userId);

  if (!isAdmin && !isCreator && !isAssignee) {
    throw createError(
      "Only the assignee, task creator or project admin can update status",
      403
    );
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: taskInclude,
  });
};

// 6. DELETE TASK
export const deleteTask = async (taskId, userId) => {
  const {
    isAdmin,
    isCreator,
  } = await getTaskAccess(taskId, userId);

  if (!isAdmin && !isCreator) {
    throw createError(
      "Only project admins or task creators can delete tasks",
      403
    );
  }

  return prisma.task.delete({
    where: { id: taskId },
  });
};
