import { Models } from "node-appwrite";

export type Company = Models.Document & {
  name: string;
  imageUrl?: string;
  description?: string;
  adminUserId: string;
  adminEmail?: string;
  settings?: string;
  status: CompanyStatus;
  deleteRequested?: boolean;
  deleteRequestedAt?: string;
  deleteRequestReason?: string;
};

export type CompanyStatus = "active" | "pending_delete" | "deleted";

export interface CompanySettings {
  allowEmployeeTaskCreation: boolean;
  allowManagerWorkspaceCreation: boolean;
  defaultRole: "MANAGER" | "EMPLOYEE";
  enforceTimeTracking: boolean;
  maxProjectsPerWorkspace?: number;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  allowEmployeeTaskCreation: true,
  allowManagerWorkspaceCreation: true,
  defaultRole: "EMPLOYEE",
  enforceTimeTracking: false,
};

export interface SuperAdminUser {
  $id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
}

export const SUPER_ADMIN_EMAIL = "superadmin@worknest.com";
export const SUPER_ADMIN_PASSWORD = "SuperAdmin@123!";
export const SUPER_ADMIN_NAME = "Super Admin";
