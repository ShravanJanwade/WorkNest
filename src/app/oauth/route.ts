import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=missing_fields`);
  }

  try {
    const { account, users } = await createAdminClient();
    const session = await account.createSession(userId, secret);

    const user = await users.get(userId);
    if (!user.emailVerification) {
      await users.updateEmailVerification(userId, true);
    }

    const currentPrefs = await users.getPrefs(userId);
    if (!currentPrefs.verificationStatus) {
      await users.updatePrefs(userId, {
        ...currentPrefs,
        verificationStatus: "verified",
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    if (user.prefs?.isSuperAdmin) {
      return NextResponse.redirect(`${request.nextUrl.origin}/superadmin`);
    }

    return NextResponse.redirect(`${request.nextUrl.origin}/dashboard`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=oauth_failed`);
  }
}
