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
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!MEMBERS_ID) {
        return c.json(
          { error: "server misconfigured: MEMBERS_ID missing" },
          500
        );
      }

      let members;
      try {
        members = await databases.listDocuments<Member>(
          DATABASE_ID,
          MEMBERS_ID,
          [Query.equal("workspaceId", workspaceId)]
        );
      } catch (err) {
        console.error("[members route] listDocuments ERROR:", err);
        return c.json(
          { error: "failed to list members", details: String(err) },
          500
        );
      }

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
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
              member.userId
            );
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
    const { memberId } = c.req.param();
    const user = c.get("user");
    const databases = c.get("databases");

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

    // Only admin can delete members (except self-removal)
    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Only admins can remove other members" }, 403);
    }

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member." }, 400);
    }

    // Prevent deleting the last admin
    const adminsInWorkspace = allMembersInWorkspace.documents.filter(
      (m) => m.role === MemberRole.ADMIN
    );
    if (
      memberToDelete.role === MemberRole.ADMIN &&
      adminsInWorkspace.length === 1
    ) {
      return c.json({ error: "Cannot delete the only admin." }, 400);
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    return c.json({ data: { $id: memberToDelete.$id } });
  })
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");

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

      // Only ADMIN can change roles
      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Only admins can change member roles" }, 403);
      }

      // Prevent demoting the last admin
      const adminsInWorkspace = allMembersInWorkspace.documents.filter(
        (m) => m.role === MemberRole.ADMIN
      );
      if (
        memberToUpdate.role === MemberRole.ADMIN &&
        role !== MemberRole.ADMIN &&
        adminsInWorkspace.length === 1
      ) {
        return c.json({ error: "Cannot demote the only admin." }, 400);
      }

      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      return c.json({ data: { $id: memberToUpdate.$id, role } });
    }
  );

export default app;

