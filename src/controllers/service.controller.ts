import { NextFunction, Request, Response } from "express";

import {
    getServices as getServicesService,
    getServiceById as getServiceByIdService,
    createService as createServiceService,
    updateService as updateServiceService,
    getInactiveServices as getInactiveServicesService,
    deleteService as deleteServiceService,
    restoreService as restoreServiceService,
} from "../services/service.service";

export const getServices = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const services = await getServicesService();

        res.json(services);
    } catch (error) {
        next(error);
    }
};

export const getServiceById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const service = await getServiceByIdService(req.params.id);

        res.json(service);
    } catch (error) {
        next(error);
    }
};

export const createService = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const service = await createServiceService(req.body);

        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};

export const updateService = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const service = await updateServiceService(
            req.params.id,
            req.body
        );

        res.json(service);
    } catch (error) {
        next(error);
    }
};

export const getInactiveServices = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const services = await getInactiveServicesService();

        res.json(services);
    } catch (error) {
        next(error);
    }
};

export const deleteService = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const service = await deleteServiceService(req.params.id);

        res.json({
            message: "Service deleted successfully",
            service,
        });
    } catch (error) {
        next(error);
    }
};

export const restoreService = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const service = await restoreServiceService(req.params.id);

        res.json({
            message: "Service restored successfully",
            service,
        });
    } catch (error) {
        next(error);
    }
};