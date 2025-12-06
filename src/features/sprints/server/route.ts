import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { DATABASE_ID, SPRINTS_ID, TASKS_ID, PROJECTS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { getMember } from "@/features/members/utils";
import { Task, TaskStatus } from "@/features/tasks/types";
import { Project } from "@/features/projects/types";

import { createSprintSchema, updateSprintSchema } from "../schemas";
import { Sprint, SprintWithStats } from "../types";

const app = new Hono()
  // Get all sprints for a project
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
        status: z.enum(["planned", "active", "completed"]).optional(),
      })
    ),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId, projectId, status } = c.req.valid("query");

        // Check if SPRINTS_ID is configured
        if (!SPRINTS_ID) {
          return c.json({
            data: {
              documents: [],
              total: 0,
            },
          });
        }

        const member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const queries: string[] = [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("$createdAt"),
        ];

        if (projectId) {
          queries.push(Query.equal("projectId", projectId));
        }

        if (status) {
          queries.push(Query.equal("status", status));
        }

        const sprints = await databases.listDocuments<Sprint>(
          DATABASE_ID,
          SPRINTS_ID,
          queries
        );

        // Calculate stats for each sprint
        const sprintsWithStats: SprintWithStats[] = await Promise.all(
          sprints.documents.map(async (sprint) => {
            try {
              const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [
                  Query.equal("sprintId", sprint.$id),
                ]
              );

              const completedTasks = tasks.documents.filter(
                (t) => t.status === TaskStatus.DONE
              ).length;
              const inProgressTasks = tasks.documents.filter(
                (t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.IN_REVIEW
              ).length;

              return {
                ...sprint,
                stats: {
                  totalTasks: tasks.total,
                  completedTasks,
                  inProgressTasks,
                  remainingTasks: tasks.total - completedTasks,
                },
              };
            } catch {
              return {
                ...sprint,
                stats: {
                  totalTasks: 0,
                  completedTasks: 0,
                  inProgressTasks: 0,
                  remainingTasks: 0,
                },
              };
            }
          })
        );

        return c.json({
          data: {
            ...sprints,
            documents: sprintsWithStats,
          },
        });
      } catch (error) {
        console.error("Sprints GET error:", error);
        return c.json({
          data: {
            documents: [],
            total: 0,
          },
        });
      }
    }
  )
  // Get a single sprint
  .get("/:sprintId", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { sprintId } = c.req.param();

      if (!SPRINTS_ID) {
        return c.json({ error: "Sprints not configured" }, 500);
      }

      const sprint = await databases.getDocument<Sprint>(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId
      );

      const member = await getMember({
        databases,
        workspaceId: sprint.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get tasks for this sprint
      let tasks = { documents: [] as Task[], total: 0 };
      try {
        tasks = await databases.listDocuments<Task>(
          DATABASE_ID,
          TASKS_ID,
          [Query.equal("sprintId", sprintId)]
        );
      } catch {
        // Tasks query failed
      }

      const completedTasks = tasks.documents.filter(
        (t) => t.status === TaskStatus.DONE
      ).length;
      const inProgressTasks = tasks.documents.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.IN_REVIEW
      ).length;

      return c.json({
        data: {
          ...sprint,
          stats: {
            totalTasks: tasks.total,
            completedTasks,
            inProgressTasks,
            remainingTasks: tasks.total - completedTasks,
          },
          tasks: tasks.documents,
        },
      });
    } catch (error) {
      console.error("Sprint GET error:", error);
      return c.json({ error: "Failed to fetch sprint" }, 500);
    }
  })
  // Create a new sprint
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createSprintSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId, projectId, name, goal, startDate, endDate } = c.req.valid("json");

        if (!SPRINTS_ID) {
          return c.json({ error: "Sprints not configured" }, 500);
        }

        const member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Verify project exists
        try {
          await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
          );
        } catch {
          return c.json({ error: "Project not found" }, 404);
        }

        const sprint = await databases.createDocument(
          DATABASE_ID,
          SPRINTS_ID,
          ID.unique(),
          {
            workspaceId,
            projectId,
            name,
            goal: goal || null,
            startDate,
            endDate,
            status: "planned",
          }
        );

        return c.json({ data: sprint });
      } catch (error) {
        console.error("Sprint POST error:", error);
        return c.json({ error: "Failed to create sprint" }, 500);
      }
    }
  )
  // Update a sprint
  .patch(
    "/:sprintId",
    sessionMiddleware,
    zValidator("json", updateSprintSchema),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { sprintId } = c.req.param();
        const updates = c.req.valid("json");

        if (!SPRINTS_ID) {
          return c.json({ error: "Sprints not configured" }, 500);
        }

        const sprint = await databases.getDocument<Sprint>(
          DATABASE_ID,
          SPRINTS_ID,
          sprintId
        );

        const member = await getMember({
          databases,
          workspaceId: sprint.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const updatedSprint = await databases.updateDocument(
          DATABASE_ID,
          SPRINTS_ID,
          sprintId,
          updates
        );

        return c.json({ data: updatedSprint });
      } catch (error) {
        console.error("Sprint PATCH error:", error);
        return c.json({ error: "Failed to update sprint" }, 500);
      }
    }
  )
  // Start a sprint
  .post("/:sprintId/start", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { sprintId } = c.req.param();

      if (!SPRINTS_ID) {
        return c.json({ error: "Sprints not configured" }, 500);
      }

      const sprint = await databases.getDocument<Sprint>(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId
      );

      const member = await getMember({
        databases,
        workspaceId: sprint.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Set any other active sprints to completed
      try {
        const activeSprints = await databases.listDocuments<Sprint>(
          DATABASE_ID,
          SPRINTS_ID,
          [
            Query.equal("projectId", sprint.projectId),
            Query.equal("status", "active"),
          ]
        );

        for (const activeSprint of activeSprints.documents) {
          await databases.updateDocument(
            DATABASE_ID,
            SPRINTS_ID,
            activeSprint.$id,
            { status: "completed" }
          );
        }
      } catch {
        // Continue even if this fails
      }

      const updatedSprint = await databases.updateDocument(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId,
        { status: "active" }
      );

      return c.json({ data: updatedSprint });
    } catch (error) {
      console.error("Sprint start error:", error);
      return c.json({ error: "Failed to start sprint" }, 500);
    }
  })
  // Complete a sprint
  .post("/:sprintId/complete", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { sprintId } = c.req.param();

      if (!SPRINTS_ID) {
        return c.json({ error: "Sprints not configured" }, 500);
      }

      const sprint = await databases.getDocument<Sprint>(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId
      );

      const member = await getMember({
        databases,
        workspaceId: sprint.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updatedSprint = await databases.updateDocument(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId,
        { status: "completed" }
      );

      return c.json({ data: updatedSprint });
    } catch (error) {
      console.error("Sprint complete error:", error);
      return c.json({ error: "Failed to complete sprint" }, 500);
    }
  })
  // Delete a sprint
  .delete("/:sprintId", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { sprintId } = c.req.param();

      if (!SPRINTS_ID) {
        return c.json({ error: "Sprints not configured" }, 500);
      }

      const sprint = await databases.getDocument<Sprint>(
        DATABASE_ID,
        SPRINTS_ID,
        sprintId
      );

      const member = await getMember({
        databases,
        workspaceId: sprint.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Remove sprintId from all tasks in this sprint
      try {
        const tasks = await databases.listDocuments<Task>(
          DATABASE_ID,
          TASKS_ID,
          [Query.equal("sprintId", sprintId)]
        );

        for (const task of tasks.documents) {
          await databases.updateDocument(
            DATABASE_ID,
            TASKS_ID,
            task.$id,
            { sprintId: null }
          );
        }
      } catch {
        // Continue even if this fails
      }

      await databases.deleteDocument(DATABASE_ID, SPRINTS_ID, sprintId);

      return c.json({ data: { $id: sprintId } });
    } catch (error) {
      console.error("Sprint DELETE error:", error);
      return c.json({ error: "Failed to delete sprint" }, 500);
    }
  });

export default app;
