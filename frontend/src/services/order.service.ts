import api from "../api/axios";

export type OrderStatus =
    | "PENDING"
    | "APPROVED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export type OrderPaymentStatus =
    | "UNPAID"
    | "PARTIALLY_PAID"
    | "PAID";

export type OrderClient = {
    id: string;
    fname: string;
    lname: string;
    phone: string;
    address?: string | null;
};

export type OrderService = {
    id: string;
    name: string;
    description?: string | null;
    price: string;
    isActive: boolean;
};

export type OrderItem = {
    id: string;
    serviceId: string;
    unitPrice: string;
    quantity: number;
    service: OrderService;
};

export type OrderProjectEmployee = {
    employeeId: string;
    role?: string | null;
    employee: {
        id: string;
        fname: string;
        lname: string;
        jobTitle: string;
    };
};

export type OrderProject = {
    id: string;
    orderId: string;
    name: string;
    status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
    startDate?: string | null;
    endDate?: string | null;
    projectEmployees?: OrderProjectEmployee[];
};

export type Order = {
    id: string;
    clientId: string;
    status: OrderStatus;
    totalPrice: string;
    paymentStatus: OrderPaymentStatus;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    client: OrderClient;
    orderItems: OrderItem[];
    projects: OrderProject[];
};

export type CreateOrderItem = {
    serviceId: string;
    quantity: number;
};

export type CreateOrderData = {
    clientId?: string;
    items: CreateOrderItem[];
    startDate?: string;
    endDate?: string;
    notes?: string;
};

export type UpdateOrderData = {
    status?: OrderStatus;
    items?: CreateOrderItem[];
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
    paymentStatus?: OrderPaymentStatus;
};

export type ApproveOrderData = {
    startDate?: string | null;
    endDate?: string | null;
};

export const getOrders = async (): Promise<Order[]> => {
    const response = await api.get("/orders");

    return response.data;
};

export const getOrderById = async (
    id: string
): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);

    return response.data;
};

export const createOrder = async (
    data: CreateOrderData
): Promise<Order> => {
    const response = await api.post("/orders", data);

    return response.data;
};

export const updateOrder = async (
    id: string,
    data: UpdateOrderData
): Promise<Order> => {
    const response = await api.patch(
        `/orders/${id}`,
        data
    );

    return response.data;
};

export const approveOrder = async (
    id: string,
    data: ApproveOrderData = {}
): Promise<Order> => {
    const response = await api.patch(
        `/orders/${id}/approve`,
        data
    );

    return response.data.order;
};

export const cancelOrder = async (
    id: string
): Promise<Order> => {
    const response = await api.patch(
        `/orders/${id}/cancel`
    );

    return response.data;
};
