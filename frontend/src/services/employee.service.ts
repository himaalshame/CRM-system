import api from "../api/axios";

export type EmployeeUser = {
    id: string;
    email: string;
    role: "EMPLOYEE";
    isActive: boolean;
};

export type Employee = {
    id: string;
    userId: string;
    fname: string;
    lname: string;
    phone: string;
    jobTitle: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    user: EmployeeUser;
};

export type CreateEmployeeData = {
    email: string;
    password: string;
    fname: string;
    lname: string;
    phone: string;
    jobTitle: string;
};

export type UpdateEmployeeData = {
    fname: string;
    lname: string;
    phone: string;
    jobTitle: string;
};

export const getEmployees = async (): Promise<Employee[]> => {
    const response = await api.get("/employees");
    return response.data;
};

export const getInactiveEmployees = async (): Promise<Employee[]> => {
    const response = await api.get("/employees/inactive");
    return response.data;
};

export const createEmployee = async (
    data: CreateEmployeeData
): Promise<Employee> => {
    const response = await api.post("/employees", data);
    return response.data;
};

export const updateEmployee = async (
    id: string,
    data: UpdateEmployeeData
): Promise<Employee> => {
    const response = await api.patch(`/employees/${id}`, data);
    return response.data;
};

export const deactivateEmployee = async (id: string): Promise<void> => {
    await api.patch(`/employees/${id}/deactivate`);
};

export const restoreEmployee = async (id: string): Promise<void> => {
    await api.patch(`/employees/${id}/restore`);
};
