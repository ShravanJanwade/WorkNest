// src/features/projects/server/route.ts
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";

import { getMember } from "@/features/members/utils";
import { TaskStatus } from "@/features/tasks/types";

import { DATABASE_ID, B2_BUCKET_NAME, PROJECTS_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";
import { Task } from "@/features/tasks/types";
import { uploadFile, getSignedUrl } from "@/lib/storage";

const app = new Hono();

/**
 * Helper: get a plain view URL for an Appwrite file without requesting transforms.
 * Tries storage.getFileView(...) first. If that fails and we have APPWRITE_ENDPOINT+PROJECT,
 * constructs a reasonable fallback view URL.
 */
// Helper removed (using getSignedUrl from lib/storage)

/* ----------------------
   POST / - create project
   ---------------------- */
app.post(
  "/",
  sessionMiddleware,
  zValidator("form", createProjectSchema),
  async (c) => {
    const databases = c.get("databases");
    const storage = c.get("storage");
    const user = c.get("user");

    const { name, image, workspaceId } = c.req.valid("form");

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let uploadedImageUrl: string | undefined;

    try {
      // If the client sent a File object, upload to Appwrite and get a plain view URL (no preview/transforms).
      if (image instanceof File) {
        const fileId = ID.unique();
        uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, image);
      } else if (typeof image === "string" && image) {
        uploadedImageUrl = image;
      }

      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          imageUrl: uploadedImageUrl,
          workspaceId,
        }
      );

      if (
        project.imageUrl &&
        !project.imageUrl.startsWith("data:image") &&
        !project.imageUrl.startsWith("http")
      ) {
        project.imageUrl = await getSignedUrl(
          B2_BUCKET_NAME,
          project.imageUrl
        );
      }

      return c.json({ data: project });
    } catch (err: unknown) {
      console.error("[projects#create] error", err);
      const message =
        err instanceof Error
          ? err.message
          : "Unknown server error creating project";
      return c.json({ error: message }, 500);
    }
  }
);

/* ----------------------
   GET / - list projects for workspace
   ---------------------- */
app.get(
  "/",
  sessionMiddleware,
  zValidator("query", z.object({ workspaceId: z.string() })),
  async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const { workspaceId } = c.req.valid("query");

    if (!workspaceId) {
      return c.json({ error: "Missing workspaceId" }, 400);
    }

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projects = await databases.listDocuments<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")]
    );

    const populatedProjects = await Promise.all(
      projects.documents.map(async (project) => {
        if (
          project.imageUrl &&
          !project.imageUrl.startsWith("data:image") &&
          !project.imageUrl.startsWith("http")
        ) {
          project.imageUrl = await getSignedUrl(
            B2_BUCKET_NAME,
            project.imageUrl
          );
        }
        return project;
      })
    );

    return c.json({ data: { ...projects, documents: populatedProjects } });
  }
);

/* ----------------------
   GET /:projectId - get project
   ---------------------- */
app.get("/:projectId", sessionMiddleware, async (c) => {
  const user = c.get("user");
  const databases = c.get("databases");
  const { projectId } = c.req.param();

  const project = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_ID,
    projectId
  );

  const member = await getMember({
    databases,
    workspaceId: project.workspaceId,
    userId: user.$id,
  });

  if (!member) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (
    project.imageUrl &&
    !project.imageUrl.startsWith("data:image") &&
    !project.imageUrl.startsWith("http")
  ) {
    project.imageUrl = await getSignedUrl(B2_BUCKET_NAME, project.imageUrl);
  }

  return c.json({ data: project });
});

/* ----------------------
   PATCH /:projectId - update project
   ---------------------- */
app.patch(
  "/:projectId",
  sessionMiddleware,
  zValidator("form", updateProjectSchema),
  async (c) => {
    const databases = c.get("databases");
    const storage = c.get("storage");
    const user = c.get("user");

    const { projectId } = c.req.param();
    const { name, image } = c.req.valid("form");

    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({
      databases,
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let uploadedImageUrl: string | undefined;

    try {
      if (image instanceof File) {
        const fileId = ID.unique();
        uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, image);
      } else {
        uploadedImageUrl = image;
      }

      const project = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      if (
        project.imageUrl &&
        !project.imageUrl.startsWith("data:image") &&
        !project.imageUrl.startsWith("http")
      ) {
        project.imageUrl = await getSignedUrl(
          B2_BUCKET_NAME,
          project.imageUrl
        );
      }

      return c.json({ data: project });
    } catch (err: unknown) {
      console.error("[projects#patch] error", err);
      const message =
        err instanceof Error
          ? err.message
          : "Unknown server error updating project";
      return c.json({ error: message }, 500);
    }
  }
);

/* ----------------------
   DELETE /:projectId
   ---------------------- */
app.delete("/:projectId", sessionMiddleware, async (c) => {
  const databases = c.get("databases");
  const user = c.get("user");

  const { projectId } = c.req.param();

  const existingProject = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_ID,
    projectId
  );

  const member = await getMember({
    databases,
    workspaceId: existingProject.workspaceId,
    userId: user.$id,
  });

  if (!member) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // TODO: optionally remove stored file if desired
  await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

  return c.json({ data: { $id: existingProject.$id } });
});

/* ----------------------
   Analytics endpoint (unchanged)
   ---------------------- */
app.get("/:projectId/analytics", sessionMiddleware, async (c) => {
  const user = c.get("user");
  const databases = c.get("databases");
  const { projectId } = c.req.param();

  const project = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_ID,
    projectId
  );

  const member = await getMember({
    databases,
    workspaceId: project.workspaceId,
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
    Query.equal("projectId", projectId),
    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
  ]);

  const lastMonthTasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
    Query.equal("projectId", projectId),
    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
  ]);

  const taskCount = thisMonthTasks.total;
  const taskDifference = taskCount - lastMonthTasks.total;

  const thisMonthAssignedTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.equal("assigneeId", member.$id),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]
  );

  const lastMonthAssignedTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.equal("assigneeId", member.$id),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]
  );

  const assignedTaskCount = thisMonthAssignedTasks.total;
  const assignedTaskDifference =
    assignedTaskCount - lastMonthAssignedTasks.total;

  const thisMonthIncompleteTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]
  );

  const lastMonthIncompleteTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]
  );

  const incompleteTaskCount = thisMonthIncompleteTasks.total;
  const incompleteTaskDifference =
    incompleteTaskCount - lastMonthIncompleteTasks.total;

  const thisMonthCompletedTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.equal("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]
  );

  const lastMonthCompletedTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.equal("status", TaskStatus.DONE),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]
  );

  const completedTaskCount = thisMonthCompletedTasks.total;
  const completedTaskDifference =
    completedTaskCount - lastMonthCompletedTasks.total;

  const thisMonthOverdueTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.lessThan("dueDate", now.toISOString()),
      Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
    ]
  );

  const lastMonthOverdueTasks = await databases.listDocuments(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
      Query.notEqual("status", TaskStatus.DONE),
      Query.lessThan("dueDate", now.toISOString()),
      Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
      Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
    ]
  );

  const overdueTaskCount = thisMonthOverdueTasks.total;
  const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;

  // ... (previous stats logic is kept for summary cards, extending with chart data)

  const tasks = await databases.listDocuments<Task>(
    DATABASE_ID,
    TASKS_ID,
    [
      Query.equal("projectId", projectId),
    ]
  );

  // 1. Tasks by Status (Bar Chart)
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

  // 2. Tasks by Priority (Pie Chart)
  const taskPriorityCounts: Record<string, number> = {};
   // Initialize likely priorities if known, otherwise dynamic
  tasks.documents.forEach((task) => {
    const priority = task.priority || "MEDIUM"; // Default fallback
    if (!taskPriorityCounts[priority]) {
      taskPriorityCounts[priority] = 0;
    }
    taskPriorityCounts[priority]++;
  });
  const tasksByPriority = Object.keys(taskPriorityCounts).map((priority) => ({
    name: priority,
    value: taskPriorityCounts[priority],
  }));

   // 3. Tasks by Assignee (Bar/List)
  const assigneeCounts: Record<string, number> = {};
  tasks.documents.forEach((task) => {
    const assigneeId = task.assigneeId;
    if (!assigneeCounts[assigneeId]) {
      assigneeCounts[assigneeId] = 0;
    }
    assigneeCounts[assigneeId]++;
  });
  // We need names for assignees. This might be expensive to fetch all names individually.
  // For now, let's return the IDs and counts, client knows the members usually.
  // OR, we can try to map if we fetch members. 
  // Let's optimize: The client usually has member data or we can fetch common ones. 
  // Actually, we already fetch `members` for validtion. Let's list project members.
  
  // Fetching members for names mapping
  let projectMembers = { documents: [], total: 0 };
  try {
      projectMembers = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          [Query.equal("workspaceId", project.workspaceId)]
      );
  } catch (error) {
      console.warn("Failed to fetch project members for analytics (likely missing index on workspaceId):", error);
      // Fallback: continue without member names
  }
  
  // We also need User details for names. This is getting complex for a simple API.
  // Let's stick to IDs and counts, and maybe basic name mapping if possible from existing scope?
  // Limitation: We can't join easily.
  // Alternative: Just return the raw counts and let client map if they have loaded members, 
  // OR, specifically for the dashboard, fetch the top 5 assignees' names.
  
  // Let's simplify: Return the raw distribution for now, client can visualize "Unassigned" vs "Assigned".
  // Actually, we can fetch all members of workspace to map names.
  
  const tasksByAssignee = Object.keys(assigneeCounts).map((assigneeId) => {
     const member = projectMembers.documents.find((m: any) => m.$id === assigneeId);
     
     return {
         name: member ? member.name : "Unassigned", // Use name if available, otherwise "Unassigned"
         value: assigneeCounts[assigneeId]
     };
  }).slice(0, 5); // Top 5

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
      // New Chart Data
      tasksByStatus,
      tasksByPriority,
      tasksByAssignee
    },
  });
});

export default app;
