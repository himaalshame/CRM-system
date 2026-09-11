import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export type DashboardStats = {
  customers: number;
  employees: number;
  orders: number;
  services: number;
  projects: number;
  revenue: number;
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
  orderItems: Array<{
    service: {
      name: string;
      price: string;
    };
    quantity: number;
  }>;
};

export type DashboardPayload = {
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
};

export const getDashboard = async (
  userId: string,
  role: "ADMIN" | "EMPLOYEE" | "CLIENT"
): Promise<DashboardPayload> => {
  if (role === "ADMIN") {
    const [customers, employees, orders, services, projects, revenue] = await Promise.all([
      prisma.client.count({ where: { isActive: true } }),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.project.count(),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
      }),
    ]);

    const ordersList = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPrice: true,
        createdAt: true,
        client: { select: { id: true, fname: true, lname: true } },
        orderItems: {
          select: {
            quantity: true,
            service: { select: { name: true, price: true } },
          },
        },
      },
    });

    return {
      role,
      stats: {
        customers,
        employees,
        orders,
        services,
        projects,
        revenue: Number(revenue._sum.totalPrice ?? 0),
      },
      recentOrders: ordersList.map((order) => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice.toString(),
        createdAt: order.createdAt.toISOString(),
        client: order.client,
        orderItems: order.orderItems.map((item) => ({
          quantity: item.quantity,
          service: {
            name: item.service.name,
            price: item.service.price.toString(),
          },
        })),
      })),
    };
  }

  if (role === "EMPLOYEE") {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const assignedProjectIds = await prisma.projectEmployee.findMany({
      where: { employeeId: employee.id },
      select: { projectId: true },
    });

    const assignedProjects = assignedProjectIds.map((row) => row.projectId);

    const [customers, orders, services, projects, revenue] = await Promise.all([
      prisma.client.count({ where: { isActive: true } }),
      prisma.order.count({
        where: {
          projects: {
            some: {
              id: { in: assignedProjects },
            },
          },
        },
      }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.project.count({ where: { id: { in: assignedProjects } } }),
      prisma.order.aggregate({
        where: {
          projects: {
            some: {
              id: { in: assignedProjects },
            },
          },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    const ordersList = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      where: {
        projects: {
          some: {
            id: { in: assignedProjects },
          },
        },
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPrice: true,
        createdAt: true,
        client: { select: { id: true, fname: true, lname: true } },
        orderItems: {
          select: {
            quantity: true,
            service: { select: { name: true, price: true } },
          },
        },
      },
    });

    return {
      role,
      stats: {
        customers,
        employees: assignedProjects.length,
        orders,
        services,
        projects,
        revenue: Number(revenue._sum.totalPrice ?? 0),
      },
      recentOrders: ordersList.map((order) => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice.toString(),
        createdAt: order.createdAt.toISOString(),
        client: order.client,
        orderItems: order.orderItems.map((item) => ({
          quantity: item.quantity,
          service: {
            name: item.service.name,
            price: item.service.price.toString(),
          },
        })),
      })),
    };
  }

  const client = await prisma.client.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  const [orders, services, projects, revenue] = await Promise.all([
    prisma.order.count({ where: { clientId: client.id } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.project.count({
      where: {
        order: {
          clientId: client.id,
        },
      },
    }),
    prisma.order.aggregate({
      where: { clientId: client.id },
      _sum: { totalPrice: true },
    }),
  ]);

  const ordersList = await prisma.order.findMany({
    take: 6,
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      totalPrice: true,
      createdAt: true,
      client: { select: { id: true, fname: true, lname: true } },
      orderItems: {
        select: {
          quantity: true,
          service: { select: { name: true, price: true } },
        },
      },
    },
  });

  return {
    role,
    stats: {
      customers: 1,
      employees: 0,
      orders,
      services,
      projects,
      revenue: Number(revenue._sum.totalPrice ?? 0),
    },
    recentOrders: ordersList.map((order) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalPrice: order.totalPrice.toString(),
      createdAt: order.createdAt.toISOString(),
      client: order.client,
      orderItems: order.orderItems.map((item) => ({
        quantity: item.quantity,
        service: {
          name: item.service.name,
          price: item.service.price.toString(),
        },
      })),
    })),
  };
};
