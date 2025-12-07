"use client";

import { ReactNode } from "react";
import { MemberRole } from "@/features/members/types";
import { hasPermission, Permission } from "@/lib/permissions";

interface RoleGuardProps {
  role: MemberRole | string | undefined;

  allowedRoles?: MemberRole[];

  permission?: Permission;

  children: ReactNode;

  fallback?: ReactNode;
}

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

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role as MemberRole)) {
      return <>{fallback}</>;
    }
  }

  if (permission) {
    if (!hasPermission(role, permission)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: MemberRole[],
  FallbackComponent?: React.ComponentType,
) {
  return function RoleGuardedComponent(props: P & { role?: MemberRole }) {
    const { role, ...rest } = props;

    if (!role || !allowedRoles.includes(role)) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    return <WrappedComponent {...(rest as P)} />;
  };
}

export const AdminOnly = ({
  role,
  children,
  fallback,
}: {
  role: MemberRole | string | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) => (
  <RoleGuard role={role} allowedRoles={[MemberRole.ADMIN]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ManagerOrAbove = ({
  role,
  children,
  fallback,
}: {
  role: MemberRole | string | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) => (
  <RoleGuard role={role} allowedRoles={[MemberRole.ADMIN, MemberRole.MANAGER]} fallback={fallback}>
    {children}
  </RoleGuard>
);
