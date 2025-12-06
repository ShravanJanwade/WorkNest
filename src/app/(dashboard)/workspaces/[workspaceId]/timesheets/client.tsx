"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { TimesheetView } from "@/features/time-tracking/components/timesheet-view";

export const TimesheetsClient = () => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      <TimesheetView workspaceId={workspaceId} />
    </div>
  );
};
