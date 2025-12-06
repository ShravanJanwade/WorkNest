import { z } from "zod";

export const createCommentSchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required"),
  content: z.string().trim().min(1, "Comment cannot be empty"),
  parentId: z.string().optional(),
  mentions: z.array(z.string()).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty"),
});
