"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { SolutionFinder } from "@/components/solution-finder";

import { useGetTask } from "@/features/tasks/api/use-get-task";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-breadcrumbs";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { SubtasksList } from "@/features/tasks/components/subtasks-list";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { CommentThread } from "@/features/comments/components/comment-thread";
import { TimeEntriesList } from "@/features/time-tracking/components/time-entries-list";
import { ActivityTimeline } from "@/features/activity/components/activity-timeline";

export const TaskIdClient = () => {
  const taskId = useTaskId();
  const { data, isLoading } = useGetTask({ taskId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError message="Task not found." />;
  }

  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs project={data.project} task={data} />
      <DottedSeparator className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskOverview task={data} />
        {/* Solution Finder - Helper for Devs */}
        <SolutionFinder defaultQuery={data.name} />
      </div>

      <DottedSeparator className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskDescription task={data} />
        <div className="flex flex-col gap-y-4">
          <div className="bg-white rounded-lg border p-6">
            <TimeEntriesList taskId={taskId} taskName={data.name} />
          </div>
          <div className="bg-white rounded-lg border p-6">
            <CommentThread taskId={taskId} />
          </div>
        </div>
      </div>

      <DottedSeparator className="my-6" />
      <div className="bg-white rounded-lg border p-6">
        <SubtasksList taskId={taskId} />
      </div>

      <DottedSeparator className="my-6" />
      <div className="bg-white rounded-lg border p-6">
        <ActivityTimeline taskId={taskId} />
      </div>
    </div>
  );
};
