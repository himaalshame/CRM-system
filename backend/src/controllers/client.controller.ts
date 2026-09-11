import { NextFunction, Request, Response } from "express";

import {
    getClients as getClientsService,
    getClientById as getClientByIdService,
    createClient as createClientService,
    updateClient as updateClientService,
    getInactiveClients as getInactiveClientsService,
    deleteClient as deleteClientService,
    restoreClient as restoreClientService,
} from "../services/client.service";

// Get all clients
export const getClients = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const clients = await getClientsService(
            req.user!.userId,
            req.user!.role
        );

        res.json(clients);
    } catch (error) {
        next(error);
    }
};

// Get client by ID
export const getClientById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const client = await getClientByIdService(
            req.params.id,
            req.user!.userId,
            req.user!.role
        );

        res.json(client);
    } catch (error) {
        next(error);
    }
};

// Create client
export const createClient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const client = await createClientService(req.body);

        res.status(201).json(client);
    } catch (error) {
        next(error);
    }
};

// Update client
export const updateClient = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const client = await updateClientService(
            req.params.id,
            req.body
        );

        res.json(client);
    } catch (error) {
        next(error);
    }
};

// Get inactive clients
export const getInactiveClients = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const clients = await getInactiveClientsService();

        res.json(clients);
    } catch (error) {
        next(error);
    }
};

// Delete client
export const deleteClient = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const client = await deleteClientService(
            req.params.id
        );

        res.json({
            message: "Client deleted successfully",
            client,
        });
    } catch (error) {
        next(error);
    }
};

// Restore client
export const restoreClient = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const client = await restoreClientService(
            req.params.id
        );

        res.json({
            message: "Client restored successfully",
            client,
        });
    } catch (error) {
        next(error);
    }
};