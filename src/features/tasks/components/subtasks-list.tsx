"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { useGetTasks } from "../api/use-get-tasks";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { KanbanCard } from "./kanban-card";

interface SubtasksListProps {
  taskId: string;
}

export const SubtasksList = ({ taskId }: SubtasksListProps) => {
  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();
  const { data: tasks, isLoading } = useGetTasks({
    workspaceId,
    parentId: taskId,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Subtasks</h3>
        <Button size="sm" variant="outline" onClick={() => open(taskId)}>
          <PlusIcon className="size-4 mr-2" />
          Add Subtask
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : tasks?.documents.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground text-sm border rounded-lg border-dashed">
          No subtasks found. Add one to break down this task.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {tasks?.documents.map((task) => (
            <KanbanCard key={task.$id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
