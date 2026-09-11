import { NextFunction, Request, Response } from "express";

import 
{ 
    login as loginService,
    register as registerService,

} from "../services/auth.service";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await loginService(req.body);

        res.json(result);
    } catch (error) {
        next(error);
    }
};


export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await registerService(req.body);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};