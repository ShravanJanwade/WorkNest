"use client";

import { cn } from "@/lib/utils";
import { SettingsIcon, UsersIcon, ClockIcon, ShieldIcon } from "lucide-react";
import Link from "next/link";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

import { usePathname } from "next/navigation";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";

interface RouteItem {
  label: string;
  href: string;
  icon: React.ElementType;
  activeIcon: React.ElementType;
  roles?: MemberRole[]; // If specified, only these roles can see this route
  isGlobal?: boolean; // If true, don't prefix with workspace
}

const routes: RouteItem[] = [
  {
    label: "Home",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
    roles: [MemberRole.ADMIN, MemberRole.MANAGER],
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
  {
    label: "Timesheets",
    href: "/timesheets",
    icon: ClockIcon,
    activeIcon: ClockIcon,
  },
];

// Admin-only route (not workspace-specific)
const adminRoute: RouteItem = {
  label: "Admin Panel",
  href: "/admin",
  icon: ShieldIcon,
  activeIcon: ShieldIcon,
  roles: [MemberRole.ADMIN],
  isGlobal: true,
};

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { data: user } = useCurrent();
  const { data: members } = useGetMembers({ workspaceId: workspaceId || "" });

  // Don't render navigation if no workspace is selected
  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
        Select a workspace to continue
      </div>
    );
  }

  // Get current user's role in this workspace
  const currentMember = members?.documents?.find(
    (m: any) => m.userId === user?.$id
  );
  const userRole = currentMember?.role as MemberRole | undefined;

  // Filter routes based on role
  const visibleRoutes = routes.filter((route) => {
    if (!route.roles) return true; // No role restriction
    return userRole && route.roles.includes(userRole);
  });

  // Check if user is admin for admin panel link
  const isAdmin = userRole === MemberRole.ADMIN;

  return (
    <ul className="flex flex-col">
      {visibleRoutes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link key={item.href} href={fullHref}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500 dark:text-neutral-400",
                isActive && "bg-white dark:bg-card shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5 text-neutral-500 dark:text-neutral-400" />
              {item.label}
            </div>
          </Link>
        );
      })}
      
      {/* Admin Panel Link - Only for Admins */}
      {isAdmin && (
        <>
          <div className="my-2 border-t border-neutral-200" />
          <Link href={adminRoute.href}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition",
                pathname.startsWith("/admin") 
                  ? "bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700" 
                  : "text-neutral-500"
              )}
            >
              <ShieldIcon className={cn(
                "size-5",
                pathname.startsWith("/admin") ? "text-violet-600" : "text-neutral-500"
              )} />
              {adminRoute.label}
            </div>
          </Link>
        </>
      )}
    </ul>
  );
};
