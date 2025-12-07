import { MemberRole } from "@/features/members/types";

/**
 * Permission definitions for role-based access control.
 * Each permission maps to an array of roles that have access.
 */
export const PERMISSIONS = {
  // Company Management
  MANAGE_COMPANY: [MemberRole.ADMIN],
  VIEW_COMPANY_SETTINGS: [MemberRole.ADMIN],
  EDIT_COMPANY_PROFILE: [MemberRole.ADMIN],
  
  // Workspace Management
  CREATE_WORKSPACE: [MemberRole.ADMIN, MemberRole.MANAGER],
  DELETE_WORKSPACE: [MemberRole.ADMIN],
  EDIT_WORKSPACE: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_WORKSPACE: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  
  // Project Management
  CREATE_PROJECT: [MemberRole.ADMIN, MemberRole.MANAGER],
  EDIT_PROJECT: [MemberRole.ADMIN, MemberRole.MANAGER],
  DELETE_PROJECT: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_PROJECT: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  
  // Task Management
  CREATE_TASK: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  EDIT_ANY_TASK: [MemberRole.ADMIN, MemberRole.MANAGER],
  EDIT_OWN_TASK: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  DELETE_TASK: [MemberRole.ADMIN, MemberRole.MANAGER],
  ASSIGN_TASK: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_TASK: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  
  // Epic Management
  CREATE_EPIC: [MemberRole.ADMIN, MemberRole.MANAGER],
  EDIT_EPIC: [MemberRole.ADMIN, MemberRole.MANAGER],
  DELETE_EPIC: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_EPIC: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  
  // Sprint Management
  CREATE_SPRINT: [MemberRole.ADMIN, MemberRole.MANAGER],
  EDIT_SPRINT: [MemberRole.ADMIN, MemberRole.MANAGER],
  DELETE_SPRINT: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_SPRINT: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  
  // User Management  
  INVITE_MEMBER: [MemberRole.ADMIN, MemberRole.MANAGER],
  REMOVE_MEMBER: [MemberRole.ADMIN],
  CHANGE_ROLE: [MemberRole.ADMIN],
  VIEW_ALL_MEMBERS: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_MEMBER_DETAILS: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  
  // Dashboard Access
  VIEW_ADMIN_DASHBOARD: [MemberRole.ADMIN],
  VIEW_MANAGER_DASHBOARD: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_TEAM_ANALYTICS: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_PERSONAL_DASHBOARD: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  VIEW_GLOBAL_ANALYTICS: [MemberRole.ADMIN],
  
  // Time Tracking
  LOG_TIME: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  VIEW_ALL_TIMESHEETS: [MemberRole.ADMIN, MemberRole.MANAGER],
  VIEW_OWN_TIMESHEET: [MemberRole.ADMIN, MemberRole.MANAGER, MemberRole.EMPLOYEE],
  APPROVE_TIMESHEETS: [MemberRole.ADMIN, MemberRole.MANAGER],
  
  // Settings
  MANAGE_WORKSPACE_SETTINGS: [MemberRole.ADMIN],
  MANAGE_PROJECT_SETTINGS: [MemberRole.ADMIN, MemberRole.MANAGER],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: MemberRole | string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly MemberRole[];
  return allowedRoles?.includes(role as MemberRole) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: MemberRole | string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: MemberRole | string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a specific role
 */
export function getPermissionsForRole(role: MemberRole): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter(
    permission => (PERMISSIONS[permission] as readonly MemberRole[]).includes(role)
  );
}

/**
 * Get display label for a role
 */
export function getRoleLabel(role: MemberRole): string {
  switch (role) {
    case MemberRole.ADMIN:
      return "Administrator";
    case MemberRole.MANAGER:
      return "Manager";
    case MemberRole.EMPLOYEE:
      return "Employee";
    default:
      return role;
  }
}

/**
 * Get role badge color
 */
export function getRoleColor(role: MemberRole): string {
  switch (role) {
    case MemberRole.ADMIN:
      return "bg-red-100 text-red-800 border-red-200";
    case MemberRole.MANAGER:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case MemberRole.EMPLOYEE:
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
