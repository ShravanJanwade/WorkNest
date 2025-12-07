"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { SolutionFinder } from "@/components/solution-finder";

import { useGetTask } from "@/features/tasks/api/use-get-task";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-breadcrumbs";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { SubtasksTable } from "@/features/tasks/components/subtasks-table";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
           <TaskBreadcrumbs project={data.project} task={data} />
           <SolutionFinder defaultQuery={data.name} />
      </div>
      
      {/* Top Section: Overview & Time Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Task Details</h2>
             </div>
             <TaskOverview task={data} />
          </div>
          
          <TaskDescription task={data} />
        </div>

        <div className="lg:col-span-1">
           <div className="bg-white rounded-lg border p-6 sticky top-6">
              <TimeEntriesList taskId={taskId} taskName={data.name} />
           </div>
        </div>
      </div>

      {/* Middle Section: Subtasks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg border p-6 h-[500px] flex flex-col">
            <SubtasksTable taskId={taskId} />
         </div>
         <div className="bg-white rounded-lg border p-6 h-[500px] overflow-y-auto custom-scrollbar">
            <ActivityTimeline taskId={taskId} />
         </div>
      </div>

      {/* Bottom Section: Comments */}
      <div className="bg-white rounded-lg border p-6">
         <CommentThread taskId={taskId} />
      </div>
    </div>
  );
};
