import { NextFunction, Request, Response } from "express";
import { ProjectStatus } from "../../generated/prisma/client";

import {
  createProject as createProjectService,
  getProjects as getProjectsService,
  getProjectById as getProjectByIdService,
  assignEmployeeToProject as assignEmployeeToProjectService,
  removeEmployeeFromProject as removeEmployeeFromProjectService,
  updateProject as updateProjectService,
  updateProjectStatus as updateProjectStatusService,
} from "../services/project.service";

// Create Project
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await createProjectService(req.body);

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// Get all Projects
export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await getProjectsService(
      req.user!.userId,
      req.user!.role
    );

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// Get Project by ID
export const getProjectById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await getProjectByIdService(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Assign employee to project
export const assignEmployeeToProject = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignment = await assignEmployeeToProjectService(
      req.params.id,
      req.body
    );

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// Remove employee from project
export const removeEmployeeFromProject = async (
  req: Request<{
    id: string;
    employeeId: string;
  }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await removeEmployeeFromProjectService(
      req.params.id,
      req.params.employeeId
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update Project
export const updateProject = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await updateProjectService(
      req.params.id,
      req.body
    );

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// update project status
export const updateProjectStatus = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body as {
      status: ProjectStatus;
    };

    const project = await updateProjectStatusService(
      req.params.id,
      req.body.status,
      req.user!.userId,
      req.user!.role
    );

    res.json(project);
  } catch (error) {
    next(error);
  }
};