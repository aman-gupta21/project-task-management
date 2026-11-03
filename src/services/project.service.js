
import prisma from "../config/database.js";

// Helper: create HTTP errors
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Helper: check project access
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
        select: {
          role: true,
        },
      },
    },
  });

  if (!project) {
    throw createError("Project not found or access denied", 404);
  }

  const isOwner = project.ownerId === userId;
  const isAdmin =
    isOwner || project.members[0]?.role === "ADMIN";

  return { project, isOwner, isAdmin };
};

// 1. CREATE PROJECT
export const createProject = async (userId, data) => {
  return prisma.$transaction(async (tx) => {
    // Create project
    const project = await tx.project.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        ownerId: userId,
      },
    });

    // Automatically add creator as ADMIN
    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: "ADMIN",
      },
    });

    return project;
  });
};

// 2. GET ALL USER PROJECTS
export const getProjects = async (userId) => {
  return prisma.project.findMany({
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
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// 3. GET PROJECT BY ID
export const getProjectById = async (projectId, userId) => {
  const { project } = await getProjectAccess(projectId, userId);

  return prisma.project.findUnique({
    where: { id: project.id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
};

// 4. UPDATE PROJECT
export const updateProject = async (
  projectId,
  userId,
  data
) => {
  const { isAdmin } = await getProjectAccess(
    projectId,
    userId
  );

  if (!isAdmin) {
    throw createError(
      "Only project admins can update this project",
      403
    );
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name !== undefined && {
        name: data.name.trim(),
      }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
    },
  });
};

// 5. DELETE PROJECT
export const deleteProject = async (projectId, userId) => {
  const { project, isOwner } = await getProjectAccess(
    projectId,
    userId
  );

  if (!isOwner) {
    throw createError(
      "Only the project owner can delete this project",
      403
    );
  }

  return prisma.project.delete({
    where: { id: project.id },
  });
};

// 6. ADD PROJECT MEMBER
export const addProjectMember = async (
  projectId,
  userId,
  data
) => {
  const { isAdmin, isOwner } = await getProjectAccess(
    projectId,
    userId
  );

  if (!isAdmin) {
    throw createError(
      "Only project admins can add members",
      403
    );
  }

  // Only owner can promote members to ADMIN
  if (data.role === "ADMIN" && !isOwner) {
    throw createError(
      "Only the project owner can assign ADMIN role",
      403
    );
  }

  // Find user by email
  const member = await prisma.user.findUnique({
    where: {
      email: data.email.trim().toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!member) {
    throw createError("User does not exist", 404);
  }

  // Check existing membership
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: member.id,
      },
    },
  });

  if (existingMember) {
    throw createError(
      "User is already a project member",
      409
    );
  }

  try {
    return prisma.projectMember.create({
      data: {
        projectId,
        userId: member.id,
        role: data.role || "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw createError(
        "User is already a project member",
        409
      );
    }

    throw error;
  }
};

// 7. GET PROJECT MEMBERS
export const getProjectMembers = async (
  projectId,
  userId
) => {
  await getProjectAccess(projectId, userId);

  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  });
};

// 8. REMOVE PROJECT MEMBER
export const removeProjectMember = async (
  projectId,
  requesterId,
  targetUserId
) => {
  const { project, isAdmin, isOwner } =
    await getProjectAccess(projectId, requesterId);

  if (!isAdmin) {
    throw createError(
      "Only project admins can remove members",
      403
    );
  }

  // Project owner cannot be removed
  if (targetUserId === project.ownerId) {
    throw createError(
      "Project owner cannot be removed",
      400
    );
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: targetUserId,
      },
    },
  });

  if (!membership) {
    throw createError(
      "Project member not found",
      404
    );
  }

  // Only owner can remove another ADMIN
  if (membership.role === "ADMIN" && !isOwner) {
    throw createError(
      "Only the project owner can remove an ADMIN",
      403
    );
  }

  return prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId: targetUserId,
      },
    },
  });
};
