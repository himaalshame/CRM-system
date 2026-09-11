import api from "../api/axios";

type LoginData = {
    email: string;
    password: string;
};

type RegisterData = {
    fname: string;
    lname: string;
    email: string;
    phone: string;
    password: string;
};

export const login = async (data: LoginData) => {
    const response = await api.post("/auth/login", data);

    return response.data;
};

export const register = async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);

    return response.data;
};