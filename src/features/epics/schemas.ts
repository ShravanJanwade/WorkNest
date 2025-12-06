import { z } from "zod";

export const createEpicSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z.string().optional(),
  workspaceId: z.string(),
  projectId: z.string(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
