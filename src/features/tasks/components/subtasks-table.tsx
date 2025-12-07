"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon, Search, MoreHorizontal } from "lucide-react";
import { useGetTasks } from "../api/use-get-tasks";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { Task, TaskPriority, TaskStatus } from "../types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { PriorityIcon } from "./priority-selector";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { TaskActions } from "./task-actions";

interface SubtasksTableProps {
  taskId: string;
}

export const SubtasksTable = ({ taskId }: SubtasksTableProps) => {
  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: tasks, isLoading } = useGetTasks({
    workspaceId,
    parentId: taskId,
  });

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const filteredTasks = tasks?.documents.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Subtasks</h3>
        <Button size="sm" variant="outline" onClick={() => open(taskId)}>
          <PlusIcon className="size-4 mr-2" />
          Add Subtask
        </Button>
      </div>

      <div className="flex items-center gap-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subtasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
            <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
            <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTasks?.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground text-sm border rounded-lg border-dashed">
          No subtasks found.
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks?.map((task) => (
                <TableRow key={task.$id}>
                  <TableCell>
                    <div className="flex items-center gap-x-2">
                      <PriorityIcon priority={task.priority as TaskPriority} />
                      <span className="font-medium truncate max-w-[200px]" title={task.name}>
                        {task.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status}>{snakeCaseToTitleCase(task.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-x-2">
                      <MemberAvatar
                        name={task.assignee.name}
                        className="size-6"
                        fallbackClassName="text-[10px]"
                      />

                      <span className="text-xs text-muted-foreground hidden xl:block">
                        {task.assignee.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TaskDate value={task.dueDate} className="text-xs" />
                  </TableCell>
                  <TableCell>
                    <TaskActions id={task.$id} projectId={task.projectId}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TaskActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
