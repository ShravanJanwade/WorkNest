"use client";

import { useState } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGetTimeEntries } from "../api/use-get-time-entries";
import { TimeEntry } from "../types";

interface TimesheetViewProps {
  workspaceId: string;
}

export const TimesheetView = ({ workspaceId }: TimesheetViewProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const { data, isLoading } = useGetTimeEntries({
    workspaceId,
    startDate: currentWeekStart.toISOString(),
    endDate: currentWeekEnd.toISOString(),
  });

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const entriesByTask: Record<
    string,
    { taskName: string; projectId: string; entries: TimeEntry[] }
  > = {};

  data?.entries.forEach((entry) => {
    if (!entriesByTask[entry.taskId]) {
      entriesByTask[entry.taskId] = {
        taskName: entry.task?.name || "Unknown Task",
        projectId: entry.task?.projectId || "",
        entries: [],
      };
    }
    entriesByTask[entry.taskId].entries.push(entry);
  });

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getDailyTotal = (entries: TimeEntry[], date: Date) => {
    const dayEntries = entries.filter(
      (e) => format(new Date(e.startTime), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    );
    return dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  };

  const getWeeklyTotal = (entries: TimeEntry[]) => {
    return entries.reduce((sum, e) => sum + (e.duration || 0), 0);
  };

  const grandTotal = Object.values(entriesByTask).reduce(
    (sum, taskGroup) => sum + getWeeklyTotal(taskGroup.entries),
    0,
  );

  return (
    <Card className="col-span-1 h-full shadow-sm border-none bg-white dark:bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-2xl font-bold">Timesheet</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart((prev) => subWeeks(prev, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-48 text-center font-medium text-foreground">
            {format(currentWeekStart, "MMM d")} - {format(currentWeekEnd, "MMM d, yyyy")}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart((prev) => addWeeks(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task</TableHead>
                  {weekDays.map((day) => (
                    <TableHead key={day.toString()} className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                          {format(day, "EEE")}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-foreground">
                          {format(day, "d")}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold w-[100px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(entriesByTask).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-gray-500 dark:text-gray-400"
                    >
                      No time entries for this week.
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(entriesByTask).map(([taskId, { taskName, entries }]) => (
                    <TableRow key={taskId}>
                      <TableCell className="font-medium">
                        <div className="line-clamp-2" title={taskName}>
                          {taskName}
                        </div>
                      </TableCell>
                      {weekDays.map((day) => {
                        const total = getDailyTotal(entries, day);
                        return (
                          <TableCell key={day.toString()} className="text-center text-sm">
                            <span
                              className={
                                total > 0
                                  ? "font-medium text-gray-900 dark:text-foreground"
                                  : "text-gray-300 dark:text-gray-600"
                              }
                            >
                              {formatDuration(total)}
                            </span>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-bold">
                        {formatDuration(getWeeklyTotal(entries))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {Object.keys(entriesByTask).length > 0 && (
                  <TableRow className="bg-gray-50 dark:bg-muted font-bold">
                    <TableCell>Total</TableCell>
                    {weekDays.map((day) => {
                      const dayTotal = Object.values(entriesByTask).reduce(
                        (sum, { entries }) => sum + getDailyTotal(entries, day),
                        0,
                      );
                      return (
                        <TableCell key={day.toString()} className="text-center">
                          {formatDuration(dayTotal)}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right text-lg">
                      {formatDuration(grandTotal)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
