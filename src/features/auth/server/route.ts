import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";
import { z } from "zod";

import { loginSchema, registerSchema, changePasswordSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";
import { uploadFile, getSignedUrl } from "@/lib/storage";
import { B2_BUCKET_NAME } from "@/config";
import { updateProfileSchema } from "../schemas";

const app = new Hono()
  .get("/current", sessionMiddleware, async (c) => {
    const user = c.get("user");
    
    // Generate signed URL for profile image if it exists and is a fileId
    if (
      user.prefs?.imageUrl &&
      !user.prefs.imageUrl.startsWith("data:image") &&
      !user.prefs.imageUrl.startsWith("http")
    ) {
      try {
        user.prefs.imageUrl = await getSignedUrl(B2_BUCKET_NAME, user.prefs.imageUrl);
      } catch (error) {
        console.error("Error generating signed URL for profile image:", error);
      }
    }

    return c.json({ data: user });
  })
  
  .post(
    "/image-url",
    sessionMiddleware,
    zValidator("json", z.object({ fileId: z.string() })),
    async (c) => {
      const { fileId } = c.req.valid("json");
      
      try {
        const signedUrl = await getSignedUrl(B2_BUCKET_NAME, fileId);
        return c.json({ url: signedUrl });
      } catch (error) {
        console.error("Error generating signed URL:", error);
        return c.json({ error: "Failed to generate signed URL" }, 500);
      }
    }
  )
  
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const { account } = await createAdminClient();
    await account.create(ID.unique(), email, password, name);

    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");

    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession("current");

    return c.json({ success: true });
  })

  .patch(
    "/update",
    sessionMiddleware,
    zValidator("form", updateProfileSchema),
    async (c) => {
      const account = c.get("account");
      const { name, image, password, dob, address, profession, company, reportingManager } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const fileId = ID.unique();
        // Upload file to B2, store the fileId (not signed URL)
        uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, image);
      } else if (typeof image === "string" && image) {
        uploadedImageUrl = image;
      }
      
      // Update Name
      if (name) {
          await account.updateName(name);
      }
      
      // Update Password if provided
      if (password && password.length >= 8) {
          await account.updatePassword(password);
      }
      
      // Update Preferences (Extended Profile)
      const currentPrefs = await account.getPrefs();
      
      await account.updatePrefs({
          ...currentPrefs,
          imageUrl: uploadedImageUrl || currentPrefs.imageUrl,
          dob: dob || currentPrefs.dob,
          address: address || currentPrefs.address,
          profession: profession || currentPrefs.profession,
          company: company || currentPrefs.company,
          reportingManager: reportingManager || currentPrefs.reportingManager,
      });

      return c.json({ success: true });
    }
  )
  
  .post(
    "/change-password",
    sessionMiddleware,
    zValidator("json", changePasswordSchema),
    async (c) => {
      const user = c.get("user");
      const account = c.get("account");
      const { oldPassword, newPassword } = c.req.valid("json");

      // Verify old password by attempting to create a session
      try {
        const { account: tempAccount } = await createAdminClient();
        await tempAccount.createEmailPasswordSession(user.email, oldPassword);
        // If successful, delete the temporary session
        await tempAccount.deleteSession("current");
      } catch (error) {
        return c.json({ error: "Current password is incorrect." }, 400);
      }

      // Update to new password
      try {
        await account.updatePassword(newPassword, oldPassword);
        return c.json({ success: true });
      } catch (error) {
        return c.json({ error: "Failed to update password." }, 500);
      }
    }
  );

export default app;


