import { z } from "zod";

export const createCompanyWithAdminSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required."),
  companyDescription: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  companyAddress: z.string().optional(),
  adminName: z.string().trim().min(1, "Admin name is required."),
  adminEmail: z.string().email("Valid admin email is required."),
});

export const deleteRequestSchema = z.object({
  reason: z.string().min(10, "Please provide a reason (at least 10 characters)."),
});

export const approveDeleteSchema = z.object({
  companyId: z.string().min(1),
  approved: z.boolean(),
});
