"use client";

import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";

import { DottedSeparator } from "@/components/dotted-separator";
import { AnalyticsCard } from "@/components/analytics-card";

import { AnalyticsBarChart } from "./analytics-bar-chart";
import { AnalyticsPieChart } from "./analytics-pie-chart";
import { AnalyticsAssigneeChart } from "./analytics-assignee-chart";

export const AnalyticsDashboard = ({ data }: ProjectAnalyticsResponseType) => {
  return (
    <div className="flex flex-col gap-y-6">
      {/* 1. Key Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
         <AnalyticsCard
            title="Total Tasks"
            value={data.taskCount}
            variant={data.taskDifference > 0 ? "up" : "down"}
            increaseValue={data.taskDifference}
          />
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.assignedTaskCount}
            variant={data.assignedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskDifference}
          />
          <AnalyticsCard
            title="Completed Tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.completedTaskDifference}
          />
          <AnalyticsCard
            title="Overdue Tasks"
            value={data.overdueTaskCount}
            variant={data.overdueTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.overdueTaskDifference}
          />
          <AnalyticsCard
            title="Incomplete Tasks"
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.incompleteTaskDifference}
          />
      </div>

      <DottedSeparator />

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[400px]">
        {/* Status Breakdown */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
             <AnalyticsBarChart 
                title="Task Status Distribution" 
                data={data.tasksByStatus || []} 
                description="Number of tasks in each status"
             />
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <AnalyticsPieChart 
                title="Task Priority Distribution" 
                data={data.tasksByPriority || []} 
                description="Tasks by priority level"
            />
        </div>
      </div>
      
       {/* 3. Assignee Wrapper */}
       <div className="grid grid-cols-1 gap-6 h-[400px]">
           <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
             <AnalyticsAssigneeChart 
               title="Top Assignees"
               data={data.tasksByAssignee || []}
               description="Most active members by task count"
             />
           </div>
       </div>
    </div>
  );
};
