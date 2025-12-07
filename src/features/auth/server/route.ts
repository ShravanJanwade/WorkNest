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
    },
  )
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const { account, users } = await createAdminClient();

    try {
      const session = await account.createEmailPasswordSession(email, password);

      const userId = session.userId;

      const userPrefs = await users.getPrefs(userId);

      if (userPrefs.mfaEnabled) {
        const otpCode = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await users.updatePrefs(userId, {
          ...userPrefs,
          mfaSecret: otpCode,
          mfaExpiry: otpExpiry,
        });

        await sendMfaEmail(email, otpCode);

        await users.deleteSession(userId, session.$id);

        return c.json({
          requireMfa: true,
          userId: userId,
          email: email,
        });
      }

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
  .post(
    "/verify-mfa",
    zValidator(
      "json",
      z.object({
        userId: z.string(),
        code: z.string(),
        email: z.string().email(),
        password: z.string(),
      }),
    ),
    async (c) => {
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

        await users.updatePrefs(userId, {
          ...prefs,
          mfaSecret: null,
          mfaExpiry: null,
        });

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
    },
  )
  .post("/resend-verification", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { users } = await createAdminClient();

    try {
      if (user.emailVerification) {
        return c.json({ error: "Email already verified" }, 400);
      }

      const verificationToken = generateOtp() + ID.unique();

      const currentPrefs = await users.getPrefs(user.$id);

      await users.updatePrefs(user.$id, {
        ...currentPrefs,
        verificationToken: verificationToken,
        verificationStatus: "pending",
      });

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

      const verificationToken = generateOtp() + ID.unique();

      await users.updatePrefs(user.$id, {
        verificationToken: verificationToken,
        verificationStatus: "pending",
      });

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
  .post(
    "/verify-email",
    zValidator(
      "json",
      z.object({
        userId: z.string(),
        secret: z.string(),
      }),
    ),
    async (c) => {
      const { userId, secret } = c.req.valid("json");
      const { users } = await createAdminClient();

      try {
        const prefs = await users.getPrefs(userId);

        if (prefs.verificationToken === secret) {
          await users.updateEmailVerification(userId, true);

          await users.updatePrefs(userId, {
            ...prefs,
            verificationToken: null,
            verificationStatus: "verified",
          });

          return c.json({ success: true });
        } else {
          return c.json({ error: "Invalid token" }, 400);
        }
      } catch (error) {
        console.error("Verification Error", error);
        return c.json({ error: "Verification failed" }, 500);
      }
    },
  )
  .post("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");

    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession("current");

    return c.json({ success: true });
  })
  .patch("/update", sessionMiddleware, zValidator("form", updateProfileSchema), async (c) => {
    const account = c.get("account");
    const { name, image, password, dob, address, profession, company, reportingManager } =
      c.req.valid("form");

    let uploadedImageUrl: string | undefined;

    if (image instanceof File) {
      const fileId = ID.unique();

      uploadedImageUrl = await uploadFile(B2_BUCKET_NAME, fileId, image);
    } else if (typeof image === "string" && image) {
      uploadedImageUrl = image;
    }

    if (name) {
      await account.updateName(name);
    }

    if (password && password.length >= 8) {
      await account.updatePassword(password);
    }

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
  })
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
        mfaEnabled: enabled,
      });

      return c.json({ success: true });
    },
  )
  .post(
    "/change-password",
    sessionMiddleware,
    zValidator("json", changePasswordSchema),
    async (c) => {
      const user = c.get("user");
      const account = c.get("account");
      const { oldPassword, newPassword } = c.req.valid("json");

      try {
        await account.updatePassword(newPassword, oldPassword);
        return c.json({ success: true });
      } catch (error) {
        return c.json({ error: "Failed to update password." }, 500);
      }
    },
  )
  .post(
    "/forgot-password",
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
      const { email } = c.req.valid("json");

      try {
        const { account } = await createAdminClient();

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

        await account.createRecovery(email, resetUrl);

        return c.json({ success: true, message: "Password reset email sent." });
      } catch (error) {
        console.error("Forgot password error:", error);

        return c.json({
          success: true,
          message: "If an account exists, a reset email has been sent.",
        });
      }
    },
  )
  .post(
    "/reset-password",
    zValidator(
      "json",
      z.object({
        userId: z.string(),
        secret: z.string(),
        password: z.string().min(8),
      }),
    ),
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
    },
  );

export default app;
