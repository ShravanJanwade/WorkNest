"use client";

import { WorkspaceAnalyticsResponseType } from "@/features/workspaces/api/use-get-workspace-analytics";

import { DottedSeparator } from "@/components/dotted-separator";
import { AnalyticsCard } from "@/components/analytics-card";

import { AnalyticsBarChart } from "./analytics-bar-chart";
import { AnalyticsPieChart } from "./analytics-pie-chart";
import { AnalyticsAssigneeChart } from "./analytics-assignee-chart";
import { AnalyticsProjectChart } from "./analytics-project-chart";

export const WorkspaceDashboard = ({ data }: WorkspaceAnalyticsResponseType) => {
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

      {/* 2. Global Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[400px]">
        {/* Status Breakdown */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
             <AnalyticsBarChart 
                title="Workspace Status Distribution" 
                data={data.tasksByStatus || []} 
                description="Aggregated task status across all projects"
             />
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <AnalyticsPieChart 
                title="Global Priority Metrics" 
                data={data.tasksByPriority || []} 
                description="Task priorities across the workspace"
            />
        </div>
      </div>
      
       {/* 3. Detailed Stats Row */}
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[400px]">
             {/* Project Comparison */}
             <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <AnalyticsProjectChart 
                    title="Tasks by Project"
                    data={data.tasksByProject || []}
                    description="Workload distribution among projects"
                />
             </div>

             {/* Assignee Leaderboard */}
             <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <AnalyticsAssigneeChart 
                    title="Top Contributors"
                    data={data.tasksByAssignee || []}
                    description="Most active members across workspace"
                />
             </div>
       </div>
    </div>
  );
};
