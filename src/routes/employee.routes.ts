import { Router } from "express";

import {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deactivateEmployee,
    restoreEmployee,
} from "../controllers/employee.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

import { validate } from "../middleware/validate.middleware";
import { createEmployeeSchema } from "../validators/employee.validator";

const router = Router();

// Any authenticated user can view employees
router.get("/", authenticate, getEmployees);

router.get("/:id", authenticate, getEmployeeById);

// Only ADMIN can manage employees
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createEmployeeSchema),
    createEmployee
);

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateEmployee
);

router.patch(
    "/:id/deactivate",
    authenticate,
    authorize("ADMIN"),
    deactivateEmployee
);

router.patch(
    "/:id/restore",
    authenticate,
    authorize("ADMIN"),
    restoreEmployee
);

export default router;