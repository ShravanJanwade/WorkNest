import { Models } from "node-appwrite";

export enum MemberRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  [MemberRole.ADMIN]: 3,
  [MemberRole.MANAGER]: 2,
  [MemberRole.EMPLOYEE]: 1,
};

export type Member = Models.Document & {
  workspaceId: string;
  userId: string;
  role: MemberRole;
  name?: string;
  email?: string;
};
