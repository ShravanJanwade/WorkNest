import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { DATABASE_ID, TIME_ENTRIES_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";

import { createTimeEntrySchema, updateTimeEntrySchema, startTimerSchema, stopTimerSchema } from "../schemas";
import { TimeEntry } from "../types";

const app = new Hono()
  // Get time entries for a task or user
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        taskId: z.string().optional(),
        workspaceId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    ),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { taskId, workspaceId, startDate, endDate } = c.req.valid("query");

        // Check if TIME_ENTRIES_ID is configured
        if (!TIME_ENTRIES_ID) {
          return c.json({
            data: {
              entries: [],
              stats: { totalMinutes: 0, billableMinutes: 0, entriesCount: 0 },
            },
          });
        }

        const queries: string[] = [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ];

        if (taskId) {
          queries.push(Query.equal("taskId", taskId));
        }

        if (startDate) {
          queries.push(Query.greaterThanEqual("startTime", startDate));
        }

        if (endDate) {
          queries.push(Query.lessThanEqual("startTime", endDate));
        }

        const timeEntries = await databases.listDocuments<TimeEntry>(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          queries
        );

        // Enrich with task data
        const taskIds = Array.from(new Set(timeEntries.documents.map((e) => e.taskId)));
        
        let tasks: Task[] = [];
        if (taskIds.length > 0) {
          try {
            const tasksResult = await databases.listDocuments<Task>(
              DATABASE_ID,
              TASKS_ID,
              [Query.contains("$id", taskIds)]
            );
            tasks = tasksResult.documents;
          } catch {
            // Tasks lookup failed, continue without enrichment
          }
        }

        const taskMap = new Map(tasks.map((t) => [t.$id, t]));

        const enrichedEntries = timeEntries.documents.map((entry) => ({
          ...entry,
          task: taskMap.get(entry.taskId),
        }));

        // Calculate totals
        const totalMinutes = timeEntries.documents.reduce(
          (sum, e) => sum + (e.duration || 0),
          0
        );
        const billableMinutes = timeEntries.documents
          .filter((e) => e.billable)
          .reduce((sum, e) => sum + (e.duration || 0), 0);

        return c.json({
          data: {
            entries: enrichedEntries,
            stats: {
              totalMinutes,
              billableMinutes,
              entriesCount: timeEntries.total,
            },
          },
        });
      } catch (error) {
        console.error("Time entries GET error:", error);
        return c.json({
          data: {
            entries: [],
            stats: { totalMinutes: 0, billableMinutes: 0, entriesCount: 0 },
          },
        });
      }
    }
  )
  // Get active timer for current user
  .get("/active", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");

      // Check if TIME_ENTRIES_ID is configured
      if (!TIME_ENTRIES_ID) {
        return c.json({ data: null });
      }

      const activeTimers = await databases.listDocuments<TimeEntry>(
        DATABASE_ID,
        TIME_ENTRIES_ID,
        [
          Query.equal("userId", user.$id),
          Query.isNull("endTime"),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ]
      );

      if (activeTimers.documents.length === 0) {
        return c.json({ data: null });
      }

      const activeTimer = activeTimers.documents[0];

      // Get task details
      try {
        const task = await databases.getDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          activeTimer.taskId
        );

        return c.json({
          data: {
            ...activeTimer,
            task: {
              name: task.name,
              projectId: task.projectId,
            },
          },
        });
      } catch {
        // Task not found, return timer without task details
        return c.json({
          data: {
            ...activeTimer,
            task: null,
          },
        });
      }
    } catch (error) {
      console.error("Active timer GET error:", error);
      return c.json({ data: null });
    }
  })
  // Start a timer
  .post(
    "/start",
    sessionMiddleware,
    zValidator("json", startTimerSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { taskId, description } = c.req.valid("json");

        if (!TIME_ENTRIES_ID) {
          return c.json({ error: "Time tracking not configured" }, 500);
        }

        // Get the task to verify access
        const task = await databases.getDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId
        );

        const member = await getMember({
          databases,
          workspaceId: task.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Check if there's already an active timer
        const activeTimers = await databases.listDocuments<TimeEntry>(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          [
            Query.equal("userId", user.$id),
            Query.isNull("endTime"),
          ]
        );

        // Stop any existing active timers
        for (const timer of activeTimers.documents) {
          const now = new Date().toISOString();
          const startTime = new Date(timer.startTime);
          const endTime = new Date(now);
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

          await databases.updateDocument(
            DATABASE_ID,
            TIME_ENTRIES_ID,
            timer.$id,
            {
              endTime: now,
              duration,
            }
          );
        }

        // Create new time entry
        const timeEntry = await databases.createDocument(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          ID.unique(),
          {
            taskId,
            userId: user.$id,
            startTime: new Date().toISOString(),
            description: description || "",
            billable: true,
          }
        );

        return c.json({ data: timeEntry });
      } catch (error) {
        console.error("Start timer error:", error);
        return c.json({ error: "Failed to start timer" }, 500);
      }
    }
  )
  // Stop a timer
  .post(
    "/stop",
    sessionMiddleware,
    zValidator("json", stopTimerSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { timeEntryId } = c.req.valid("json");

        if (!TIME_ENTRIES_ID) {
          return c.json({ error: "Time tracking not configured" }, 500);
        }

        const timeEntry = await databases.getDocument<TimeEntry>(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          timeEntryId
        );

        // Verify ownership
        if (timeEntry.userId !== user.$id) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const now = new Date().toISOString();
        const startTime = new Date(timeEntry.startTime);
        const endTime = new Date(now);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        const updatedEntry = await databases.updateDocument(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          timeEntryId,
          {
            endTime: now,
            duration,
          }
        );

        return c.json({ data: updatedEntry });
      } catch (error) {
        console.error("Stop timer error:", error);
        return c.json({ error: "Failed to stop timer" }, 500);
      }
    }
  )
  // Create a manual time entry
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTimeEntrySchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { taskId, startTime, endTime, duration, description, billable } = c.req.valid("json");

        if (!TIME_ENTRIES_ID) {
          return c.json({ error: "Time tracking not configured" }, 500);
        }

        // Get the task to verify access
        const task = await databases.getDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId
        );

        const member = await getMember({
          databases,
          workspaceId: task.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Calculate duration if end time provided but no duration
        let calculatedDuration = duration;
        let calculatedEndTime = endTime;

        if (endTime && !duration) {
          const start = new Date(startTime);
          const end = new Date(endTime);
          calculatedDuration = Math.round((end.getTime() - start.getTime()) / 60000);
        } else if (duration && !endTime) {
          // If duration provided but no endTime (manual entry), calculate endTime
          // so it's not treated as an active timer
          const start = new Date(startTime);
          const end = new Date(start.getTime() + duration * 60000);
          calculatedEndTime = end.toISOString();
        }

        const timeEntry = await databases.createDocument(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          ID.unique(),
          {
            taskId,
            userId: user.$id,
            startTime,
            endTime: calculatedEndTime || null,
            duration: calculatedDuration || null,
            description: description || "",
            billable: billable ?? true,
          }
        );

        return c.json({ data: timeEntry });
      } catch (error) {
        console.error("Create time entry error:", error);
        return c.json({ error: "Failed to create time entry" }, 500);
      }
    }
  )
  // Update a time entry
  .patch(
    "/:timeEntryId",
    sessionMiddleware,
    zValidator("json", updateTimeEntrySchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { timeEntryId } = c.req.param();
        const updates = c.req.valid("json");

        if (!TIME_ENTRIES_ID) {
          return c.json({ error: "Time tracking not configured" }, 500);
        }

        const timeEntry = await databases.getDocument<TimeEntry>(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          timeEntryId
        );

        // Verify ownership
        if (timeEntry.userId !== user.$id) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const updatedEntry = await databases.updateDocument(
          DATABASE_ID,
          TIME_ENTRIES_ID,
          timeEntryId,
          updates
        );

        return c.json({ data: updatedEntry });
      } catch (error) {
        console.error("Update time entry error:", error);
        return c.json({ error: "Failed to update time entry" }, 500);
      }
    }
  )
  // Delete a time entry
  .delete("/:timeEntryId", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { timeEntryId } = c.req.param();

      if (!TIME_ENTRIES_ID) {
        return c.json({ error: "Time tracking not configured" }, 500);
      }

      const timeEntry = await databases.getDocument<TimeEntry>(
        DATABASE_ID,
        TIME_ENTRIES_ID,
        timeEntryId
      );

      // Verify ownership
      if (timeEntry.userId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await databases.deleteDocument(DATABASE_ID, TIME_ENTRIES_ID, timeEntryId);

      return c.json({ data: { $id: timeEntryId } });
    } catch (error) {
      console.error("Delete time entry error:", error);
      return c.json({ error: "Failed to delete time entry" }, 500);
    }
  });

export default app;
