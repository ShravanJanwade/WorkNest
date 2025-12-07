"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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

const CompaniesPage = () => {
  const { data: companies, isLoading } = useGetSuperAdminCompanies();
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
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-violet-600" />
            <span className="text-sm font-medium text-violet-600">Company Management</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">All Companies</h1>
          <p className="text-muted-foreground mt-1">View and manage all registered companies</p>
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
                Create a company and send password reset email to administrator
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

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Password Reset Email</p>
                    <p className="text-blue-700 mt-1">
                      A password reset email will be sent to the admin email address. They can set
                      their password and access the platform.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateCompany}
                disabled={isCreating || !companyName || !adminName || !adminEmail}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {isCreating ? "Creating & Sending Email..." : "Create Company & Send Invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-violet-200 focus-visible:ring-violet-500"
        />
      </div>

      {}
      <Card className="shadow-lg shadow-violet-100/50 border-violet-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-600" />
            Companies ({filteredCompanies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
              <h3 className="text-lg font-semibold text-gray-900">No companies found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first company to get started"}
              </p>
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

export default CompaniesPage;
