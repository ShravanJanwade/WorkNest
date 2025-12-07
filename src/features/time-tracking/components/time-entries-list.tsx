"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, Trash2, MoreHorizontal, DollarSign, PlusIcon } from "lucide-react";
import { ManualTimeEntryModal } from "./manual-time-entry-modal";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DottedSeparator } from "@/components/dotted-separator";

import { useGetTimeEntries } from "../api/use-get-time-entries";
import { useDeleteTimeEntry } from "../api/use-delete-time-entry";
import { TimerWidget } from "./timer-widget";

interface TimeEntriesListProps {
  taskId: string;
  taskName?: string;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
};

export const TimeEntriesList = ({ taskId, taskName }: TimeEntriesListProps) => {
  const { data, isLoading } = useGetTimeEntries({ taskId });
  const { mutate: deleteTimeEntry } = useDeleteTimeEntry();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (timeEntryId: string) => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      deleteTimeEntry({
        param: { timeEntryId },
      });
    }
  };

  return (
    <div className="space-y-4">
      <ManualTimeEntryModal
        taskId={taskId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Time Tracking</h3>
        </div>
        
        <div className="flex items-center gap-4">
          {data?.stats && (
            <div className="flex items-center gap-4 text-sm hidden sm:flex">
              <div className="text-gray-600">
                Total: <span className="font-semibold text-gray-900">{formatDuration(data.stats.totalMinutes)}</span>
              </div>
              {data.stats.billableMinutes > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="font-semibold">{formatDuration(data.stats.billableMinutes)}</span>
                </div>
              )}
            </div>
          )}
          <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="size-4 mr-2" />
            Log Time
          </Button>
        </div>
      </div>

      <DottedSeparator />

      {/* Timer Widget */}
      <TimerWidget taskId={taskId} taskName={taskName} />

      <DottedSeparator />

      {/* Time Entries */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      ) : data?.entries && data.entries.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">Recent time entries</p>
          {data.entries.slice(0, 5).map((entry) => (
            <div
              key={entry.$id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {entry.duration ? formatDuration(entry.duration) : "Running..."}
                    </span>
                    {entry.billable && (
                      <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700">
                        Billable
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(entry.startTime), "MMM d, yyyy")} at{" "}
                    {format(new Date(entry.startTime), "h:mm a")}
                    {entry.endTime && ` - ${format(new Date(entry.endTime), "h:mm a")}`}
                  </span>
                  {entry.description && (
                    <span className="text-xs text-gray-600 mt-1">{entry.description}</span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleDelete(entry.$id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No time tracked yet</p>
          <p className="text-xs text-gray-400">Start the timer or log time manually</p>
        </div>
      )}
    </div>
  );
};

