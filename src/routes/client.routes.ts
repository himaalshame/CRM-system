import { Router } from "express";

import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    getInactiveClients,
    deleteClient,
    restoreClient,
} from "../controllers/client.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Get all clients
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "EMPLOYEE"),
    getClients
);

// Get inactive clients
router.get(
    "/inactive",
    authenticate,
    authorize("ADMIN", "EMPLOYEE"),
    getInactiveClients
);

// Get client by ID
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "EMPLOYEE"),
    getClientById
);

// Create client
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "EMPLOYEE"),
    createClient
);

// Update client
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "EMPLOYEE"),
    updateClient
);

// Soft delete client
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteClient
);

// Restore client
router.patch(
    "/:id/restore",
    authenticate,
    authorize("ADMIN"),
    restoreClient
);

export default router;