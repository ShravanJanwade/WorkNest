import { z } from "zod";

import { TaskStatus, TaskPriority } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().trim().min(1, "Required"),
  description: z.string().nullish(),
  estimatedHours: z.number().optional(),
  labels: z.array(z.string()).optional(),
  parentId: z.string().nullish(),
  epicId: z.string().nullish(),
  storyPoints: z.number().min(0).max(100).optional(),
});
