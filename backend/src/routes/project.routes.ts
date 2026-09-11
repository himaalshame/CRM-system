import { Router } from "express";

import {
    createProject,
    getProjects,
    getProjectById,
    assignEmployeeToProject,
    removeEmployeeFromProject,
    updateProject,
    updateProjectStatus,
} from "../controllers/project.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Get all projects
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "EMPLOYEE", "CLIENT"),
    getProjects
);

// Get project by ID
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "EMPLOYEE", "CLIENT"),
    getProjectById
);

// Create project
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createProject
);

// Update project
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateProject
);

// Update project status
router.patch(
    "/:id/status",
    authenticate,
    authorize("ADMIN", "EMPLOYEE"),
    updateProjectStatus
);

// Assign employee to project
router.post(
    "/:id/employees",
    authenticate,
    authorize("ADMIN"),
    assignEmployeeToProject
);

// Remove employee from project
router.delete(
    "/:id/employees/:employeeId",
    authenticate,
    authorize("ADMIN"),
    removeEmployeeFromProject
);

export default router;