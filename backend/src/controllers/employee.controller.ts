import { NextFunction, Request, Response } from "express";

import {
    createEmployee as createEmployeeService,
    getEmployees as getEmployeesService,
    getInactiveEmployees as getInactiveEmployeesService,
    getEmployeeById as getEmployeeByIdService,
    updateEmployee as updateEmployeeService,
    deactivateEmployee as deactivateEmployeeService,
    restoreEmployee as restoreEmployeeService,
} from "../services/employee.service";

// Create Employee
export const createEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const employee = await createEmployeeService(req.body);

        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
};

// Get all Employees
export const getEmployees = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const employees = await getEmployeesService();

        res.json(employees);
    } catch (error) {
        next(error);
    }
};

// Get Employee by ID
export const getEmployeeById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const employee = await getEmployeeByIdService(
            req.params.id
        );

        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// Update Employee
export const updateEmployee = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const employee = await updateEmployeeService(
            req.params.id,
            req.body
        );

        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// Deactivate Employee
export const deactivateEmployee = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await deactivateEmployeeService(
            req.params.id
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Restore Employee
export const restoreEmployee = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await restoreEmployeeService(
            req.params.id
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Get inactive Employees
export const getInactiveEmployees = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const employees = await getInactiveEmployeesService();

        res.json(employees);
    } catch (error) {
        next(error);
    }
};