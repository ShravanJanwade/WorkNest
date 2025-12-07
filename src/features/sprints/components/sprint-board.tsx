"use client";

import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import {
  Play,
  CheckCircle,
  Calendar,
  Target,
  MoreHorizontal,
  Plus,
  Loader2,
  Trash2,
  Flag,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DottedSeparator } from "@/components/dotted-separator";

import { useGetSprints } from "../api/use-get-sprints";
import { useStartSprint } from "../api/use-start-sprint";
import { useCompleteSprint } from "../api/use-complete-sprint";
import { SprintWithStats } from "../types";

interface SprintBoardProps {
  workspaceId: string;
  projectId?: string;
}

export const SprintBoard = ({ workspaceId, projectId }: SprintBoardProps) => {
  const { data, isLoading } = useGetSprints({ workspaceId, projectId });
  const { mutate: startSprint, isPending: isStarting } = useStartSprint({ workspaceId });
  const { mutate: completeSprint, isPending: isCompleting } = useCompleteSprint({ workspaceId });

  const handleStart = (sprintId: string) => {
    startSprint({ param: { sprintId } });
  };

  const handleComplete = (sprintId: string) => {
    completeSprint({ param: { sprintId } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const activeSprint = data?.documents.find((s) => s.status === "active");
  const plannedSprints = data?.documents.filter((s) => s.status === "planned") || [];
  const completedSprints = data?.documents.filter((s) => s.status === "completed") || [];

  return (
    <div className="space-y-6">
      {}
      {activeSprint && (
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Active Sprint
          </h3>
          <SprintCard
            sprint={activeSprint}
            onComplete={() => handleComplete(activeSprint.$id)}
            isLoading={isCompleting}
            isActive
          />
        </div>
      )}

      <DottedSeparator />

      {}
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Planned Sprints ({plannedSprints.length})
        </h3>
        {plannedSprints.length > 0 ? (
          <div className="grid gap-4">
            {plannedSprints.map((sprint) => (
              <SprintCard
                key={sprint.$id}
                sprint={sprint}
                onStart={() => handleStart(sprint.$id)}
                isLoading={isStarting}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No planned sprints</p>
        )}
      </div>

      <DottedSeparator />

      {}
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-gray-500" />
          Completed Sprints ({completedSprints.length})
        </h3>
        {completedSprints.length > 0 ? (
          <div className="grid gap-4">
            {completedSprints.slice(0, 3).map((sprint) => (
              <SprintCard key={sprint.$id} sprint={sprint} isCompleted />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No completed sprints</p>
        )}
      </div>
    </div>
  );
};

interface SprintCardProps {
  sprint: SprintWithStats;
  onStart?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
  isActive?: boolean;
  isCompleted?: boolean;
}

const SprintCard = ({
  sprint,
  onStart,
  onComplete,
  isLoading,
  isActive,
  isCompleted,
}: SprintCardProps) => {
  const progress =
    sprint.stats.totalTasks > 0
      ? Math.round((sprint.stats.completedTasks / sprint.stats.totalTasks) * 100)
      : 0;

  const daysRemaining = differenceInDays(new Date(sprint.endDate), new Date());

  const statusColors = {
    planned: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };

  return (
    <Card
      className={cn(
        "transition-all",
        isActive && "border-green-300 shadow-md",
        isCompleted && "opacity-75",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{sprint.name}</CardTitle>
              <Badge className={statusColors[sprint.status]}>
                {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
              </Badge>
            </div>
            {sprint.goal && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                {sprint.goal}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sprint.status === "planned" && onStart && (
                <DropdownMenuItem onClick={onStart} disabled={isLoading}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Sprint
                </DropdownMenuItem>
              )}
              {sprint.status === "active" && onComplete && (
                <DropdownMenuItem onClick={onComplete} disabled={isLoading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Sprint
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Sprint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {format(new Date(sprint.startDate), "MMM d")} -{" "}
              {format(new Date(sprint.endDate), "MMM d, yyyy")}
            </span>
            {isActive && daysRemaining >= 0 && (
              <span
                className={cn("font-medium", daysRemaining <= 3 ? "text-red-600" : "text-gray-600")}
              >
                {daysRemaining} days remaining
              </span>
            )}
          </div>

          {}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="text-center">
              <p className="text-lg font-semibold">{sprint.stats.totalTasks}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{sprint.stats.completedTasks}</p>
              <p className="text-xs text-gray-500">Done</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{sprint.stats.inProgressTasks}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600">{sprint.stats.remainingTasks}</p>
              <p className="text-xs text-gray-500">Remaining</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
