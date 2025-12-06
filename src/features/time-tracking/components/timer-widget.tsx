"use client";

import { useEffect, useState } from "react";
import { Play, Square, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useGetActiveTimer } from "../api/use-get-active-timer";
import { useStartTimer } from "../api/use-start-timer";
import { useStopTimer } from "../api/use-stop-timer";

interface TimerWidgetProps {
  taskId: string;
  taskName?: string;
  className?: string;
  compact?: boolean;
}

export const TimerWidget = ({ taskId, taskName, className, compact = false }: TimerWidgetProps) => {
  const [elapsed, setElapsed] = useState<string>("00:00:00");
  
  const { data: activeTimer, isLoading } = useGetActiveTimer();
  const { mutate: startTimer, isPending: isStarting } = useStartTimer();
  const { mutate: stopTimer, isPending: isStopping } = useStopTimer();

  const isActive = activeTimer?.taskId === taskId;
  const hasAnyActiveTimer = !!activeTimer;

  // Update elapsed time
  useEffect(() => {
    if (!isActive || !activeTimer) {
      setElapsed("00:00:00");
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeTimer.startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isActive, activeTimer]);

  const handleStart = () => {
    startTimer({ json: { taskId } });
  };

  const handleStop = () => {
    if (activeTimer) {
      stopTimer({ json: { timeEntryId: activeTimer.$id } });
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isActive ? (
          <>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-700">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-medium">{elapsed}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleStop}
              disabled={isStopping}
            >
              <Square className="h-3.5 w-3.5 text-red-600" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleStart}
            disabled={isStarting}
            title={hasAnyActiveTimer ? "Stop current timer to start a new one" : "Start timer"}
          >
            <Play className="h-3.5 w-3.5 text-green-600" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg border bg-white", className)}>
      <div className="flex items-center gap-2 flex-1">
        <Clock className="h-5 w-5 text-gray-500" />
        
        {isActive ? (
          <div className="flex flex-col">
            <span className="text-lg font-mono font-semibold text-gray-900">{elapsed}</span>
            {taskName && (
              <span className="text-xs text-gray-500 truncate max-w-[150px]">{taskName}</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-500">No timer running</span>
        )}
      </div>

      {isActive ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleStop}
          disabled={isStopping}
          className="gap-1.5"
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={handleStart}
          disabled={isStarting}
          className="gap-1.5 bg-green-600 hover:bg-green-700"
        >
          <Play className="h-4 w-4" />
          Start
        </Button>
      )}
    </div>
  );
};
