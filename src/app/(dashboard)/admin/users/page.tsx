"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  UserCog,
  Briefcase,
  MoreVertical,
  Mail,
} from "lucide-react";

import { useCurrent } from "@/features/auth/api/use-current";
import { useGetAdminUsers } from "@/features/admin/api/use-get-admin-users";
import { useInviteUser } from "@/features/admin/api/use-invite-user";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { MemberRole } from "@/features/members/types";
import { getRoleLabel, getRoleColor } from "@/lib/permissions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminUsersPage = () => {
  const { data: user, isLoading: isLoadingUser } = useCurrent();
  const { data: usersData, isLoading: isLoadingUsers } = useGetAdminUsers();
  const { data: workspaces } = useGetWorkspaces();
  const { mutate: inviteUser, isPending: isInviting } = useInviteUser();
  const { mutate: updateMember } = useUpdateMember();
  const { mutate: deleteMember } = useDeleteMember();

  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("EMPLOYEE");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  if (isLoadingUser) {
    return <UsersSkeleton />;
  }

  if (!user) {
    redirect("/sign-in");
  }

  const filteredUsers =
    usersData?.documents?.filter(
      (member: any) =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  const handleInvite = () => {
    if (!inviteEmail || !selectedWorkspace) return;

    inviteUser(
      {
        json: {
          email: inviteEmail,
          role: inviteRole as "ADMIN" | "MANAGER" | "EMPLOYEE",
          workspaceId: selectedWorkspace,
        },
      },
      {
        onSuccess: () => {
          setInviteEmail("");
          setIsInviteOpen(false);
        },
      },
    );
  };

  const handleRoleChange = (memberId: string, newRole: MemberRole) => {
    updateMember({
      json: { role: newRole },
      param: { memberId },
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      deleteMember({
        param: { memberId },
      });
    }
  };

  return (
    <div className="flex flex-col gap-y-6 p-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage team members and their roles</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>Send an invitation to add a new team member</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace</label>
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces?.documents?.map((ws: any) => (
                      <SelectItem key={ws.$id} value={ws.$id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="MANAGER">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-blue-600" />
                        Manager
                      </div>
                    </SelectItem>
                    <SelectItem value="EMPLOYEE">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        Employee
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail || !selectedWorkspace}
                className="w-full"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((member: any) => (
                <div
                  key={member.$id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white">
                        {member.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name || "Unknown User"}</p>
                        {member.userId === user?.$id && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getRoleColor(member.role as MemberRole)}>
                      {getRoleLabel(member.role as MemberRole)}
                    </Badge>
                    {}
                    {member.userId !== user?.$id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.$id, MemberRole.ADMIN)}
                          >
                            <Shield className="h-4 w-4 mr-2 text-red-600" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.$id, MemberRole.MANAGER)}
                          >
                            <UserCog className="h-4 w-4 mr-2 text-blue-600" />
                            Make Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.$id, MemberRole.EMPLOYEE)}
                          >
                            <Briefcase className="h-4 w-4 mr-2 text-green-600" />
                            Make Employee
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.$id)}
                            className="text-red-600"
                          >
                            Remove from Workspace
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const UsersSkeleton = () => (
  <div className="flex flex-col gap-y-6 p-6">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-4 w-96" />
    <Separator />
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-96 w-full" />
  </div>
);

export default AdminUsersPage;
