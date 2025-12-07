"use client";

import { useEffect, useState } from "react";
import { Play, Square, Timer } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useGetActiveTimer } from "../api/use-get-active-timer";
import { useStopTimer } from "../api/use-stop-timer";

export const GlobalTimerIndicator = () => {
  const [elapsed, setElapsed] = useState<string>("00:00:00");
  const { data: activeTimer, isLoading } = useGetActiveTimer();
  const { mutate: stopTimer, isPending: isStopping } = useStopTimer();

  const isActive = !!activeTimer;

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
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isActive, activeTimer]);

  const handleStop = () => {
    if (activeTimer) {
      stopTimer({ json: { timeEntryId: activeTimer.$id } });
    }
  };

  if (isLoading || !isActive) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 h-auto rounded-full bg-red-50 hover:bg-red-100 border border-red-200"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <Timer className="h-4 w-4 text-red-600" />
          <span className="text-sm font-mono font-medium text-red-700">{elapsed}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-gray-900">Timer Running</span>
          </div>

          <div className="text-center">
            <span className="text-3xl font-mono font-bold text-gray-900">{elapsed}</span>
          </div>

          {activeTimer?.task && (
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Working on:</p>
              <p className="font-medium text-gray-900 truncate">{activeTimer.task.name}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={handleStop}
              disabled={isStopping}
            >
              <Square className="h-4 w-4" />
              Stop Timer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
