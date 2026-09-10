import { prisma } from "../config/prisma";
import { ProjectStatus } from "../../generated/prisma/client";
import { AppError } from "../utils/AppError";

type CreateProjectData = {
    orderId: string;
    name: string;
    startDate?: string;
    endDate?: string;
};

export const createProject = async (
    data: CreateProjectData
) => {
    const order = await prisma.order.findUnique({
        where: {
            id: data.orderId,
        },
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.status !== "APPROVED") {
        throw new AppError(
            "Order must be approved before creating a project",
            400
        );
    }

    return await prisma.project.create({
        data: {
            orderId: data.orderId,
            name: data.name,

            startDate: data.startDate
                ? new Date(data.startDate)
                : undefined,

            endDate: data.endDate
                ? new Date(data.endDate)
                : undefined,
        },

        include: {
            order: {
                include: {
                    client: true,
                    orderItems: {
                        include: {
                            service: true,
                        },
                    },
                },
            },

            projectEmployees: {
                include: {
                    employee: true,
                },
            },
        },
    });
};


// Get all projects

export const getProjects = async (
    userId: string,
    role: string
) => {
    let where = {};

    if (role === "CLIENT") {
        where = {
            order: {
                client: {
                    userId,
                },
            },
        };
    }

    if (role === "EMPLOYEE") {
        where = {
            projectEmployees: {
                some: {
                    employee: {
                        userId,
                    },
                },
            },
        };
    }

    return await prisma.project.findMany({
        where,

        include: {
            order: {
                include: {
                    client: true,
                    orderItems: {
                        include: {
                            service: true,
                        },
                    },
                },
            },

            projectEmployees: {
                include: {
                    employee: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};


// Get project by ID

export const getProjectById = async (
    id: string,
    userId: string,
    role: string
) => {
    const project = await prisma.project.findUnique({
        where: {
            id,
        },

        include: {
            order: {
                include: {
                    client: true,
                    orderItems: {
                        include: {
                            service: true,
                        },
                    },
                },
            },

            projectEmployees: {
                include: {
                    employee: true,
                },
            },
        },
    });

    if (!project) {
        throw new AppError(
            "Project not found",
            404
        );
    }

    // Employee can access only assigned projects
    if (role === "EMPLOYEE") {
        const employee = await prisma.employee.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!employee) {
            throw new AppError(
                "Employee not found",
                404
            );
        }

        const assignment =
            await prisma.projectEmployee.findUnique({
                where: {
                    projectId_employeeId: {
                        projectId: id,
                        employeeId: employee.id,
                    },
                },
            });

        if (!assignment) {
            throw new AppError(
                "You do not have access to this project",
                403
            );
        }
    }

    return project;
};


// Assign employee to project

type AssignEmployeeData = {
    employeeId: string;
    role?: string;
};

export const assignEmployeeToProject = async (
    projectId: string,
    data: AssignEmployeeData
) => {
    // 1. Check project exists
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        throw new AppError(
            "Project not found",
            404
        );
    }

    // 2. Check employee exists
    const employee = await prisma.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });

    if (!employee) {
        throw new AppError(
            "Employee not found",
            404
        );
    }

    // 3. Check employee is active
    if (!employee.isActive) {
        throw new AppError(
            "Employee is inactive",
            400
        );
    }

    // 4. Check if employee is already assigned
    const existingAssignment =
        await prisma.projectEmployee.findUnique({
            where: {
                projectId_employeeId: {
                    projectId,
                    employeeId: data.employeeId,
                },
            },
        });

    if (existingAssignment) {
        throw new AppError(
            "Employee is already assigned to this project",
            409
        );
    }

    // 5. Create assignment
    return await prisma.projectEmployee.create({
        data: {
            projectId,
            employeeId: data.employeeId,
            role: data.role,
        },

        include: {
            project: true,
            employee: true,
        },
    });
};


// Remove employee from project

export const removeEmployeeFromProject = async (
    projectId: string,
    employeeId: string
) => {
    const assignment =
        await prisma.projectEmployee.findUnique({
            where: {
                projectId_employeeId: {
                    projectId,
                    employeeId,
                },
            },
        });

    if (!assignment) {
        throw new AppError(
            "Employee is not assigned to this project",
            404
        );
    }

    await prisma.projectEmployee.delete({
        where: {
            projectId_employeeId: {
                projectId,
                employeeId,
            },
        },
    });

    return {
        message:
            "Employee removed from project successfully",
    };
};


// Update project

type UpdateProjectData = {
    name?: string;
    startDate?: string | null;
    endDate?: string | null;
};

export const updateProject = async (
    id: string,
    data: UpdateProjectData
) => {
    // Check project exists
    const project = await prisma.project.findUnique({
        where: {
            id,
        },
    });

    if (!project) {
        throw new AppError(
            "Project not found",
            404
        );
    }

    return await prisma.project.update({
        where: {
            id,
        },

        data: {
            name: data.name,

            startDate: data.startDate
                ? new Date(data.startDate)
                : data.startDate === null
                    ? null
                    : undefined,

            endDate: data.endDate
                ? new Date(data.endDate)
                : data.endDate === null
                    ? null
                    : undefined,
        },

        include: {
            order: {
                include: {
                    client: true,
                    orderItems: {
                        include: {
                            service: true,
                        },
                    },
                },
            },

            projectEmployees: {
                include: {
                    employee: true,
                },
            },
        },
    });
};


// Update project status

export const updateProjectStatus = async (
    id: string,
    newStatus: ProjectStatus,
    userId: string,
    role: string
) => {
    const project = await prisma.project.findUnique({
        where: {
            id,
        },
    });

    if (!project) {
        throw new AppError(
            "Project not found",
            404
        );
    }

    // Employee can update status only
    // for projects assigned to him
    if (role === "EMPLOYEE") {
        const employee = await prisma.employee.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!employee) {
            throw new AppError(
                "Employee not found",
                404
            );
        }

        const assignment =
            await prisma.projectEmployee.findUnique({
                where: {
                    projectId_employeeId: {
                        projectId: id,
                        employeeId: employee.id,
                    },
                },
            });

        if (!assignment) {
            throw new AppError(
                "You do not have access to this project",
                403
            );
        }
    }

    const currentStatus = project.status;

    if (currentStatus === newStatus) {
        throw new AppError(
            "Project is already in this status",
            400
        );
    }

    const allowedTransitions: Record<
        ProjectStatus,
        ProjectStatus[]
    > = {
        PLANNING: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED", "ON_HOLD"],
        ON_HOLD: ["IN_PROGRESS"],
        COMPLETED: [],
    };

    if (
        !allowedTransitions[currentStatus].includes(
            newStatus
        )
    ) {
        throw new AppError(
            `Cannot change project status from ${currentStatus} to ${newStatus}`,
            400
        );
    }

    return await prisma.$transaction(async (tx) => {
        if (
            newStatus === "IN_PROGRESS" ||
            newStatus === "COMPLETED"
        ) {
            await tx.order.update({
                where: {
                    id: project.orderId,
                },

                data: {
                    status:
                        newStatus === "IN_PROGRESS"
                            ? "IN_PROGRESS"
                            : "COMPLETED",
                },
            });
        }

        return await tx.project.update({
            where: {
                id,
            },

            data: {
                status: newStatus,
            },

            include: {
                order: {
                    include: {
                        client: true,
                        orderItems: {
                            include: {
                                service: true,
                            },
                        },
                    },
                },

                projectEmployees: {
                    include: {
                        employee: true,
                    },
                },
            },
        });
    });
};