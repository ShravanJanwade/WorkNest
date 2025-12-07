"use client";

import { useState } from "react";
import { 
  Trash2, 
  Building2, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

import { useGetDeleteRequests } from "@/features/superadmin/api/use-get-delete-requests";
import { useApproveDelete } from "@/features/superadmin/api/use-approve-delete";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DeleteRequestsPage = () => {
  const { data: requests, isLoading } = useGetDeleteRequests();
  const { mutate: approveDelete, isPending } = useApproveDelete();
  
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleAction = (approved: boolean) => {
    if (!selectedCompany) return;
    
    approveDelete({
      json: {
        companyId: selectedCompany.$id,
        approved,
      }
    }, {
      onSuccess: () => {
        setSelectedCompany(null);
        setAction(null);
      }
    });
  };

  const pendingRequests = requests?.documents ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">Pending Actions</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Delete Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and process company deletion requests
        </p>
      </div>

      {/* Requests */}
      <Card className="shadow-lg shadow-violet-100/50 border-violet-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Pending Requests ({pendingRequests.length})
          </CardTitle>
          <CardDescription>
            Companies that have requested to be deleted from the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-green-100 w-fit mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">All clear!</h3>
              <p className="text-muted-foreground mt-1">
                No pending deletion requests at this time
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((company: any) => (
                <div 
                  key={company.$id}
                  className="p-4 border border-amber-200 bg-amber-50/50 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Building2 className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.adminEmail}</p>
                        <div className="mt-2">
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Requested: {new Date(company.deleteRequestedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        {company.deleteRequestReason && (
                          <div className="mt-3 p-3 bg-white rounded-lg border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Reason:</p>
                            <p className="text-sm text-gray-700">{company.deleteRequestReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company);
                          setAction("reject");
                        }}
                        className="border-gray-300"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company);
                          setAction("approve");
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve Deletion
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === "approve" ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-600" />
              )}
              {action === "approve" ? "Confirm Deletion" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve" 
                ? `Are you sure you want to permanently delete "${selectedCompany?.name}"? This action cannot be undone.`
                : `Reject the deletion request for "${selectedCompany?.name}"? The company will remain active.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelectedCompany(null)}
            >
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "destructive" : "default"}
              className="flex-1"
              onClick={() => handleAction(action === "approve")}
              disabled={isPending}
            >
              {isPending ? "Processing..." : action === "approve" ? "Delete Company" : "Reject Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteRequestsPage;
