import bcrypt from "bcrypt";

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

type CreateEmployeeData = {
    email: string;
    password: string;
    fname: string;
    lname: string;
    phone: string;
    jobTitle: string;
};

type UpdateEmployeeData = {
    fname?: string;
    lname?: string;
    phone?: string;
    jobTitle?: string;
};

export const createEmployee = async (
    data: CreateEmployeeData
) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (existingUser) {
        throw new AppError("Email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: "EMPLOYEE",
            },
        });

        const employee = await tx.employee.create({
            data: {
                userId: user.id,
                fname: data.fname,
                lname: data.lname,
                phone: data.phone,
                jobTitle: data.jobTitle,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        });

        return employee;
    });
};


// Get all employees
export const getEmployees = async () => {
    return await prisma.employee.findMany({
        where: {
            isActive: true,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            },
            projectEmployees: {
                include: {
                    project: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};


// Get employee by ID
export const getEmployeeById = async (id: string) => {
    const employee = await prisma.employee.findFirst({
        where: {
            id,
            isActive: true,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            },
            projectEmployees: {
                include: {
                    project: true,
                },
            },
        },
    });

    if (!employee) {
        throw new AppError("Employee not found", 404);
    }

    return employee;
};


// Update employee
export const updateEmployee = async (
    id: string,
    data: UpdateEmployeeData
) => {
    const employee = await prisma.employee.findUnique({
        where: {
            id,
        },
    });

    if (!employee) {
        throw new AppError("Employee not found", 404);
    }

    if (!employee.isActive) {
        throw new AppError("Employee is inactive", 400);
    }

    return await prisma.employee.update({
        where: {
            id,
        },
        data,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            },
            projectEmployees: {
                include: {
                    project: true,
                },
            },
        },
    });
};


// Deactivate employee
export const deactivateEmployee = async (id: string) => {
    const employee = await prisma.employee.findUnique({
        where: {
            id,
        },
    });

    if (!employee) {
        throw new AppError("Employee not found", 404);
    }

    if (!employee.isActive) {
        throw new AppError("Employee is already inactive", 400);
    }

    return await prisma.$transaction(async (tx) => {
        await tx.employee.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });

        await tx.user.update({
            where: {
                id: employee.userId,
            },
            data: {
                isActive: false,
            },
        });

        return {
            message: "Employee deactivated successfully",
        };
    });
};


// Restore employee
export const restoreEmployee = async (id: string) => {
    const employee = await prisma.employee.findUnique({
        where: {
            id,
        },
    });

    if (!employee) {
        throw new AppError("Employee not found", 404);
    }

    if (employee.isActive) {
        throw new AppError("Employee is already active", 400);
    }

    return await prisma.$transaction(async (tx) => {
        await tx.employee.update({
            where: {
                id,
            },
            data: {
                isActive: true,
            },
        });

        await tx.user.update({
            where: {
                id: employee.userId,
            },
            data: {
                isActive: true,
            },
        });

        return {
            message: "Employee restored successfully",
        };
    });
};