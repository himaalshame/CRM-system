
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export const createProjectDataFromApprovedOrder = (order: {
    id: string;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    client?: {
        fname?: string | null;
        lname?: string | null;
    } | null;
    orderItems?: Array<{
        service?: {
            name?: string | null;
        } | null;
    }> | null;
}) => {
    const clientFullName = [order.client?.fname, order.client?.lname]
        .filter(Boolean)
        .join(" ")
        .trim();

    const serviceNames = (order.orderItems ?? [])
        .map((item) => item.service?.name)
        .filter((name): name is string => Boolean(name?.trim()))
        .map((name) => name.trim());

    const derivedName = serviceNames.length > 0
        ? `${clientFullName || `Project-${order.id}` } - ${serviceNames.join(" + ")}`
        : (clientFullName
            ? `${clientFullName} Project`
            : `Project-${order.id}`);

    return {
        orderId: order.id,
        name: derivedName,
        startDate: order.startDate
            ? new Date(order.startDate)
            : undefined,
        endDate: order.endDate
            ? new Date(order.endDate)
            : undefined,
    };
};

type CreateOrderItem = {
    serviceId: string;
    quantity: number;
};

type PreparedOrderItem = {
    serviceId: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
};

const mergeOrderItems = (items: CreateOrderItem[]): CreateOrderItem[] => {
    const merged = new Map<string, number>();

    items.forEach((item) => {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new AppError(
                "Quantity must be a positive integer",
                400
            );
        }

        merged.set(
            item.serviceId,
            (merged.get(item.serviceId) ?? 0) + item.quantity
        );
    });

    return Array.from(merged.entries()).map(([serviceId, quantity]) => ({
        serviceId,
        quantity,
    }));
};

const prepareOrderItems = async (
    items: CreateOrderItem[]
): Promise<{ orderItems: PreparedOrderItem[]; totalPrice: number }> => {
    if (!items.length) {
        throw new AppError(
            "Order must contain at least one item",
            400
        );
    }

    const mergedItems = mergeOrderItems(items);
    const uniqueServiceIds = mergedItems.map((item) => item.serviceId);

    const services = await prisma.service.findMany({
        where: {
            id: {
                in: uniqueServiceIds,
            },
        },
    });

    if (services.length !== uniqueServiceIds.length) {
        throw new AppError(
            "One or more services not found",
            400
        );
    }

    const inactiveService = services.find((service) => !service.isActive);
    if (inactiveService) {
        throw new AppError(
            "Only active services can be ordered",
            400
        );
    }

    const orderItems = mergedItems.map((item) => {
        const service = services.find(
            (candidate) => candidate.id === item.serviceId
        );

        if (!service) {
            throw new AppError("Service not found", 400);
        }

        const unitPrice = Number(service.price);
        const lineTotal = Number((unitPrice * item.quantity).toFixed(2));

        return {
            serviceId: service.id,
            unitPrice,
            quantity: item.quantity,
            lineTotal,
        };
    });

    const totalPrice = Number(
        orderItems
            .reduce((sum, item) => sum + item.lineTotal, 0)
            .toFixed(2)
    );

    return { orderItems, totalPrice };
};

type CreateOrderData = {
    clientId?: string;
    items: CreateOrderItem[];
    startDate?: string;
    endDate?: string;
    notes?: string;
};

export const createOrder = async (
    data: CreateOrderData,
    userId: string,
    role: string
) => {
    let clientId: string;

    if (role === "CLIENT") {
        const client = await prisma.client.findUnique({
            where: {
                userId,
            },
        });

        if (!client) {
            throw new AppError("Client not found", 404);
        }

        clientId = client.id;
    } else if (role === "ADMIN") {
        if (!data.clientId) {
            throw new AppError(
                "Client ID is required for admin",
                400
            );
        }

        clientId = data.clientId;
    } else {
        throw new AppError(
            "You do not have permission to create orders",
            403
        );
    }

    // Clients cannot set dates
    if (role === "CLIENT" && data.startDate !== undefined) {
        throw new AppError(
            "Clients cannot set a start date",
            400
        );
    }

    if (role === "CLIENT" && data.endDate !== undefined) {
        throw new AppError(
            "Clients cannot set an end date",
            400
        );
    }

    const client = await prisma.client.findUnique({
        where: {
            id: clientId,
        },
    });

    if (!client) {
        throw new AppError("Client not found", 404);
    }

    const { orderItems, totalPrice } = await prepareOrderItems(data.items);

    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                clientId,
                totalPrice,

                startDate: data.startDate
                    ? new Date(data.startDate)
                    : undefined,

                endDate: data.endDate
                    ? new Date(data.endDate)
                    : undefined,

                notes: data.notes,

                orderItems: {
                    create: orderItems.map((item) => ({
                        serviceId: item.serviceId,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                    })),
                },
            },

            include: {
                orderItems: {
                    include: {
                        service: true,
                    },
                },

                client: true,

                projects: true,
            },
        });

        return order;
    });
};

// Get all orders
export const getOrders = async (
    userId: string,
    role: string
) => {
    return await prisma.order.findMany({
        where:
            role === "CLIENT"
                ? {
                    client: {
                        userId,
                    },
                }
                : undefined,

        include: {
            client: true,

            orderItems: {
                include: {
                    service: true,
                },
            },

            projects: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};

// Get order by ID
export const getOrderById = async (
    id: string,
    userId: string,
    role: string
) => {
    const order = await prisma.order.findUnique({
        where: {
            id,
        },

        include: {
            client: true,

            orderItems: {
                include: {
                    service: true,
                },
            },

            projects: {
                include: {
                    projectEmployees: {
                        include: {
                            employee: true,
                        },
                    },
                },
            },
        },
    });

    if (!order) {
        throw new AppError(
            "Order not found",
            404
        );
    }

    if (
        role === "CLIENT" &&
        order.client.userId !== userId
    ) {
        throw new AppError(
            "You do not have access to this order",
            403
        );
    }

    return order;
};

// Update order
type UpdateOrderData = {
    status?:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED";

    items?: CreateOrderItem[];

    startDate?: string | null;
    endDate?: string | null;

    paymentStatus?:
        | "UNPAID"
        | "PARTIALLY_PAID"
        | "PAID";

    notes?: string | null;
};

export const updateOrder = async (
    orderId: string,
    userId: string,
    role: string,
    data: UpdateOrderData
) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });

    if (!order) {
        throw new AppError(
            "Order not found",
            404
        );
    }

    if (role === "CLIENT") {
        const client = await prisma.client.findUnique({
            where: {
                userId,
            },
        });

        if (
            !client ||
            order.clientId !== client.id
        ) {
            throw new AppError(
                "You do not have access to this order",
                403
            );
        }

        if (order.status !== "PENDING") {
            throw new AppError(
                "Only pending orders can be updated by clients",
                400
            );
        }

        if (data.paymentStatus !== undefined) {
            throw new AppError(
                "Clients cannot update payment status",
                400
            );
        }

        if (data.status !== undefined) {
            throw new AppError(
                "Clients cannot update order status",
                400
            );
        }

        if (data.startDate !== undefined) {
            throw new AppError(
                "Clients cannot update start date",
                400
            );
        }

        if (data.endDate !== undefined) {
            throw new AppError(
                "Clients cannot update end date",
                400
            );
        }
    }

    let orderItemsData: PreparedOrderItem[] | undefined;
    let totalPrice: number | undefined;

    if (data.items) {
        if (
            role !== "CLIENT" &&
            role !== "ADMIN"
        ) {
            throw new AppError(
                "You do not have permission to update order items",
                403
            );
        }

        if (
            role === "CLIENT" &&
            order.status !== "PENDING"
        ) {
            throw new AppError(
                "Only pending orders can be updated by clients",
                400
            );
        }

        const prepared = await prepareOrderItems(data.items);
        orderItemsData = prepared.orderItems;
        totalPrice = prepared.totalPrice;
    }

    return await prisma.$transaction(async (tx) => {
        if (orderItemsData) {
            await tx.orderItem.deleteMany({
                where: {
                    orderId,
                },
            });
        }

        const updatedOrder =
            await tx.order.update({
                where: {
                    id: orderId,
                },

                data: {
                    ...(totalPrice !== undefined
                        ? { totalPrice }
                        : {}),

                    status:
                        role === "ADMIN"
                            ? data.status
                            : undefined,

                    startDate:
                        role === "ADMIN" &&
                        data.startDate !== undefined
                            ? data.startDate
                                ? new Date(data.startDate)
                                : null
                            : undefined,

                    endDate:
                        role === "ADMIN" &&
                        data.endDate !== undefined
                            ? data.endDate
                                ? new Date(data.endDate)
                                : null
                            : undefined,

                    paymentStatus:
                        role === "ADMIN"
                            ? data.paymentStatus
                            : undefined,

                    notes:
                        role === "CLIENT"
                            ? data.notes
                            : undefined,
                },

                include: {
                    client: true,

                    orderItems: {
                        include: {
                            service: true,
                        },
                    },

                    projects: true,
                },
            });

        if (orderItemsData) {
            await tx.orderItem.createMany({
                data: orderItemsData.map((item) => ({
                    orderId,
                    serviceId: item.serviceId,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                })),
            });

            return tx.order.findUniqueOrThrow({
                where: {
                    id: orderId,
                },
                include: {
                    client: true,
                    orderItems: {
                        include: {
                            service: true,
                        },
                    },
                    projects: true,
                },
            });
        }

        return updatedOrder;
    });
};

// Cancel order
type UserRole =
    | "ADMIN"
    | "EMPLOYEE"
    | "CLIENT";

export const cancelOrder = async (
    orderId: string,
    userId: string,
    role: UserRole
) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });

    if (!order) {
        throw new AppError(
            "Order not found",
            404
        );
    }

    if (role === "CLIENT") {
        const client = await prisma.client.findUnique({
            where: {
                userId,
            },
        });

        if (
            !client ||
            order.clientId !== client.id
        ) {
            throw new AppError(
                "You do not have access to this order",
                403
            );
        }

        if (order.status !== "PENDING") {
            throw new AppError(
                "Only pending orders can be cancelled by clients",
                400
            );
        }
    }

    if (order.status === "COMPLETED") {
        throw new AppError(
            "Completed orders cannot be cancelled",
            400
        );
    }

    if (order.status === "CANCELLED") {
        throw new AppError(
            "Order is already cancelled",
            400
        );
    }

    return await prisma.order.update({
        where: {
            id: orderId,
        },

        data: {
            status: "CANCELLED",
        },

        include: {
            client: true,

            orderItems: {
                include: {
                    service: true,
                },
            },

            projects: true,
        },
    });
};

// Approve order + create project
type ApproveOrderData = {
    startDate?: string | null;
    endDate?: string | null;
};

export const approveOrder = async (
    id: string,
    data: ApproveOrderData = {}
) => {
    const order = await prisma.order.findUnique({
        where: {
            id,
        },

        include: {
            client: true,

            orderItems: {
                include: {
                    service: true,
                },
            },

            projects: true,
        },
    });

    if (!order) {
        throw new AppError(
            "Order not found",
            404
        );
    }

    if (order.status !== "PENDING") {
        throw new AppError(
            "Only pending orders can be approved",
            400
        );
    }

    const startDate = data.startDate
        ? new Date(data.startDate)
        : null;

    const endDate = data.endDate
        ? new Date(data.endDate)
        : null;

    if (startDate && Number.isNaN(startDate.getTime())) {
        throw new AppError(
            "Invalid start date",
            400
        );
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
        throw new AppError(
            "Invalid end date",
            400
        );
    }

    if (
        startDate &&
        endDate &&
        endDate < startDate
    ) {
        throw new AppError(
            "End date cannot be before start date",
            400
        );
    }

    return await prisma.$transaction(async (tx) => {
        let project;

        if (order.projects.length === 0) {
            const projectPayload = createProjectDataFromApprovedOrder({
                id: order.id,
                startDate: startDate ?? undefined,
                endDate: endDate ?? undefined,
                client: order.client,
                orderItems: order.orderItems,
            });

            project = await tx.project.create({
                data: {
                    orderId: order.id,
                    name: projectPayload.name,
                    startDate: projectPayload.startDate,
                    endDate: projectPayload.endDate,
                },
            });
        }

        const updatedOrder = await tx.order.update({
            where: {
                id,
            },

            data: {
                status: "APPROVED",
                startDate: startDate,
                endDate: endDate,
            },

            include: {
                client: true,

                orderItems: {
                    include: {
                        service: true,
                    },
                },

                projects: true,
            },
        });

        return {
            order: updatedOrder,
            project,
        };
    });
};

