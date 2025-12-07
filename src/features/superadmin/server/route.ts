import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { 
  DATABASE_ID, 
  COMPANIES_ID,
  WORKSPACES_ID,
  MEMBERS_ID,
  B2_BUCKET_NAME
} from "@/config";
import { MemberRole } from "@/features/members/types";
import { 
  Company, 
  SUPER_ADMIN_EMAIL, 
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_NAME 
} from "@/features/admin/types";
import { uploadFile, getSignedUrl } from "@/lib/storage";
import { generateInviteCode } from "@/lib/utils";
import { 
  createCompanyWithAdminSchema, 
  approveDeleteSchema 
} from "../schemas";

const app = new Hono()
  // Check if super admin exists
  .get("/check", async (c) => {
    try {
      const { users } = await createAdminClient();
      
      const existingUsers = await users.list([
        Query.equal("email", SUPER_ADMIN_EMAIL)
      ]);
      
      return c.json({ 
        exists: existingUsers.total > 0,
        email: SUPER_ADMIN_EMAIL
      });
    } catch (error) {
      console.error("Error checking super admin:", error);
      return c.json({ exists: false, error: String(error) });
    }
  })

  // Initialize super admin (called on first startup)
  .post("/init", async (c) => {
    try {
      const { users, account } = await createAdminClient();
      
      // Check if super admin already exists
      const existingUsers = await users.list([
        Query.equal("email", SUPER_ADMIN_EMAIL)
      ]);
      
      if (existingUsers.total > 0) {
        return c.json({ 
          message: "Super admin already exists",
          email: SUPER_ADMIN_EMAIL
        });
      }
      
      // Create super admin user
      const superAdmin = await users.create(
        ID.unique(),
        SUPER_ADMIN_EMAIL,
        undefined, // phone
        SUPER_ADMIN_PASSWORD,
        SUPER_ADMIN_NAME
      );
      
      // Set super admin preference
      await users.updatePrefs(superAdmin.$id, {
        isSuperAdmin: true,
      });
      
      console.log("========================================");
      console.log("SUPER ADMIN CREATED!");
      console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
      console.log(`Password: ${SUPER_ADMIN_PASSWORD}`);
      console.log("CHANGE THESE CREDENTIALS IN PRODUCTION!");
      console.log("========================================");
      
      return c.json({ 
        success: true,
        message: "Super admin created successfully",
        credentials: {
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD
        }
      });
    } catch (error) {
      console.error("Error creating super admin:", error);
      return c.json({ error: "Failed to create super admin" }, 500);
    }
  })

  // Get all companies (super admin only)
  .get("/companies", sessionMiddleware, async (c) => {
    const user = c.get("user");
    
    // Check if user is super admin
    if (!user.prefs?.isSuperAdmin) {
      return c.json({ error: "Super admin access required" }, 403);
    }
    
    try {
      const databases = c.get("databases");
      
      const companies = await databases.listDocuments<Company>(
        DATABASE_ID,
        COMPANIES_ID,
        [Query.orderDesc("$createdAt")]
      );
      
      // Enrich with signed URLs for images
      const enrichedCompanies = await Promise.all(
        companies.documents.map(async (company) => {
          if (
            company.imageUrl &&
            !company.imageUrl.startsWith("data:image") &&
            !company.imageUrl.startsWith("http")
          ) {
            company.imageUrl = await getSignedUrl(B2_BUCKET_NAME, company.imageUrl);
          }
          return company;
        })
      );
      
      return c.json({ data: { ...companies, documents: enrichedCompanies } });
    } catch (error) {
      console.error("Error fetching companies:", error);
      return c.json({ error: "Failed to fetch companies" }, 500);
    }
  })

  // Create company with admin (super admin only)
  .post(
    "/companies",
    sessionMiddleware,
    zValidator("json", createCompanyWithAdminSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      
      // Check if user is super admin
      if (!user.prefs?.isSuperAdmin) {
        return c.json({ error: "Super admin access required" }, 403);
      }
      
      const { 
        companyName, 
        companyDescription, 
        adminName,
        adminEmail 
      } = c.req.valid("json");
      
      try {
        const { users } = await createAdminClient();
        
        // Check if admin email already exists
        const existingUsers = await users.list([
          Query.equal("email", adminEmail)
        ]);
        
        if (existingUsers.total > 0) {
          return c.json({ error: "A user with this email already exists" }, 400);
        }
        
        // Generate a secure random password (user will reset via email)
        const tempPassword = `Secure${ID.unique()}!`;
        
        // Create admin user
        const adminUser = await users.create(
          ID.unique(),
          adminEmail,
          undefined,
          tempPassword,
          adminName
        );
        
        // Create company
        const company = await databases.createDocument(
          DATABASE_ID,
          COMPANIES_ID,
          ID.unique(),
          {
            name: companyName,
            description: companyDescription,
            adminUserId: adminUser.$id,
            adminEmail: adminEmail,
            status: "active",
            deleteRequested: false,
          }
        );
        
        // Create default workspace for the company
        const workspace = await databases.createDocument(
          DATABASE_ID,
          WORKSPACES_ID,
          ID.unique(),
          {
            name: `${companyName} Workspace`,
            userId: adminUser.$id,
            inviteCode: generateInviteCode(6),
          }
        );
        
        // Add admin as member of workspace
        await databases.createDocument(
          DATABASE_ID,
          MEMBERS_ID,
          ID.unique(),
          {
            userId: adminUser.$id,
            workspaceId: workspace.$id,
            role: MemberRole.ADMIN,
          }
        );
        
        // Note: The admin should use the "Forgot Password" flow to set their password
        // Appwrite will send the recovery email when they request it
        console.log(`✅ Company "${companyName}" created with admin: ${adminEmail}`);
        console.log(`ℹ️  Admin should use "Forgot Password" on the login page to set their password`);
        
        return c.json({ 
          data: {
            company,
            workspace,
            admin: {
              id: adminUser.$id,
              email: adminEmail,
              name: adminName,
            },
            message: `Company created! Admin should use "Forgot Password" on the login page to set their password.`,
          }
        });
      } catch (error) {
        console.error("Error creating company:", error);
        return c.json({ error: "Failed to create company" }, 500);
      }
    }
  )


  // Get delete requests (super admin only)
  .get("/delete-requests", sessionMiddleware, async (c) => {
    const user = c.get("user");
    
    if (!user.prefs?.isSuperAdmin) {
      return c.json({ error: "Super admin access required" }, 403);
    }
    
    try {
      const databases = c.get("databases");
      
      const companies = await databases.listDocuments<Company>(
        DATABASE_ID,
        COMPANIES_ID,
        [
          Query.equal("deleteRequested", true),
          Query.orderDesc("deleteRequestedAt")
        ]
      );
      
      return c.json({ data: companies });
    } catch (error) {
      console.error("Error fetching delete requests:", error);
      return c.json({ error: "Failed to fetch delete requests" }, 500);
    }
  })

  // Approve or reject delete request (super admin only)
  .post(
    "/delete-requests/approve",
    sessionMiddleware,
    zValidator("json", approveDeleteSchema),
    async (c) => {
      const user = c.get("user");
      
      if (!user.prefs?.isSuperAdmin) {
        return c.json({ error: "Super admin access required" }, 403);
      }
      
      const { companyId, approved } = c.req.valid("json");
      
      try {
        const databases = c.get("databases");
        
        if (approved) {
          // Delete company and related data
          // In production, implement cascading deletes for workspaces, members, etc.
          await databases.updateDocument(
            DATABASE_ID,
            COMPANIES_ID,
            companyId,
            {
              status: "deleted",
            }
          );
          
          return c.json({ success: true, message: "Company deleted" });
        } else {
          // Reject deletion request
          await databases.updateDocument(
            DATABASE_ID,
            COMPANIES_ID,
            companyId,
            {
              deleteRequested: false,
              deleteRequestedAt: null,
              deleteRequestReason: null,
              status: "active",
            }
          );
          
          return c.json({ success: true, message: "Deletion request rejected" });
        }
      } catch (error) {
        console.error("Error processing delete request:", error);
        return c.json({ error: "Failed to process request" }, 500);
      }
    }
  )

  // Get super admin stats
  .get("/stats", sessionMiddleware, async (c) => {
    const user = c.get("user");
    
    if (!user.prefs?.isSuperAdmin) {
      return c.json({ error: "Super admin access required" }, 403);
    }
    
    try {
      const databases = c.get("databases");
      
      const allCompanies = await databases.listDocuments<Company>(
        DATABASE_ID,
        COMPANIES_ID,
        []
      );
      
      const activeCompanies = allCompanies.documents.filter(
        c => c.status === "active"
      ).length;
      
      const pendingDeletes = allCompanies.documents.filter(
        c => c.deleteRequested
      ).length;
      
      return c.json({
        data: {
          totalCompanies: allCompanies.total,
          activeCompanies,
          pendingDeletes,
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return c.json({ error: "Failed to fetch stats" }, 500);
    }
  });

export default app;
