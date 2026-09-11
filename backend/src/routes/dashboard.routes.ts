import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "EMPLOYEE", "CLIENT"),
  getDashboard
);

export default router;
