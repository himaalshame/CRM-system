import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

// Get active services
export const getServices = async () => {
    return await prisma.service.findMany({
        where: {
            isActive: true,
        },
    });
};

// Get service by ID
export const getServiceById = async (id: string) => {
    const service = await prisma.service.findUnique({
        where: {
            id,
        },
    });

    if (!service) {
        throw new AppError("Service not found", 404);
    }

    return service;
};

// Create service
export const createService = async (data: {
    name: string;
    description?: string;
    price: string;
}) => {
    return await prisma.service.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
        },
    });
};

// Update service
export const updateService = async (
    id: string,
    data: {
        name?: string;
        description?: string;
        price?: string;
    }
) => {
    const service = await prisma.service.findUnique({
        where: {
            id,
        },
    });

    if (!service) {
        throw new AppError("Service not found", 404);
    }

    return await prisma.service.update({
        where: {
            id,
        },
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
        },
    });
};

// Get inactive services
export const getInactiveServices = async () => {
    return await prisma.service.findMany({
        where: {
            isActive: false,
        },
    });
};

// Soft delete service
export const deleteService = async (id: string) => {
    const service = await prisma.service.findUnique({
        where: {
            id,
        },
    });

    if (!service) {
        throw new AppError("Service not found", 404);
    }

    if (!service.isActive) {
        throw new AppError(
            "Service is already inactive",
            400
        );
    }

    return await prisma.service.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
};

// Restore service
export const restoreService = async (id: string) => {
    const service = await prisma.service.findUnique({
        where: {
            id,
        },
    });

    if (!service) {
        throw new AppError("Service not found", 404);
    }

    if (service.isActive) {
        throw new AppError(
            "Service is already active",
            400
        );
    }

    return await prisma.service.update({
        where: {
            id,
        },
        data: {
            isActive: true,
        },
    });
};