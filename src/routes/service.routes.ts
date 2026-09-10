import { Router } from "express";

import {
    getServices,
    getServiceById,
    createService,
    updateService,
    getInactiveServices,
    deleteService,
    restoreService,
} from "../controllers/service.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Public: services shown on website before login
router.get("/",  getServices );

// Admin/Employee
router.get(
    "/inactive",
    authenticate,
    authorize("ADMIN", "EMPLOYEE"),
    getInactiveServices
);

// Public: allow website visitors to view a service
router.get("/:id", getServiceById);

// Admin only
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createService
);

router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateService
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteService
);

router.patch(
    "/:id/restore",
    authenticate,
    authorize("ADMIN"),
    restoreService
);

export default router;