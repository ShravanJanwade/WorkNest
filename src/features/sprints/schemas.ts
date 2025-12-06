import { z } from "zod";

export const createSprintSchema = z.object({
  workspaceId: z.string().trim().min(1, "Workspace ID is required"),
  projectId: z.string().trim().min(1, "Project ID is required"),
  name: z.string().trim().min(1, "Sprint name is required"),
  goal: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const updateSprintSchema = z.object({
  name: z.string().trim().min(1).optional(),
  goal: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["planned", "active", "completed"]).optional(),
});

export const addTaskToSprintSchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required"),
  sprintId: z.string().trim().min(1, "Sprint ID is required"),
});
