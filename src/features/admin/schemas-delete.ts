import { z } from "zod";

export const deleteRequestSchema = z.object({
  reason: z.string().min(10, "Please provide a reason (at least 10 characters)."),
});
