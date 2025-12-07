"use client";

import { WorkspaceAnalyticsResponseType } from "@/features/workspaces/api/use-get-workspace-analytics";

import { DottedSeparator } from "@/components/dotted-separator";
import { AnalyticsCard } from "@/components/analytics-card";

import { AnalyticsBarChart } from "./analytics-bar-chart";
import { AnalyticsPieChart } from "./analytics-pie-chart";
import { AnalyticsAssigneeChart } from "./analytics-assignee-chart";
import { AnalyticsProjectChart } from "./analytics-project-chart";
import { QuoteWidget } from "./quote-widget";

export const WorkspaceDashboard = ({ data }: WorkspaceAnalyticsResponseType) => {
  return (
    <div className="flex flex-col gap-y-4 sm:gap-y-6">
      {/* Quote Widget */}
      <QuoteWidget />

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4 w-full">
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-card dark:bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <AnalyticsBarChart
            title="Workspace Status Distribution"
            data={data.tasksByStatus || []}
            description="Aggregated task status across all projects"
          />
        </div>

        {/* Priority Chart */}
        <div className="bg-card dark:bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <AnalyticsPieChart
            title="Global Priority Metrics"
            data={data.tasksByPriority || []}
            description="Task priorities across the workspace"
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Project Chart */}
        <div className="bg-card dark:bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <AnalyticsProjectChart
            title="Tasks by Project"
            data={data.tasksByProject || []}
            description="Workload distribution among projects"
          />
        </div>

        {/* Assignee Chart */}
        <div className="bg-card dark:bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
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
