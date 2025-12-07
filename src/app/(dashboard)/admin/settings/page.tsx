"use client";

import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Settings, 
  Building2, 
  Shield, 
  Bell, 
  Palette,
  ArrowLeft,
  Save
} from "lucide-react";

import { useCurrent } from "@/features/auth/api/use-current";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AdminSettingsPage = () => {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useCurrent();

  if (isLoadingUser) {
    return (
      <div className="flex flex-col gap-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <Separator />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your organization settings and preferences
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-600" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic organization configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Public Workspace Creation</Label>
                <p className="text-sm text-muted-foreground">
                  Enable members to create their own workspaces
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Admin Approval for New Members</Label>
                <p className="text-sm text-muted-foreground">
                  New member invitations require admin approval
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security
            </CardTitle>
            <CardDescription>
              Security and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin accounts
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Auto-logout inactive users after 30 minutes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Notifications
            </CardTitle>
            <CardDescription>
              Email and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications for New Members</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email when new members join
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Activity Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summary of organization activity
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
