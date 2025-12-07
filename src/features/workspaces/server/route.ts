import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";

import {
  DATABASE_ID,
  B2_BUCKET_NAME,
  MEMBERS_ID,
  TASKS_ID,
  WORKSPACES_ID,
  PROJECTS_ID,
} from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { generateInviteCode } from "@/lib/utils";

import { MemberRole } from "@/features/members/types";
import { getMember } from "@/features/members/utils";
import { TaskStatus } from "@/features/tasks/types";

import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { Workspace } from "../types";
import { Project } from "@/features/projects/types";
import { Task } from "@/features/tasks/types";
import { uploadFile, getSignedUrl } from "@/lib/storage";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (members.total === 0) {
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACES_ID, [
      Query.orderDesc("$createdAt"),
      Query.contains("$id", workspaceIds),
    ]);

    const populatedWorkspaces = await Promise.all(
      workspaces.documents.map(async (workspace) => {
        if (workspace.imageUrl) {
          if (
            !workspace.imageUrl.startsWith("data:image") &&
            !workspace.imageUrl.startsWith("http")
          ) {
            workspace.imageUrl = await getSignedUrl(B2_BUCKET_NAME, workspace.imageUrl);
          }
        }
        return workspace;
      }),
    );

    return c.json({ data: { ...workspaces, documents: populatedWorkspaces } });
  })
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
    );

    if (
      workspace.imageUrl &&
      !workspace.imageUrl.startsWith("data:image") &&
      !workspace.imageUrl.startsWith("http")
    ) {
      workspace.imageUrl = await getSignedUrl(B2_BUCKET_NAME, workspace.imageUrl);
    }

    return c.json({ data: workspace });
  })
  .get("/:workspaceId/info", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
    );

    let imageUrl = workspace.imageUrl;
    if (imageUrl) {
      if (!imageUrl.startsWith("data:image") && !imageUrl.startsWith("http")) {
        imageUrl = await getSignedUrl(B2_BUCKET_NAME, imageUrl);
      }
    }

    return c.json({
      data: {
        $id: workspace.$id,
        name: workspace.name,
        imageUrl: imageUrl,
      },
    });
  })
  .post("/", zValidator("form", createWorkspaceSchema), sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const storage = c.get("storage");
    const user = c.get("user");

    const { name, image } = c.req.valid("form");

    let uploadedImageUrl: string | undefined;

    if (image instanceof File) {
      const fileId = ID.unique();
      uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, image);
    }

    const workspace = await databases.createDocument(DATABASE_ID, WORKSPACES_ID, ID.unique(), {
      name,
      userId: user.$id,
      imageUrl: uploadedImageUrl,
      inviteCode: generateInviteCode(6),
    });

    await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
      userId: user.$id,
      workspaceId: workspace.$id,
      role: MemberRole.ADMIN,
    });

    if (
      workspace.imageUrl &&
      !workspace.imageUrl.startsWith("data:image") &&
      !workspace.imageUrl.startsWith("http")
    ) {
      workspace.imageUrl = await getSignedUrl(B2_BUCKET_NAME, workspace.imageUrl);
    }

    return c.json({ data: workspace });
  })
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const fileId = ID.unique();
        uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, image);
      } else {
        uploadedImageUrl = image;
      }

      const workspace = await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, {
        name,
        imageUrl: uploadedImageUrl,
      });

      if (
        workspace.imageUrl &&
        !workspace.imageUrl.startsWith("data:image") &&
        !workspace.imageUrl.startsWith("http")
      ) {
        workspace.imageUrl = await getSignedUrl(B2_BUCKET_NAME, workspace.imageUrl);
      }

      return c.json({ data: workspace });
    },
  )
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

    return c.json({ data: { $id: workspaceId } });
  })
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, {
      inviteCode: generateInviteCode(6),
    });

    return c.json({ data: workspace });
  })
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        workspaceId,
        userId: user.$id,
        role: MemberRole.MEMBER,
      });

      return c.json({ data: workspace });
    },
  )
  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]);

    const lastMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]);

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.equal("assigneeId", member.$id),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]);

    const lastMonthAssignedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.equal("assigneeId", member.$id),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]);

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]);

    const lastMonthIncompleteTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]);

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;

    const thisMonthCompletedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.equal("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]);

    const lastMonthCompletedTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.equal("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]);

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;

    const thisMonthOverdueTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.lessThan("dueDate", now.toISOString()),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]);

    const lastMonthOverdueTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.lessThan("dueDate", now.toISOString()),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]);

    const overdueTaskCount = thisMonthOverdueTasks.total;
    const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;

    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
      Query.equal("workspaceId", workspaceId),
    ]);

    const taskStatusCounts: Record<string, number> = {};
    Object.values(TaskStatus).forEach((status) => {
      taskStatusCounts[status] = 0;
    });
    tasks.documents.forEach((task) => {
      const status = task.status;
      if (taskStatusCounts[status] !== undefined) {
        taskStatusCounts[status]++;
      }
    });
    const tasksByStatus = Object.keys(taskStatusCounts).map((status) => ({
      name: status,
      value: taskStatusCounts[status],
    }));

    const taskPriorityCounts: Record<string, number> = {};
    tasks.documents.forEach((task) => {
      const priority = task.priority || "MEDIUM";
      if (!taskPriorityCounts[priority]) {
        taskPriorityCounts[priority] = 0;
      }
      taskPriorityCounts[priority]++;
    });
    const tasksByPriority = Object.keys(taskPriorityCounts).map((priority) => ({
      name: priority,
      value: taskPriorityCounts[priority],
    }));

    const projectCounts: Record<string, number> = {};

    const projects = await databases.listDocuments<Workspace>(DATABASE_ID, PROJECTS_ID, [
      Query.equal("workspaceId", workspaceId),
    ]);

    projects.documents.forEach((project) => {
      projectCounts[project.name] = 0;
    });

    tasks.documents.forEach((task) => {
      const project = projects.documents.find((p) => p.$id === task.projectId);
      if (project) {
        projectCounts[project.name]++;
      }
    });

    const tasksByProject = Object.keys(projectCounts).map((name) => ({
      name: name,
      value: projectCounts[name],
    }));

    const assigneeCounts: Record<string, number> = {};
    tasks.documents.forEach((task) => {
      const assigneeId = task.assigneeId;
      if (!assigneeCounts[assigneeId]) {
        assigneeCounts[assigneeId] = 0;
      }
      assigneeCounts[assigneeId]++;
    });

    let workspaceMembers = { documents: [], total: 0 };
    try {
      workspaceMembers = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
        Query.equal("workspaceId", workspaceId),
      ]);
    } catch (error) {
      console.warn("Failed to fetch workspace members for analytics:", error);
    }

    const tasksByAssignee = Object.keys(assigneeCounts)
      .map((assigneeId) => {
        const member = workspaceMembers.documents.find((m: any) => m.$id === assigneeId);
        return {
          name: member ? member.name : "Unassigned",
          value: assigneeCounts[assigneeId],
        };
      })
      .slice(0, 5);

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,

        tasksByStatus,
        tasksByPriority,
        tasksByProject,
        tasksByAssignee,
      },
    });
  });

export default app;
