"use client";

import { ReactNode } from "react";
import { MemberRole } from "@/features/members/types";
import { hasPermission, Permission } from "@/lib/permissions";

interface RoleGuardProps {
  /** Current user's role in the workspace */
  role: MemberRole | string | undefined;
  /** Allowed roles that can see the content */
  allowedRoles?: MemberRole[];
  /** Required permission to see the content */
  permission?: Permission;
  /** Content to show if user has access */
  children: ReactNode;
  /** Content to show if user doesn't have access (optional) */
  fallback?: ReactNode;
}

/**
 * Component guard that shows/hides content based on user role
 */
export const RoleGuard = ({
  role,
  allowedRoles,
  permission,
  children,
  fallback = null,
}: RoleGuardProps) => {
  if (!role) {
    return <>{fallback}</>;
  }

  // Check by allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role as MemberRole)) {
      return <>{fallback}</>;
    }
  }

  // Check by permission
  if (permission) {
    if (!hasPermission(role, permission)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * HOC version of RoleGuard for wrapping components
 */
export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: MemberRole[],
  FallbackComponent?: React.ComponentType
) {
  return function RoleGuardedComponent(props: P & { role?: MemberRole }) {
    const { role, ...rest } = props;
    
    if (!role || !allowedRoles.includes(role)) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }
    
    return <WrappedComponent {...(rest as P)} />;
  };
}

/**
 * Admin-only guard helper
 */
export const AdminOnly = ({ 
  role, 
  children, 
  fallback 
}: { 
  role: MemberRole | string | undefined; 
  children: ReactNode; 
  fallback?: ReactNode;
}) => (
  <RoleGuard role={role} allowedRoles={[MemberRole.ADMIN]} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Manager and Admin guard helper
 */
export const ManagerOrAbove = ({ 
  role, 
  children, 
  fallback 
}: { 
  role: MemberRole | string | undefined; 
  children: ReactNode; 
  fallback?: ReactNode;
}) => (
  <RoleGuard 
    role={role} 
    allowedRoles={[MemberRole.ADMIN, MemberRole.MANAGER]} 
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);
