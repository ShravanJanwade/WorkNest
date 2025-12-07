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
import { generateOtp } from "@/lib/otp";
import { sendMfaEmail, sendVerificationEmail } from "@/lib/mail";

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

    const { account, users } = await createAdminClient();

    try {
      // 1. Verify credentials first by creating a temporary session
      // We'll use createEmailPasswordSession. If it fails, password is wrong.
      const session = await account.createEmailPasswordSession(email, password);

      // 2. Get User ID from the session we just created
      const userId = session.userId;

      // 3. Get User Preferences to check MFA status
      const userPrefs = await users.getPrefs(userId);

      if (userPrefs.mfaEnabled) {
        // MFA IS ENABLED

        // Generate OTP
        const otpCode = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

        // Store OTP in Prefs (Secure enough for this context as only server is writing/reading initially)
        // But wait, if we update prefs, the user object updates.
        await users.updatePrefs(userId, {
          ...userPrefs,
          mfaSecret: otpCode,
          mfaExpiry: otpExpiry
        });

        // Send Email
        await sendMfaEmail(email, otpCode);

        // Delete the session we just created because we don't want to log them in yet!
        // We must use 'users' service because 'account' service requires the user's session context, which the Admin Client doesn't have set.
        await users.deleteSession(userId, session.$id);

        return c.json({
          requireMfa: true,
          userId: userId,
          email: email // Send back to client to show "Sent to x***@..."
        });
      }

      // MFA NOT ENABLED - Set Cookie and Finish
      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });

      return c.json({ success: true });

    } catch (error) {
      console.error("Login Error", error);
      return c.json({ error: "Invalid email or password" }, 401);
    }
  })

  .post("/verify-mfa", zValidator("json", z.object({
    userId: z.string(),
    code: z.string(),
    email: z.string().email(),
    password: z.string(), // We need password to recreate session since we deleted it
  })), async (c) => {
    const { userId, code, email, password } = c.req.valid("json");
    const { users, account } = await createAdminClient();

    try {
      const prefs = await users.getPrefs(userId);

      if (!prefs.mfaSecret || !prefs.mfaExpiry) {
        return c.json({ error: "MFA session invalid" }, 400);
      }

      const now = new Date();
      const expiry = new Date(prefs.mfaExpiry);

      if (now > expiry) {
        return c.json({ error: "Code expired" }, 400);
      }

      if (prefs.mfaSecret !== code) {
        return c.json({ error: "Invalid code" }, 400);
      }

      // Code Valid! Clear it.
      await users.updatePrefs(userId, {
        ...prefs,
        mfaSecret: null,
        mfaExpiry: null
      });

      // Create Session
      const session = await account.createEmailPasswordSession(email, password);

      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });

      return c.json({ success: true });

    } catch (error) {
      console.error("MFA Verify Error", error);
      return c.json({ error: "Verification failed" }, 500);
    }
  })

  .post("/resend-verification", sessionMiddleware, async (c) => {
      const user = c.get("user");
      const { users } = await createAdminClient();
      
      try {
          if (user.emailVerification) {
              return c.json({ error: "Email already verified" }, 400);
          }
          
          // Generate Token
          const verificationToken = generateOtp() + ID.unique();
          
          // Save token in prefs
          const currentPrefs = await users.getPrefs(user.$id);
          
          await users.updatePrefs(user.$id, {
              ...currentPrefs,
              verificationToken: verificationToken,
              verificationStatus: "pending"
          });
          
          
          // Send Email
          console.log("Attempting to send verification email to:", user.email);
          console.log("Token:", verificationToken);
          await sendVerificationEmail(user.email, verificationToken, user.$id);
          console.log("Email send function completed");
          
          return c.json({ success: true });
      } catch (error) {
          console.error("Resend Verification Error", error);
          return c.json({ error: "Failed to resend verification email" }, 500);
      }
  })

  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const { account, users } = await createAdminClient();
    try {
        const user = await account.create(ID.unique(), email, password, name);
        
        // Generate Token
        const verificationToken = generateOtp() + ID.unique(); 
        
        // Save token in prefs
        await users.updatePrefs(user.$id, {
            verificationToken: verificationToken,
            verificationStatus: "pending"
        });
        
        // Send Email
        await sendVerificationEmail(email, verificationToken, user.$id);
        
        const session = await account.createEmailPasswordSession(email, password);

        setCookie(c, AUTH_COOKIE, session.secret, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30,
        });
        
        return c.json({ success: true, requireVerification: true });
    
    } catch (error) {
        console.error("Register Error", error);
        return c.json({ error: "Registration failed" }, 500);
    }
  })

  .post("/verify-email", zValidator("json", z.object({
      userId: z.string(),
      secret: z.string(),
  })), async (c) => {
      const { userId, secret } = c.req.valid("json");
      const { users } = await createAdminClient();
      
      try {
          const prefs = await users.getPrefs(userId);
          
          if (prefs.verificationToken === secret) {
              // Update Email Verification Status
              await users.updateEmailVerification(userId, true);
              
              // Cleanup Prefs
              await users.updatePrefs(userId, {
                  ...prefs,
                  verificationToken: null,
                  verificationStatus: "verified"
              });
              
              return c.json({ success: true });
          } else {
              return c.json({ error: "Invalid token" }, 400);
          }
      } catch (error) {
          console.error("Verification Error", error);
          return c.json({ error: "Verification failed" }, 500);
      }
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
    "/update-mfa",
    sessionMiddleware,
    zValidator("json", z.object({ enabled: z.boolean() })),
    async (c) => {
      const account = c.get("account");
      const { enabled } = c.req.valid("json");

      const prefs = await account.getPrefs();
      await account.updatePrefs({
        ...prefs,
        mfaEnabled: enabled
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

      // Update to new password
      try {
        await account.updatePassword(newPassword, oldPassword);
        return c.json({ success: true });
      } catch (error) {
        return c.json({ error: "Failed to update password." }, 500);
      }
    }
  )

  // Forgot Password - Send recovery email
  .post(
    "/forgot-password",
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
      const { email } = c.req.valid("json");

      try {
        const { account } = await createAdminClient();

        // Create password recovery
        // The URL should point to your reset-password page
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

        await account.createRecovery(email, resetUrl);

        return c.json({ success: true, message: "Password reset email sent." });
      } catch (error) {
        console.error("Forgot password error:", error);
        // Don't reveal if email exists or not for security
        return c.json({ success: true, message: "If an account exists, a reset email has been sent." });
      }
    }
  )

  // Reset Password - Complete recovery
  .post(
    "/reset-password",
    zValidator("json", z.object({
      userId: z.string(),
      secret: z.string(),
      password: z.string().min(8),
    })),
    async (c) => {
      const { userId, secret, password } = c.req.valid("json");

      try {
        const { account } = await createAdminClient();

        await account.updateRecovery(userId, secret, password);

        return c.json({ success: true, message: "Password reset successfully." });
      } catch (error) {
        console.error("Reset password error:", error);
        return c.json({ error: "Failed to reset password. Link may be expired." }, 400);
      }
    }
  );

export default app;
