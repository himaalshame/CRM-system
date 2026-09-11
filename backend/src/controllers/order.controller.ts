import { NextFunction, Request, Response } from "express";

import {
    createOrder as createOrderService,
    getOrders as getOrdersService,
    getOrderById as getOrderByIdService,
    updateOrder as updateOrderService,
    cancelOrder as cancelOrderService,
    approveOrder as approveOrderService,
} from "../services/order.service";

// Create Order

export const createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const order = await createOrderService(
            req.body,
            req.user!.userId,
            req.user!.role
        );

        res.status(201).json(order);
    } catch (error) {
        next(error)
    }
};



// Get all Orders
export const getOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orders = await getOrdersService(
            req.user!.userId,
            req.user!.role
        );

        res.json(orders);
    } catch (error) {
        next (error);
    }
};


// Get Order by ID
export const getOrderById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const order = await getOrderByIdService(
            req.params.id,
            req.user!.userId,
            req.user!.role
        );

        res.json(order);
    } catch (error) {
        next (error)
    }
};


// update Order

export const updateOrder = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const order = await updateOrderService(
            req.params.id,
            req.user!.userId,
            req.user!.role,
            req.body
        );

        res.json(order);
    } catch (error) {
        next(error);
    }
};

// Cancel Order
export const cancelOrder = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const order = await cancelOrderService(
            req.params.id,
            req.user!.userId,
            req.user!.role
        );

        res.json(order);
    } catch (error) {
        next(error)
    }
};


// Approve Order
export const approveOrder = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await approveOrderService(
            req.params.id,
            {
                startDate: req.body.startDate,
                endDate: req.body.endDate,
            }
        );

        res.json({
            message: "Order approved successfully",
            order: result.order,
            project: result.project,
        });
    } catch (error) {
        next(error);
    }
};