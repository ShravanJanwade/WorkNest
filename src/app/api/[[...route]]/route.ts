import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import members from "@/features/members/server/route";
import workspaces from "@/features/workspaces/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import comments from "@/features/comments/server/route";
import timeTracking from "@/features/time-tracking/server/route";
import activity from "@/features/activity/server/route";
import sprints from "@/features/sprints/server/route";
import upload from "@/features/upload/server/route";
import epics from "@/features/epics/server/route";
import admin from "@/features/admin/server/route";
import superadmin from "@/features/superadmin/server/route";

const app = new Hono().basePath("/api");
const routes = app
  .route("/auth", auth)
  .route("/workspaces", workspaces)
  .route("/members", members)
  .route("/projects", projects)
  .route("/tasks", tasks)
  .route("/comments", comments)
  .route("/time-tracking", timeTracking)
  .route("/activity", activity)
  .route("/sprints", sprints)
  .route("/upload", upload)
  .route("/epics", epics)
  .route("/admin", admin)
  .route("/superadmin", superadmin);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
