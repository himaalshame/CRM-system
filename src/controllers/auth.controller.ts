import { NextFunction, Request, Response } from "express";

import { login as loginService } from "../services/auth.service";

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