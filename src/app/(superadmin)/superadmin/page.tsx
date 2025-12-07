"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Plus,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { useGetSuperAdminStats } from "@/features/superadmin/api/use-get-stats";
import { useGetSuperAdminCompanies } from "@/features/superadmin/api/use-get-companies";
import { useCreateCompany } from "@/features/superadmin/api/use-create-company";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SuperAdminDashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useGetSuperAdminStats();
  const { data: companies, isLoading: isLoadingCompanies } = useGetSuperAdminCompanies();
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const filteredCompanies =
    companies?.documents?.filter(
      (company: any) =>
        company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  const handleCreateCompany = () => {
    if (!companyName || !adminName || !adminEmail) return;

    createCompany(
      {
        json: {
          companyName,
          companyDescription,
          adminName,
          adminEmail,
        },
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setCompanyName("");
          setCompanyDescription("");
          setAdminName("");
          setAdminEmail("");
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      {}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-medium text-violet-600">Platform Overview</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage companies, administrators, and platform settings
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200">
              <Plus className="h-4 w-4 mr-2" />
              Create Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Company</DialogTitle>
              <DialogDescription>
                Create a company and provision its administrator account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  placeholder="Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border-violet-200 focus-visible:ring-violet-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief company description"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="border-violet-200 focus-visible:ring-violet-500"
                />
              </div>

              <Separator />

              <div className="pt-2">
                <h4 className="text-sm font-semibold text-violet-700 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Company Administrator
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Name *</label>
                    <Input
                      placeholder="John Doe"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="border-violet-200 focus-visible:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Email *</label>
                    <Input
                      placeholder="admin@acme.com"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="border-violet-200 focus-visible:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Temporary Password</p>
                    <p className="text-amber-700 mt-1">
                      A temporary password will be generated and logged to the server console. Share
                      these credentials securely with the admin.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateCompany}
                disabled={isCreating || !companyName || !adminName || !adminEmail}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {isCreating ? "Creating..." : "Create Company & Admin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Companies"
          value={stats?.totalCompanies ?? 0}
          icon={<Building2 className="h-6 w-6" />}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          trend="+12%"
          isLoading={isLoadingStats}
        />

        <StatsCard
          title="Active Companies"
          value={stats?.activeCompanies ?? 0}
          icon={<CheckCircle className="h-6 w-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          trend="+8%"
          isLoading={isLoadingStats}
        />

        <StatsCard
          title="Pending Deletions"
          value={stats?.pendingDeletes ?? 0}
          icon={<Clock className="h-6 w-6" />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          trend={
            stats?.pendingDeletes && stats.pendingDeletes > 0 ? "Requires action" : "All clear"
          }
          isLoading={isLoadingStats}
        />
      </div>

      {}
      <Card className="shadow-lg shadow-violet-100/50 border-violet-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-violet-600" />
                Companies
              </CardTitle>
              <CardDescription>Manage all registered companies on the platform</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-violet-200 focus-visible:ring-violet-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCompanies ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-violet-100 w-fit mx-auto mb-4">
                <Building2 className="h-10 w-10 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No companies yet</h3>
              <p className="text-muted-foreground mt-1">
                Get started by creating your first company
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Company
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Company</TableHead>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company: any) => (
                  <TableRow key={company.$id} className="hover:bg-violet-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-violet-100 to-indigo-100">
                          <Building2 className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          {company.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {company.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-700">{company.adminEmail || "N/A"}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={company.status}
                        deleteRequested={company.deleteRequested}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(company.$createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend: string;
  isLoading: boolean;
}) => (
  <Card className="shadow-lg shadow-violet-100/50 border-violet-100 overflow-hidden">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-20 mt-1" />
          ) : (
            <p className="text-4xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({
  status,
  deleteRequested,
}: {
  status: string;
  deleteRequested?: boolean;
}) => {
  if (deleteRequested) {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        <Clock className="h-3 w-3 mr-1" />
        Deletion Pending
      </Badge>
    );
  }

  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );

    case "deleted":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Deleted</Badge>
      );

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default SuperAdminDashboard;
