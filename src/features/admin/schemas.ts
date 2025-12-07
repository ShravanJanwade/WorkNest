import { z } from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required."),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export const updateCompanySchema = companySchema.partial();

export const inviteUserSchema = z.object({
  email: z.string().email("Valid email is required."),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
  workspaceId: z.string().min(1, "Workspace ID is required."),
});
