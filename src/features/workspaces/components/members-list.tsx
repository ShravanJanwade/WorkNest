"use client";

import { Fragment } from "react";
import { ArrowLeft, MoreVerticalIcon, Shield, UserCog, Briefcase } from "lucide-react";
import Link from "next/link";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { MemberRole } from "@/features/members/types";
import { getRoleLabel, getRoleColor } from "@/lib/permissions";

import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { useCurrent } from "@/features/auth/api/use-current";

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace.",
    "destructive"
  );

  const { data: user } = useCurrent();
  const { data } = useGetMembers({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const currentMember = data?.documents.find((m) => m.userId === user?.$id);
  const isAdmin = currentMember?.role === MemberRole.ADMIN;

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({ json: { role }, param: { memberId } });
  };
   // ... (existing helper functions)

  return (
    <Card className="size-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {data?.documents.map((member, index) => (
          <Fragment key={member.$id}>
            <div className="flex items-center gap-2">
              <MemberAvatar
                className="size-10"
                fallbackClassName="text-lg"
                name={member.name}
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <Badge className={`ml-2 ${getRoleColor(member.role as MemberRole)}`}>
                {getRoleLabel(member.role as MemberRole)}
              </Badge>
              
              {/* Only Admins can manage other members */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="ml-auto" variant="secondary" size="icon">
                      <MoreVerticalIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                      className="font-medium"
                      onClick={() =>
                        handleUpdateMember(member.$id, MemberRole.ADMIN)
                      }
                      disabled={isUpdatingMember}
                    >
                      <Shield className="size-4 mr-2 text-red-600" />
                      Set as Administrator
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="font-medium"
                      onClick={() =>
                        handleUpdateMember(member.$id, MemberRole.MANAGER)
                      }
                      disabled={isUpdatingMember}
                    >
                      <UserCog className="size-4 mr-2 text-blue-600" />
                      Set as Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="font-medium"
                      onClick={() =>
                        handleUpdateMember(member.$id, MemberRole.EMPLOYEE)
                      }
                      disabled={isUpdatingMember}
                    >
                      <Briefcase className="size-4 mr-2 text-green-600" />
                      Set as Employee
                    </DropdownMenuItem>
                    
                    {/* Prevent self-deletion */}
                    {member.userId !== user?.$id && (
                      <DropdownMenuItem
                        className="font-medium text-amber-700"
                        onClick={() =>
                          handleDeleteMember(member.$id)
                        }
                        disabled={isDeletingMember}
                      >
                        <RemoveIcon memberName={member.name} />
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {index < data.documents.length - 1 && (
              <Separator className="my-2.5" />
            )}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

const RemoveIcon = ({ memberName }: { memberName: string }) => (
    <>
        Remove {memberName}
    </>
);
