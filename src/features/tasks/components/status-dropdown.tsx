"use client";

import { Loader2 } from "lucide-react";
import { cn, snakeCaseToTitleCase } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateTask } from "../api/use-update-task";
import { TaskStatus } from "../types";

interface StatusDropdownProps {
  id: string;
  status: TaskStatus;
  className?: string;
  projectId?: string; // Optional if needed for invalidation context
}

export const StatusDropdown = ({ 
  id, 
  status, 
  className,
  projectId 
}: StatusDropdownProps) => {
  const { mutate, isPending } = useUpdateTask();

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === status) return;
    
    mutate({
      param: { taskId: id },
      json: { status: newStatus },
    });
  };

  const statusColorMap: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: "bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-100/80",
    [TaskStatus.TODO]: "bg-red-100 text-red-700 border-red-300 hover:bg-red-100/80",
    [TaskStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100/80",
    [TaskStatus.IN_REVIEW]: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100/80",
    [TaskStatus.DONE]: "bg-green-100 text-green-700 border-green-300 hover:bg-green-100/80",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <div
          className={cn(
            "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            statusColorMap[status],
            isPending && "opacity-50 cursor-not-allowed",
            className
          )}
          role="button"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : null}
          {snakeCaseToTitleCase(status)}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {Object.values(TaskStatus).map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleStatusChange(s)}
            className="flex items-center cursor-pointer"
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full mr-2",
                statusColorMap[s].split(" ")[0].replace("bg-", "bg-") // Hacky way to get dot color, better to define explicit map if needed
                  .replace("-100", "-500")
              )}
            />
            {snakeCaseToTitleCase(s)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
