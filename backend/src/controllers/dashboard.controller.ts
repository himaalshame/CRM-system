import { NextFunction, Request, Response } from "express";
import { getDashboard as getDashboardService } from "../services/dashboard.service";

export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const data = await getDashboardService(req.user.userId, req.user.role);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
