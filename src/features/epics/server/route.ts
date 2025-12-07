import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { DATABASE_ID, EPICS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getMember } from "@/features/members/utils";

import { Epic } from "../types";
import { createEpicSchema } from "../schemas";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string(),
        search: z.string().optional(),
      }),
    ),
    async (c) => {
      const { workspaceId, projectId, search } = c.req.valid("query");
      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.equal("projectId", projectId),
        Query.orderDesc("$createdAt"),
      ];

      if (search) {
        query.push(Query.search("name", search));
      }

      const epics = await databases.listDocuments<Epic>(DATABASE_ID, EPICS_ID, query);

      return c.json({ data: epics });
    },
  )
  .post("/", sessionMiddleware, zValidator("json", createEpicSchema), async (c) => {
    const { name, description, workspaceId, projectId, startDate, endDate } = c.req.valid("json");
    const databases = c.get("databases");
    const user = c.get("user");

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const epic = await databases.createDocument(DATABASE_ID, EPICS_ID, ID.unique(), {
      name,
      description,
      workspaceId,
      projectId,
      startDate,
      endDate,
    });

    return c.json({ data: epic });
  })
  .patch(
    "/:epicId",
    sessionMiddleware,
    zValidator("json", createEpicSchema.partial()),
    async (c) => {
      const { name, description, startDate, endDate } = c.req.valid("json");
      const { epicId } = c.req.param();
      const databases = c.get("databases");
      const user = c.get("user");

      const existingEpic = await databases.getDocument<Epic>(DATABASE_ID, EPICS_ID, epicId);

      const member = await getMember({
        databases,
        workspaceId: existingEpic.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const epic = await databases.updateDocument(DATABASE_ID, EPICS_ID, epicId, {
        name,
        description,
        startDate,
        endDate,
      });

      return c.json({ data: epic });
    },
  )
  .delete("/:epicId", sessionMiddleware, async (c) => {
    const { epicId } = c.req.param();
    const databases = c.get("databases");
    const user = c.get("user");

    const existingEpic = await databases.getDocument<Epic>(DATABASE_ID, EPICS_ID, epicId);

    const member = await getMember({
      databases,
      workspaceId: existingEpic.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, EPICS_ID, epicId);

    return c.json({ data: { $id: epicId } });
  });

export default app;
