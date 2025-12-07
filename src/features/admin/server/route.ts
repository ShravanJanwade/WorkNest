import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { 
  DATABASE_ID, 
  COMPANIES_ID, 
  MEMBERS_ID, 
  WORKSPACES_ID,
  B2_BUCKET_NAME,
  INITIAL_ADMIN_EMAIL,
  INITIAL_ADMIN_PASSWORD
} from "@/config";
import { MemberRole } from "@/features/members/types";
import { uploadFile, getSignedUrl } from "@/lib/storage";
import { companySchema, updateCompanySchema, inviteUserSchema } from "../schemas";
import { Company } from "../types";

const app = new Hono()
  // Get current company
  .get("/company", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    try {
      // Find company where user is admin
      const companies = await databases.listDocuments<Company>(
        DATABASE_ID,
        COMPANIES_ID,
        [Query.equal("adminUserId", user.$id)]
      );

      if (companies.total === 0) {
        return c.json({ data: null });
      }

      const company = companies.documents[0];
      
      // Generate signed URL for image if needed
      if (
        company.imageUrl &&
        !company.imageUrl.startsWith("data:image") &&
        !company.imageUrl.startsWith("http")
      ) {
        company.imageUrl = await getSignedUrl(B2_BUCKET_NAME, company.imageUrl);
      }

      return c.json({ data: company });
    } catch (error) {
      console.error("Error fetching company:", error);
      return c.json({ error: "Failed to fetch company" }, 500);
    }
  })

  // Create company
  .post(
    "/company",
    sessionMiddleware,
    zValidator("form", companySchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { name, description, website, address, image } = c.req.valid("form");

      try {
        // Check if company already exists for this admin
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COMPANIES_ID,
          [Query.equal("adminUserId", user.$id)]
        );

        if (existing.total > 0) {
          return c.json({ error: "Company already exists" }, 400);
        }

        let uploadedImageUrl: string | undefined;
        if (image instanceof File) {
          const fileId = ID.unique();
          uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, image);
        }

        const company = await databases.createDocument(
          DATABASE_ID,
          COMPANIES_ID,
          ID.unique(),
          {
            name,
            description,
            website,
            address,
            imageUrl: uploadedImageUrl,
            adminUserId: user.$id,
          }
        );

        return c.json({ data: company });
      } catch (error) {
        console.error("Error creating company:", error);
        return c.json({ error: "Failed to create company" }, 500);
      }
    }
  )

  // Update company
  .patch(
    "/company/:companyId",
    sessionMiddleware,
    zValidator("form", updateCompanySchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { companyId } = c.req.param();
      const data = c.req.valid("form");

      try {
        const company = await databases.getDocument<Company>(
          DATABASE_ID,
          COMPANIES_ID,
          companyId
        );

        // Only admin can update
        if (company.adminUserId !== user.$id) {
          return c.json({ error: "Only company admin can update" }, 403);
        }

        let uploadedImageUrl: string | undefined;
        if (data.image instanceof File) {
          const fileId = ID.unique();
          uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, data.image);
        } else if (typeof data.image === "string") {
          uploadedImageUrl = data.image;
        }

        const updatedCompany = await databases.updateDocument(
          DATABASE_ID,
          COMPANIES_ID,
          companyId,
          {
            ...(data.name && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.website !== undefined && { website: data.website }),
            ...(data.address !== undefined && { address: data.address }),
            ...(uploadedImageUrl && { imageUrl: uploadedImageUrl }),
          }
        );

        return c.json({ data: updatedCompany });
      } catch (error) {
        console.error("Error updating company:", error);
        return c.json({ error: "Failed to update company" }, 500);
      }
    }
  )

  // Get all users across workspaces (admin only)
  .get("/users", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { users } = await createAdminClient();

    try {
      // Check if user is admin of any workspace
      const adminMemberships = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("role", MemberRole.ADMIN),
        ]
      );

      if (adminMemberships.total === 0) {
        return c.json({ error: "Admin access required" }, 403);
      }

      // Get all unique workspace IDs where user is admin
      const workspaceIds = adminMemberships.documents.map(m => m.workspaceId);

      // Get all members in these workspaces
      const allMembers = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.contains("workspaceId", workspaceIds)]
      );

      // Enrich with user details
      const enrichedMembers = await Promise.all(
        allMembers.documents.map(async (member) => {
          try {
            const userData = await users.get(member.userId);
            return {
              ...member,
              name: userData.name || userData.email,
              email: userData.email,
            };
          } catch {
            return {
              ...member,
              name: "Unknown User",
              email: "",
            };
          }
        })
      );

      return c.json({ data: { documents: enrichedMembers, total: enrichedMembers.length } });
    } catch (error) {
      console.error("Error fetching users:", error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }
  })

  // Invite user to workspace
  .post(
    "/users/invite",
    sessionMiddleware,
    zValidator("json", inviteUserSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { users, account } = await createAdminClient();
      const { email, role, workspaceId } = c.req.valid("json");

      try {
        // Check if inviter is admin of this workspace
        const inviterMember = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          [
            Query.equal("userId", user.$id),
            Query.equal("workspaceId", workspaceId),
            Query.equal("role", MemberRole.ADMIN),
          ]
        );

        if (inviterMember.total === 0) {
          return c.json({ error: "Only admins can invite users" }, 403);
        }

        // Check if user already exists
        let targetUser;
        try {
          const existingUsers = await users.list([Query.equal("email", email)]);
          if (existingUsers.total > 0) {
            targetUser = existingUsers.users[0];
          }
        } catch {
          // User doesn't exist
        }

        // If user doesn't exist, create invite (placeholder - in real app would send email)
        if (!targetUser) {
          // For now, return error - in production would send invite email
          return c.json({ 
            error: "User not registered. Please ask them to sign up first.",
            code: "USER_NOT_FOUND"
          }, 400);
        }

        // Check if already a member
        const existingMember = await databases.listDocuments(
          DATABASE_ID,
          MEMBERS_ID,
          [
            Query.equal("userId", targetUser.$id),
            Query.equal("workspaceId", workspaceId),
          ]
        );

        if (existingMember.total > 0) {
          return c.json({ error: "User is already a member of this workspace" }, 400);
        }

        // Create membership
        const newMember = await databases.createDocument(
          DATABASE_ID,
          MEMBERS_ID,
          ID.unique(),
          {
            userId: targetUser.$id,
            workspaceId,
            role: role as MemberRole,
          }
        );

        return c.json({ 
          data: {
            ...newMember,
            name: targetUser.name || targetUser.email,
            email: targetUser.email,
          }
        });
      } catch (error) {
        console.error("Error inviting user:", error);
        return c.json({ error: "Failed to invite user" }, 500);
      }
    }
  )

  // Get admin stats/overview
  .get("/stats", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    try {
      // Check admin status
      const adminMemberships = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("role", MemberRole.ADMIN),
        ]
      );

      if (adminMemberships.total === 0) {
        return c.json({ error: "Admin access required" }, 403);
      }

      const workspaceIds = adminMemberships.documents.map(m => m.workspaceId);

      // Get workspace count
      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [Query.contains("$id", workspaceIds)]
      );

      // Get all members count
      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.contains("workspaceId", workspaceIds)]
      );

      // Count by role
      const roleCount = {
        admins: 0,
        managers: 0,
        employees: 0,
      };

      members.documents.forEach((m) => {
        if (m.role === MemberRole.ADMIN) roleCount.admins++;
        else if (m.role === MemberRole.MANAGER) roleCount.managers++;
        else roleCount.employees++;
      });

      return c.json({
        data: {
          workspaceCount: workspaces.total,
          totalMembers: members.total,
          roleDistribution: roleCount,
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return c.json({ error: "Failed to fetch stats" }, 500);
    }
  })

  // Request company deletion (company admin only)
  .post(
    "/request-delete",
    sessionMiddleware,
    zValidator("json", z.object({ reason: z.string().min(10) })),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { reason } = c.req.valid("json");

      try {
        // Find company where user is admin
        const companies = await databases.listDocuments<Company>(
          DATABASE_ID,
          COMPANIES_ID,
          [Query.equal("adminUserId", user.$id)]
        );

        if (companies.total === 0) {
          return c.json({ error: "No company found for this admin" }, 404);
        }

        const company = companies.documents[0];

        // Update company with delete request
        const updatedCompany = await databases.updateDocument(
          DATABASE_ID,
          COMPANIES_ID,
          company.$id,
          {
            deleteRequested: true,
            deleteRequestedAt: new Date().toISOString(),
            deleteRequestReason: reason,
            status: "pending_delete",
          }
        );

        return c.json({ 
          success: true,
          message: "Deletion request submitted. Super Admin will review.",
          data: updatedCompany
        });
      } catch (error) {
        console.error("Error requesting deletion:", error);
        return c.json({ error: "Failed to submit deletion request" }, 500);
      }
    }
  );

export default app;

