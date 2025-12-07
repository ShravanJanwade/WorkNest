import { Context, Next } from "hono";
import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";
import { hasPermission, Permission } from "./permissions";

export const requireRole = (...allowedRoles: MemberRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const workspaceId = c.req.param("workspaceId") || c.req.query("workspaceId");

    if (!workspaceId) {
      return c.json({ error: "Workspace ID required" }, 400);
    }

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized - not a member" }, 401);
    }

    if (!allowedRoles.includes(member.role as MemberRole)) {
      return c.json(
        {
          error: "Forbidden - insufficient permissions",
          requiredRoles: allowedRoles,
          userRole: member.role,
        },
        403,
      );
    }

    c.set("member", member);

    await next();
  };
};

export const requirePermission = (...permissions: Permission[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const workspaceId = c.req.param("workspaceId") || c.req.query("workspaceId");

    if (!workspaceId) {
      return c.json({ error: "Workspace ID required" }, 400);
    }

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized - not a member" }, 401);
    }

    const hasAllPermissions = permissions.every((p) => hasPermission(member.role, p));

    if (!hasAllPermissions) {
      return c.json(
        {
          error: "Forbidden - missing required permissions",
          requiredPermissions: permissions,
          userRole: member.role,
        },
        403,
      );
    }

    c.set("member", member);

    await next();
  };
};

export const canModifyResource = (
  memberRole: MemberRole | string,
  resourceOwnerId: string,
  currentUserId: string,
  requiredRoleForAny: MemberRole[] = [MemberRole.ADMIN, MemberRole.MANAGER],
): boolean => {
  if (requiredRoleForAny.includes(memberRole as MemberRole)) {
    return true;
  }

  return resourceOwnerId === currentUserId;
};
