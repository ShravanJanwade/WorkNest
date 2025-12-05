// src/features/projects/server/route.ts
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";

import { getMember } from "@/features/members/utils";
import { TaskStatus } from "@/features/tasks/types";

import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";

const app = new Hono();

/**
 * Helper: get a plain view URL for an Appwrite file without requesting transforms.
 * Tries storage.getFileView(...) first. If that fails and we have APPWRITE_ENDPOINT+PROJECT,
 * constructs a reasonable fallback view URL.
 */
async function getFileViewUrl(storage: any, bucketId: string, fileId: string) {
  try {
    // Preferred: SDK helper that returns a no-transform view URL.
    const viewUrl = await storage.getFileView(bucketId, fileId);
    if (viewUrl) return String(viewUrl);
  } catch (err) {
    // ignore and attempt fallback below
    console.warn(
      "[getFileViewUrl] getFileView failed:",
      (err as Error).message
    );
  }

  // Fallback: if environment has Appwrite endpoint + project, construct a public view URL.
  // This URL pattern is suitable for many Appwrite installs; if your deployment uses a custom gateway or auth,
  // adjust this accordingly.
  const endpoint =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT;
  const project =
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT || process.env.APPWRITE_PROJECT;

  if (endpoint && project) {
    // ensure no trailing slash
    const base = String(endpoint).replace(/\/$/, "");
    return `${base}/v1/storage/buckets/${encodeURIComponent(
      bucketId
    )}/files/${encodeURIComponent(fileId)}/view?project=${encodeURIComponent(
      project
    )}`;
  }

  // If nothing else available, return fileId as fallback (client-side can handle file ids if needed)
  return String(fileId);
}

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
        // create file in Appwrite storage
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        // Try to get a no-transform view URL; fallback to constructed URL or fileId
        uploadedImageUrl = await getFileViewUrl(
          storage,
          IMAGES_BUCKET_ID,
          file.$id
        );
      } else if (typeof image === "string" && image) {
        // If the client passed a string:
        // - If it's a data: URL (base64), we store it as-is (avoids server-side transforms / upload).
        // - If it's a remote URL (e.g. imagekit), store that URL directly.
        // This preserves the behavior you used successfully in the edit flow.
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

    return c.json({ data: projects });
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
        // upload new file to Appwrite (same flow as create)
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );
        uploadedImageUrl = await getFileViewUrl(
          storage,
          IMAGES_BUCKET_ID,
          file.$id
        );
      } else {
        // accept string as-is (ImageKit URL, data URL, or already-stored URL)
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
    },
  });
});

export default app;
