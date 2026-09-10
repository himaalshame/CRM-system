import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

type CreateOrderItem = {
    serviceId: string;
    quantity: number;
};

type CreateOrderData = {
    clientId?: string;
    items: CreateOrderItem[];
    startDate?: string;
    endDate?: string;
};

export const createOrder = async (
    data: CreateOrderData,
    userId: string,
    role: string
) => {
    // 1. Determine clientId based on role
    let clientId: string;

    if (role === "CLIENT") {
        // Get the client connected to the logged-in user
        const client = await prisma.client.findUnique({
            where: {
                userId,
            },
        });

        if (!client) {
            throw new AppError("Client not found", 404);
        }

        // Client can only create an order for himself
        clientId = client.id;
    } else if (role === "ADMIN") {
        // Admin must provide clientId
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

    // 2. Check that the client exists
    const client = await prisma.client.findUnique({
        where: {
            id: clientId,
        },
    });

    if (!client) {
        throw new AppError("Client not found", 404);
    }

    // 3. Get all requested services
    const serviceIds = data.items.map(
        (item) => item.serviceId
    );

    const services = await prisma.service.findMany({
        where: {
            id: {
                in: serviceIds,
            },
            isActive: true,
        },
    });

    // 4. Make sure all requested services exist
    if (services.length !== data.items.length) {
        throw new AppError(
            "One or more services not found",
            400
        );
    }

    // 5. Calculate order items and total price
    const orderItems = data.items.map((item) => {
        const service = services.find(
            (service) => service.id === item.serviceId
        );

        if (!service) {
            throw new AppError(
                "Service not found",
                400
            );
        }

        if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        ) {
            throw new AppError(
                "Quantity must be at least 1",
                400
            );
        }

        const unitPrice = service.price;
        const total =
            Number(unitPrice) * item.quantity;

        return {
            serviceId: service.id,
            unitPrice,
            quantity: item.quantity,
            total,
        };
    });

    // 6. Calculate total price
    const totalPrice = orderItems.reduce(
        (sum, item) => sum + item.total,
        0
    );

    // 7. Create order and order items in one transaction
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

            projects: true,
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
    startDate?: string | null;
    endDate?: string | null;
    paymentStatus?:
        | "UNPAID"
        | "PARTIALLY_PAID"
        | "PAID";
};

export const updateOrder = async (
    orderId: string,
    userId: string,
    role: string,
    data: UpdateOrderData
) => {
    // 1. Check order exists
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

    // 2. Client ownership check
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

        // 3. Client can update only PENDING orders
        if (order.status !== "PENDING") {
            throw new AppError(
                "Only pending orders can be updated by clients",
                400
            );
        }

        // 4. Client should not update paymentStatus
        if (data.paymentStatus !== undefined) {
            throw new AppError(
                "Clients cannot update payment status",
                400
            );
        }
    }

    // 5. Update order
    return await prisma.order.update({
        where: {
            id: orderId,
        },

        data: {
            startDate:
                data.startDate !== undefined
                    ? data.startDate
                        ? new Date(data.startDate)
                        : null
                    : undefined,

            endDate:
                data.endDate !== undefined
                    ? data.endDate
                        ? new Date(data.endDate)
                        : null
                    : undefined,

            paymentStatus:
                role === "ADMIN"
                    ? data.paymentStatus
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
    // 1. Check order exists
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

    // 2. Client can cancel only his own order
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

        // 3. Client can cancel only PENDING orders
        if (order.status !== "PENDING") {
            throw new AppError(
                "Only pending orders can be cancelled by clients",
                400
            );
        }
    }

    // 4. Prevent cancelling completed/cancelled orders
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

    // 5. Cancel order
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


// Approve order
export const approveOrder = async (
    id: string
) => {
    const order = await prisma.order.findUnique({
        where: {
            id,
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

    return await prisma.order.update({
        where: {
            id,
        },

        data: {
            status: "APPROVED",
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