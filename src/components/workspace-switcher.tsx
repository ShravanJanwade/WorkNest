"use client";

import { useEffect } from "react";
import { RiAddCircleFill } from "react-icons/ri";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { useWorkspacePersistence } from "@/features/workspaces/hooks/use-workspace-persistence";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data: workspaces } = useGetWorkspaces();
  const { open } = useCreateWorkspaceModal();
  const { savedWorkspaceId, saveWorkspaceId } = useWorkspacePersistence();

  // Auto-navigate to saved workspace if no workspace is selected
  useEffect(() => {
    if (!workspaceId && savedWorkspaceId && workspaces?.documents.length) {
      const workspaceExists = workspaces.documents.some(
        (w) => w.$id === savedWorkspaceId
      );
      if (workspaceExists) {
        router.push(`/workspaces/${savedWorkspaceId}`);
      }
    }
  }, [workspaceId, savedWorkspaceId, workspaces, router]);

  const onSelect = (id: string) => {
    saveWorkspaceId(id);
    router.push(`/workspaces/${id}`);
  };

  // Save current workspace when it changes
  useEffect(() => {
    if (workspaceId) {
      saveWorkspaceId(workspaceId);
    }
  }, [workspaceId, saveWorkspaceId]);

  // Determine the value to display in the select
  const selectValue = workspaceId || savedWorkspaceId || workspaces?.documents[0]?.$id;

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      <Select onValueChange={onSelect} value={selectValue}>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
          <SelectValue placeholder="No workspace selected." />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspace) => (
            <SelectItem key={workspace.$id} value={workspace.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.imageUrl}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
