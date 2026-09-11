import api from "../api/axios";

export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD";

export type ProjectEmployee = {
  employeeId: string;
  projectId: string;
  role?: string | null;
  assignedAt: string;
  employee: {
    id: string;
    fname: string;
    lname: string;
    phone: string;
    jobTitle: string;
    isActive: boolean;
    userId: string;
  };
};

export type ProjectOrderClient = {
  id: string;
  fname: string;
  lname: string;
  phone: string;
  address?: string | null;
};

export type ProjectOrderItem = {
  id: string;
  serviceId: string;
  orderId: string;
  unitPrice: string;
  quantity: number;
  service: {
    id: string;
    name: string;
    description?: string | null;
    price: string;
    isActive: boolean;
  };
};

export type ProjectOrder = {
  id: string;
  clientId: string;
  status: string;
  totalPrice: string;
  paymentStatus: string;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  client: ProjectOrderClient;
  orderItems: ProjectOrderItem[];
};

export type Project = {
  id: string;
  orderId: string;
  name: string;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  order: ProjectOrder;
  projectEmployees: ProjectEmployee[];
};

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>("/projects");
  return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
};

export const assignEmployeeToProject = async (
  projectId: string,
  data: { employeeId: string; role?: string }
): Promise<ProjectEmployee> => {
  const response = await api.post<ProjectEmployee>(
    `/projects/${projectId}/employees`,
    data
  );
  return response.data;
};

export const removeEmployeeFromProject = async (
  projectId: string,
  employeeId: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/projects/${projectId}/employees/${employeeId}`
  );
  return response.data;
};

export const updateProjectStatus = async (
  projectId: string,
  status: ProjectStatus
): Promise<Project> => {
  const response = await api.patch<Project>(`/projects/${projectId}/status`, {
    status,
  });
  return response.data;
};
