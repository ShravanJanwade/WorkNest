"use client";

import { CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useResetInviteCode } from "@/features/workspaces/api/use-reset-invite-code";
import { ResponsiveModal } from "@/components/responsive-modal";

import { useInviteModal } from "../hooks/use-invite-modal";

export const InviteModal = () => {
  const workspaceId = useWorkspaceId();
  const { isOpen, close } = useInviteModal();

  const { data: workspace } = useGetWorkspace({ workspaceId });
  const { mutate, isPending } = useResetInviteCode();

  if (!workspace) return null;

  const fullInviteLink = `${window.location.origin}/workspaces/${workspaceId}/join/${workspace.inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success("Invite link copied to clipboard"));
  };

  const handleReset = () => {
    mutate({ param: { workspaceId } });
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="p-7">
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>
            Use the copy link to add members to your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-7">
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-2">
              <Input disabled value={fullInviteLink} />
              <Button onClick={handleCopy} variant="secondary" className="size-12">
                <CopyIcon className="size-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between w-full">
              <Button
                disabled={isPending}
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Reset invite link
                <RefreshCcw className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};
