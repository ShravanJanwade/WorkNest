import { z } from "zod";

export const createTimeEntrySchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  description: z.string().optional(),
  billable: z.boolean().optional().default(true),
});

export const updateTimeEntrySchema = z.object({
  endTime: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  description: z.string().optional(),
  billable: z.boolean().optional(),
});

export const startTimerSchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required"),
  description: z.string().optional(),
});

export const stopTimerSchema = z.object({
  timeEntryId: z.string().trim().min(1, "Time entry ID is required"),
});
