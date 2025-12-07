"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  FolderKanban,
  Shield,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
} from "lucide-react";

import { useCurrent } from "@/features/auth/api/use-current";
import { useGetAdminStats } from "@/features/admin/api/use-get-admin-stats";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useInviteModal } from "@/features/workspaces/hooks/use-invite-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboardPage = () => {
  const { data: user, isLoading: isLoadingUser } = useCurrent();
  const { data: stats, isLoading: isLoadingStats } = useGetAdminStats();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspaces();
  const { open } = useInviteModal();

  if (isLoadingUser || isLoadingWorkspaces) {
    return <AdminDashboardSkeleton />;
  }

  const workspaceId = workspaces?.documents[0]?.$id;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-y-6 p-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization, users, and workspaces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={workspaceId ? `/workspaces/${workspaceId}/settings` : "/admin/settings"}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button onClick={open} className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Users
          </Button>
        </div>
      </div>

      <Separator />

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Workspaces"
          value={stats?.workspaceCount ?? 0}
          icon={<FolderKanban className="h-5 w-5 text-violet-600" />}
          isLoading={isLoadingStats}
        />

        <StatsCard
          title="Total Members"
          value={stats?.totalMembers ?? 0}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          isLoading={isLoadingStats}
        />

        <StatsCard
          title="Administrators"
          value={stats?.roleDistribution?.admins ?? 0}
          icon={<Shield className="h-5 w-5 text-red-600" />}
          isLoading={isLoadingStats}
        />

        <StatsCard
          title="Managers"
          value={stats?.roleDistribution?.managers ?? 0}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          isLoading={isLoadingStats}
        />
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {}
        <Card className="border-2 hover:border-violet-200 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Building2 className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Manage your company information and branding</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/company">Edit Company Profile</Link>
            </Button>
          </CardContent>
        </Card>

        {}
        <Card className="border-2 hover:border-blue-200 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Invite users, manage roles, and control access</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        {}
        <Card className="border-2 hover:border-green-200 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Global Analytics</CardTitle>
                <CardDescription>View organization-wide performance metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        {}
        <Card className="border-2 hover:border-amber-200 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-3">
                <RoleBar
                  label="Administrators"
                  count={stats?.roleDistribution?.admins ?? 0}
                  total={stats?.totalMembers ?? 1}
                  color="bg-red-500"
                />

                <RoleBar
                  label="Managers"
                  count={stats?.roleDistribution?.managers ?? 0}
                  total={stats?.totalMembers ?? 1}
                  color="bg-blue-500"
                />

                <RoleBar
                  label="Employees"
                  count={stats?.roleDistribution?.employees ?? 0}
                  total={stats?.totalMembers ?? 1}
                  color="bg-green-500"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-3xl font-bold">{value}</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-muted">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const RoleBar = ({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const AdminDashboardSkeleton = () => (
  <div className="flex flex-col gap-y-6 p-6">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-4 w-96" />
    <Separator />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  </div>
);

export default AdminDashboardPage;
