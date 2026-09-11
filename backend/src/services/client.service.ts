import { prisma } from '../config/prisma'
import { AppError } from '../utils/AppError';

export const getClients = async (
    userId: string,
    role: string
) => {
    if (role === "ADMIN") {
        return await prisma.client.findMany({
            where: {
                isActive: true,
            },
        });
    }

    if (role === "EMPLOYEE") {
        return await prisma.client.findMany({
            where: {
                isActive: true,

                orders: {
                    some: {
                        projects: {
                            some: {
                                projectEmployees: {
                                    some: {
                                        employee: {
                                            userId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    throw new AppError(
        "You do not have permission to view clients",
        403
    );
};
// get client by Id

// Get client by ID
export const getClientById = async (
    id: string,
    userId: string,
    role: "ADMIN" | "CLIENT" | "EMPLOYEE"
) => {
    const client = await prisma.client.findUnique({
        where: {
            id,
        },
    });

    if (!client) {
        throw new AppError("Client not found", 404);
    }

    // Employee can access only clients
    // related to projects assigned to him
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
            throw new AppError("Employee not found", 404);
        }

        const accessibleClient = await prisma.client.findFirst({
            where: {
                id,
                orders: {
                    some: {
                        projects: {
                            some: {
                                projectEmployees: {
                                    some: {
                                        employeeId: employee.id,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!accessibleClient) {
            throw new AppError(
                "You do not have access to this client",
                403
            );
        }
    }

    return client;
};
// create client

export const createClient = async (data: {
    fname: string;
    lname: string;
    phone: string;
    address?: string;
}) => {
    return await prisma.client.create({
        data: {
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            address: data.address,
        },
    });
};

// update client

export const updateClient = async (
    id: string,
    data: {
        fname?: string;
        lname?: string;
        phone?: string;
        address?: string;
    }
) => {
    const client = await prisma.client.findUnique({
        where: {
            id,
        },
    });

    if (!client) {
        throw new AppError("Client not found", 404);
    }

    if (!client.isActive) {
        throw new AppError("Client is inactive", 400);
    }

    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            address: data.address,
        },
    });
};

// Inactive Client

export const getInactiveClients = async () => {
    return await prisma.client.findMany({
        where: {
            isActive: false,
        },
    });
};

// Delete Client

export const deleteClient = async (id: string) => {
    const client = await prisma.client.findUnique({
        where: {
            id,
        },
    });

    if (!client) {
        throw new AppError("Client not found", 404);
    }

    if (!client.isActive) {
        throw new AppError("Client is already inactive", 400);
    }

    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
};

// restore client

export const restoreClient = async (id: string) => {
    const client = await prisma.client.findUnique({
        where: {
            id,
        },
    });

    if (!client) {
        throw new AppError("Client not found", 404);
    }

    if (client.isActive) {
        throw new AppError("Client is already active", 400);
    }

    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            isActive: true,
        },
    });
};