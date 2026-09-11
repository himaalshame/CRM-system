import api from "../api/axios";

export type Client = {
    id: string;
    fname: string;
    lname: string;
    phone: string;
    address?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ClientFormData = {
    fname: string;
    lname: string;
    phone: string;
    address?: string;
};

export const getClients = async (): Promise<Client[]> => {
    const response = await api.get("/clients");
    return response.data;
};

export const getInactiveClients = async (): Promise<Client[]> => {
    const response = await api.get("/clients/inactive");
    return response.data;
};

export const createClient = async (
    data: ClientFormData
): Promise<Client> => {
    const response = await api.post("/clients", data);
    return response.data;
};

export const updateClient = async (
    id: string,
    data: Partial<ClientFormData>
): Promise<Client> => {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
};

export const deactivateClient = async (id: string): Promise<Client> => {
    const response = await api.delete(`/clients/${id}`);
    return response.data.client;
};

export const restoreClient = async (id: string): Promise<Client> => {
    const response = await api.patch(`/clients/${id}/restore`);
    return response.data.client;
};
