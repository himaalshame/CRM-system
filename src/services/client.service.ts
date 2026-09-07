import { prisma } from '../config/prisma'


export const getClients = async () => {
    return await prisma.client.findMany({
        where: {
            isActive: true
        },
    });
};

// get client by Id

export const getClientById = async (id: string) => {
    return await prisma.client.findUnique({
        where: {
            id,
        },
    });
};


// create client

export const createClient = async (data: {
    fname: string;
    lname: string;
    phone: string;
    address?: string;
}) => {
    return await prisma.client.create({
        data: {
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            address: data.address,
        },
    });
};


// update client

export const updateClient = async (
    id: string,
    data: {
        fname?: string;
        lname?: string;
        phone?: string;
        address?: string;
    }
) => {
    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            address: data.address,
        },
    });
};


// Inactive Client

export const getInactiveClients = async () => {
    return await prisma.client.findMany({
        where: {
            isActive: false,
        },
    });
};


// Delete Client

export const deleteClient = async (id: string) => {
    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
};


// restore client

export const restoreClient = async (id: string) => {
    return await prisma.client.update({
        where: {
            id,
        },
        data: {
            isActive: true,
        },
    });
};