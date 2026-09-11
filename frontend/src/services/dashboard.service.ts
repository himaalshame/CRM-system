import api from "../api/axios";

export type DashboardStats = {
  customers: number;
  employees: number;
  orders: number;
  services: number;
  projects: number;
  revenue: number;
};

export type DashboardRecentOrderItem = {
  quantity: number;
  service: {
    name: string;
    price: string;
  };
};

export type DashboardRecentOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  totalPrice: string;
  createdAt: string;
  client: {
    id: string;
    fname: string;
    lname: string;
  };
  orderItems: DashboardRecentOrderItem[];
};

export type DashboardPayload = {
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
};

export const getDashboard = async (): Promise<DashboardPayload> => {
  const response = await api.get("/dashboard");
  return response.data;
};
