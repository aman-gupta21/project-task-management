
import prisma from "../config/database.js";

// Helper: calculate completion percentage
const calculatePercentage = (completed, total) => {
  if (total === 0) return 0;

  return Number(((completed / total) * 100).toFixed(2));
};

// Helper: get all projects accessible to a user
const getUserProjectIds = async (userId) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
    },
  });

  return projects;
};

// Helper: calculate task statistics
const getTaskStatistics = async (where) => {
  const now = new Date();

  const [
    totalTasks,
    statusGroups,
    priorityGroups,
    overdueTasks,
    assigneeGroups,
  ] = await Promise.all([
    prisma.task.count({ where }),

    prisma.task.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),

    prisma.task.groupBy({
      by: ["priority"],
      where,
      _count: {
        _all: true,
      },
    }),

    prisma.task.count({
      where: {
        ...where,
        dueDate: {
          lt: now,
        },
        status: {
          not: "COMPLETED",
        },
      },
    }),

    prisma.task.groupBy({
      by: ["assignedToId"],
      where,
      _count: {
        _all: true,
      },
    }),
  ]);

  // Convert grouped status results into an object
  const status = {
    TODO: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  };

  statusGroups.forEach((item) => {
    status[item.status] = item._count._all;
  });

  // Convert grouped priority results into an object
  const priority = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  priorityGroups.forEach((item) => {
    priority[item.priority] = item._count._all;
  });

  // Find member details for assigned tasks
  const assignedUserIds = assigneeGroups
    .map((item) => item.assignedToId)
    .filter(Boolean);

  const users = assignedUserIds.length
    ? await prisma.user.findMany({
        where: {
          id: {
            in: assignedUserIds,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    : [];

  const userMap = new Map(
    users.map((user) => [user.id, user])
  );

  const memberTaskSummary = assigneeGroups.map((item) => ({
    user: item.assignedToId
      ? userMap.get(item.assignedToId)
      : null,

    unassigned: item.assignedToId === null,

    totalTasks: item._count._all,
  }));

  return {
    totalTasks,

    status,

    priority,

    overdueTasks,

    completionPercentage: calculatePercentage(
      status.COMPLETED,
      totalTasks
    ),

    memberTaskSummary,
  };
};

// 1. OVERALL DASHBOARD
export const getDashboardSummary = async (userId) => {
  const projects = await getUserProjectIds(userId);

  const projectIds = projects.map((project) => project.id);

  const statistics = await getTaskStatistics({
    projectId: {
      in: projectIds,
    },
  });

  return {
    totalProjects: projects.length,

    totalTasks: statistics.totalTasks,

    todo: statistics.status.TODO,

    inProgress: statistics.status.IN_PROGRESS,

    completed: statistics.status.COMPLETED,

    overdue: statistics.overdueTasks,

    completionPercentage:
      statistics.completionPercentage,

    priority: statistics.priority,

    memberTaskSummary: statistics.memberTaskSummary,
  };
};

// 2. PROJECT-WISE DASHBOARD
export const getProjectSummary = async (
  projectId,
  userId
) => {
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
    select: {
      id: true,
      name: true,
      description: true,
      ownerId: true,
    },
  });

  if (!project) {
    const error = new Error(
      "Project not found or access denied"
    );

    error.statusCode = 404;

    throw error;
  }

  const statistics = await getTaskStatistics({
    projectId,
  });

  return {
    project,

    totalTasks: statistics.totalTasks,

    todo: statistics.status.TODO,

    inProgress: statistics.status.IN_PROGRESS,

    completed: statistics.status.COMPLETED,

    overdue: statistics.overdueTasks,

    completionPercentage:
      statistics.completionPercentage,

    priority: statistics.priority,

    memberTaskSummary: statistics.memberTaskSummary,
  };
};
