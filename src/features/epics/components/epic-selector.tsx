"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetEpics } from "../api/use-get-epics";

interface EpicSelectorProps {
  projectId: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const EpicSelector = ({
  projectId,
  value,
  onChange,
  disabled,
}: EpicSelectorProps) => {
  const workspaceId = useWorkspaceId();
  const { data: epics, isLoading } = useGetEpics({ workspaceId, projectId });

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger>
        <SelectValue placeholder="Select epic" />
      </SelectTrigger>
      <SelectContent>
        {epics?.documents.map((epic: any) => (
          <SelectItem key={epic.$id} value={epic.$id}>
            {epic.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
