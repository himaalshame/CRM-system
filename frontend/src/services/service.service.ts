import api from "../api/axios";

export type Service = {
    id: string;
    name: string;
    description?: string | null;
    price: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export const getServices = async (): Promise<Service[]> => {
    const response = await api.get("/services");

    return response.data;
};

export const getInactiveServices = async (): Promise<Service[]> => {
    const response = await api.get("/services/inactive");

    return response.data;
};


export type CreateServiceData = {
    name: string;
    description?: string;
    price: string;
};

export const createService = async (
    data: CreateServiceData
): Promise<Service> => {
    const response = await api.post("/services", data);

    return response.data;
};

export type UpdateServiceData = Partial<CreateServiceData>;

export const updateService = async (
    id: string,
    data: UpdateServiceData
): Promise<Service> => {
    const response = await api.patch(`/services/${id}`, data);

    return response.data;
};

export const deactivateService = async (id: string): Promise<Service> => {
    const response = await api.delete(`/services/${id}`);

    return response.data.service;
};

export const restoreService = async (id: string): Promise<Service> => {
    const response = await api.patch(`/services/${id}/restore`);

    return response.data.service;
};