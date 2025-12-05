import { z } from "zod";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID } from "@/config";

import { getMember } from "../utils";
import { Member, MemberRole } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      // --- DEBUG LOGS (start) ---
      console.log("[members route] handler start");
      console.log("[members route] env DATABASE_ID =", DATABASE_ID);
      console.log("[members route] env MEMBERS_ID =", MEMBERS_ID);
      // --- DEBUG LOGS (end) ---

      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      // log runtime items we depend on
      console.log("[members route] runtime databases =", !!databases);
      console.log("[members route] runtime user.id =", user?.$id);
      console.log("[members route] workspaceId param =", workspaceId);

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        console.warn("[members route] unauthorized: member not found");
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!MEMBERS_ID) {
        console.error("[members route] ERROR: MEMBERS_ID is falsy! Aborting.");
        return c.json(
          { error: "server misconfigured: MEMBERS_ID missing" },
          500
        );
      }

      // wrap listDocuments in try/catch to capture SDK error details
      let members;
      try {
        members = await databases.listDocuments<Member>(
          DATABASE_ID,
          MEMBERS_ID,
          [Query.equal("workspaceId", workspaceId)]
        );
        console.log("[members route] listDocuments OK, total=", members?.total);
      } catch (err) {
        console.error("[members route] listDocuments ERROR:", err);
        return c.json(
          { error: "failed to list members", details: String(err) },
          500
        );
      }

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          // add try/catch per-user lookup so a single failed users.get doesn't break everything
          try {
            const user = await users.get(member.userId);
            return {
              ...member,
              name: user.name || user.email,
              email: user.email,
            };
          } catch (err) {
            console.warn(
              "[members route] users.get failed for userId=",
              member.userId,
              "err:",
              err
            );
            // fallback: return member without enrichment
            return {
              ...member,
              name: member.userId,
              email: "",
            };
          }
        })
      );

      return c.json({ data: { ...members, documents: populatedMembers } });
    }
  )
  .delete("/:memberId", sessionMiddleware, async (c) => {
    console.log("[members route] DELETE /:memberId called");
    const { memberId } = c.req.param();
    const user = c.get("user");
    const databases = c.get("databases");

    console.log(
      "[members route] delete: DATABASE_ID=",
      DATABASE_ID,
      "MEMBERS_ID=",
      MEMBERS_ID,
      "memberId=",
      memberId
    );

    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)]
    );

    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member." }, 400);
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  })
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      console.log("[members route] PATCH /:memberId called");
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");

      console.log(
        "[members route] patch: DATABASE_ID=",
        DATABASE_ID,
        "MEMBERS_ID=",
        MEMBERS_ID,
        "memberId=",
        memberId,
        "newRole=",
        role
      );

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)]
      );

      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot downgrade the only member." }, 400);
      }

      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  );

export default app;
