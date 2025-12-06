import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { DATABASE_ID, ACTIVITY_LOG_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";

import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";

import { ActivityLog, ActivityLogWithUser, ActivityAction } from "../types";

const app = new Hono()
  // Get activity log for a task
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        taskId: z.string(),
        limit: z.string().optional(),
      })
    ),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { taskId, limit } = c.req.valid("query");

        // Check if ACTIVITY_LOG_ID is configured
        if (!ACTIVITY_LOG_ID) {
          return c.json({
            data: {
              documents: [],
              total: 0,
            },
          });
        }

        // Get the task to verify workspace access
        let task: Task;
        try {
          task = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId
          );
        } catch {
          return c.json({ error: "Task not found" }, 404);
        }

        const member = await getMember({
          databases,
          workspaceId: task.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Get activity logs
        const activities = await databases.listDocuments<ActivityLog>(
          DATABASE_ID,
          ACTIVITY_LOG_ID,
          [
            Query.equal("taskId", taskId),
            Query.orderDesc("$createdAt"),
            Query.limit(parseInt(limit || "50")),
          ]
        );

        // Get unique user IDs
        const userIds = Array.from(new Set(activities.documents.map((a) => a.userId)));

        // Fetch user details
        const { users } = await createAdminClient();
        const userPromises = userIds.map(async (userId) => {
          try {
            const activityUser = await users.get(userId);
            return {
              $id: userId,
              name: activityUser.name || activityUser.email,
              email: activityUser.email,
            };
          } catch {
            return {
              $id: userId,
              name: "Unknown User",
              email: "",
            };
          }
        });

        const usersData = await Promise.all(userPromises);
        const userMap = new Map(usersData.map((u) => [u.$id, u]));

        // Enrich activities with user data
        const enrichedActivities: ActivityLogWithUser[] = activities.documents.map((activity) => ({
          ...activity,
          user: userMap.get(activity.userId) || {
            $id: activity.userId,
            name: "Unknown",
            email: "",
          },
        }));

        return c.json({
          data: {
            ...activities,
            documents: enrichedActivities,
          },
        });
      } catch (error) {
        console.error("Activity GET error:", error);
        return c.json({
          data: {
            documents: [],
            total: 0,
          },
        });
      }
    }
  )
  // Create an activity log entry (internal use)
  .post(
    "/",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        taskId: z.string(),
        action: z.string(),
        field: z.string().optional(),
        oldValue: z.string().optional(),
        newValue: z.string().optional(),
        metadata: z.string().optional(),
      })
    ),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { taskId, action, field, oldValue, newValue, metadata } = c.req.valid("json");

        if (!ACTIVITY_LOG_ID) {
          return c.json({ error: "Activity logging not configured" }, 500);
        }

        const activity = await databases.createDocument(
          DATABASE_ID,
          ACTIVITY_LOG_ID,
          ID.unique(),
          {
            taskId,
            userId: user.$id,
            action,
            field: field || null,
            oldValue: oldValue || null,
            newValue: newValue || null,
            metadata: metadata || null,
          }
        );

        return c.json({ data: activity });
      } catch (error) {
        console.error("Activity POST error:", error);
        return c.json({ error: "Failed to log activity" }, 500);
      }
    }
  );

// Helper function to log activity (exported for use in other routes)
export async function logActivity(
  databases: any,
  userId: string,
  taskId: string,
  action: ActivityAction,
  options?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    metadata?: Record<string, any>;
  }
) {
  if (!ACTIVITY_LOG_ID) {
    console.warn("Activity logging not configured - ACTIVITY_LOG_ID is missing");
    return;
  }

  try {
    await databases.createDocument(
      DATABASE_ID,
      ACTIVITY_LOG_ID,
      ID.unique(),
      {
        taskId,
        userId,
        action,
        field: options?.field || null,
        oldValue: options?.oldValue || null,
        newValue: options?.newValue || null,
        metadata: options?.metadata ? JSON.stringify(options.metadata) : null,
      }
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export default app;
