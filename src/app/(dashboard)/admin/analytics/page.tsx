"use client";

import { redirect } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Users,
  FolderKanban,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import { useCurrent } from "@/features/auth/api/use-current";
import { useGetAdminStats } from "@/features/admin/api/use-get-admin-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const AdminAnalyticsPage = () => {
  const { data: user, isLoading: isLoadingUser } = useCurrent();
  const { data: stats, isLoading: isLoadingStats } = useGetAdminStats();

  if (isLoadingUser) {
    return <AnalyticsSkeleton />;
  }

  if (!user) {
    redirect("/sign-in");
  }

  const totalRoles =
    (stats?.roleDistribution?.admins ?? 0) +
    (stats?.roleDistribution?.managers ?? 0) +
    (stats?.roleDistribution?.employees ?? 0);

  return (
    <div className="flex flex-col gap-y-6 p-6">
      {}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Global Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Organization-wide performance metrics and insights
        </p>
      </div>

      <Separator />

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600 font-medium">Total Workspaces</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-violet-700">{stats?.workspaceCount ?? 0}</p>
                )}
              </div>
              <div className="p-3 rounded-full bg-violet-100">
                <FolderKanban className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Team Members</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-blue-700">{stats?.totalMembers ?? 0}</p>
                )}
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Roles</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-green-700">{totalRoles}</p>
                )}
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Role Distribution
            </CardTitle>
            <CardDescription>Breakdown of team members by role</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <RoleRow
                  label="Administrators"
                  count={stats?.roleDistribution?.admins ?? 0}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  color="bg-red-500"
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                />

                <RoleRow
                  label="Managers"
                  count={stats?.roleDistribution?.managers ?? 0}
                  icon={<Clock className="h-4 w-4" />}
                  color="bg-blue-500"
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                />

                <RoleRow
                  label="Employees"
                  count={stats?.roleDistribution?.employees ?? 0}
                  icon={<CheckCircle className="h-4 w-4" />}
                  color="bg-green-500"
                  bgColor="bg-green-50"
                  textColor="text-green-700"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Health</CardTitle>
            <CardDescription>Key metrics to monitor your organization's health</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <HealthMetric
                  label="Members per Workspace"
                  value={
                    stats?.workspaceCount
                      ? (stats.totalMembers / stats.workspaceCount).toFixed(1)
                      : "0"
                  }
                  status="good"
                />

                <HealthMetric
                  label="Admin Coverage"
                  value={`${stats?.roleDistribution?.admins ?? 0} admins`}
                  status={
                    stats?.roleDistribution?.admins && stats.roleDistribution.admins >= 1
                      ? "good"
                      : "warning"
                  }
                />

                <HealthMetric
                  label="Manager to Employee Ratio"
                  value={
                    stats?.roleDistribution?.employees
                      ? `1:${Math.round(stats.roleDistribution.employees / Math.max(stats.roleDistribution.managers ?? 1, 1))}`
                      : "N/A"
                  }
                  status="neutral"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RoleRow = ({
  label,
  count,
  icon,
  color,
  bgColor,
  textColor,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
}) => (
  <div className={`flex items-center justify-between p-4 rounded-lg ${bgColor}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${color} text-white`}>{icon}</div>
      <span className={`font-medium ${textColor}`}>{label}</span>
    </div>
    <span className={`text-2xl font-bold ${textColor}`}>{count}</span>
  </div>
);

const HealthMetric = ({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "good" | "warning" | "neutral";
}) => {
  const statusColors = {
    good: "text-green-600",
    warning: "text-amber-600",
    neutral: "text-blue-600",
  };

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${statusColors[status]}`}>{value}</span>
    </div>
  );
};

const AnalyticsSkeleton = () => (
  <div className="flex flex-col gap-y-6 p-6">
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-4 w-96" />
    <Separator />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <div className="grid grid-cols-2 gap-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

export default AdminAnalyticsPage;
