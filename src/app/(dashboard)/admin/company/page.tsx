"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Building2, Save, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

import { useCurrent } from "@/features/auth/api/use-current";
import { useGetCompany } from "@/features/admin/api/use-get-company";
import { useRequestDelete } from "@/features/admin/api/use-request-delete";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

const AdminCompanyPage = () => {
  const { data: user, isLoading: isLoadingUser } = useCurrent();
  const { data: company, isLoading: isLoadingCompany } = useGetCompany();
  const { mutate: requestDelete, isPending: isRequesting } = useRequestDelete();

  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoadingUser || isLoadingCompany) {
    return <CompanyPageSkeleton />;
  }

  if (!user) {
    redirect("/sign-in");
  }

  const handleRequestDelete = () => {
    if (deleteReason.length < 10) {
      toast.error("Please provide a reason with at least 10 characters");
      return;
    }

    requestDelete(
      { json: { reason: deleteReason } },
      {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setDeleteReason("");
          toast.success("Deletion request submitted. Super Admin will review.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-y-6 p-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Company Profile
          </h1>
          <p className="text-muted-foreground mt-1">Manage your organization's information</p>
        </div>
      </div>

      <Separator />

      {}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100">
              <Building2 className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Your company information as configured by the platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {company ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="text-lg font-semibold">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Admin Email</label>
                  <p className="text-lg">{company.adminEmail}</p>
                </div>
              </div>
              {company.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-muted-foreground">{company.description}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-4">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    company.status === "active"
                      ? "bg-green-100 text-green-700"
                      : company.deleteRequested
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {company.deleteRequested ? "Deletion Pending" : company.status}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No company profile found.</p>
              <p className="text-sm mt-2">Contact Super Admin to set up your company.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {}
      {company && !company.deleteRequested && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your entire organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Company Deletion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Company Deletion</DialogTitle>
                  <DialogDescription>
                    This will submit a deletion request to the Super Admin. All workspaces,
                    projects, and data will be permanently deleted if approved.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for deletion *</label>
                    <Textarea
                      placeholder="Please explain why you want to delete this company (min 10 characters)"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleRequestDelete}
                    disabled={isRequesting || deleteReason.length < 10}
                    className="w-full"
                  >
                    {isRequesting ? "Submitting..." : "Submit Deletion Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CompanyPageSkeleton = () => (
  <div className="flex flex-col gap-y-6 p-6">
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-4 w-96" />
    <Separator />
    <Skeleton className="h-64 w-full" />
  </div>
);

export default AdminCompanyPage;
