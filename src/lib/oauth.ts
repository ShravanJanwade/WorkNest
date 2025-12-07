"use server";

import { createAdminClient } from "@/lib/appwrite";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol =
    headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function signUpWithGithub() {
  try {
    const { account } = await createAdminClient();
    const origin = await getOrigin();

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Github,
      `${origin}/oauth`,
      `${origin}/sign-up`,
    );

    return redirect(redirectUrl);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    throw error;
  }
}

export async function signUpWithGoogle() {
  try {
    const { account } = await createAdminClient();
    const origin = await getOrigin();

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${origin}/oauth`,
      `${origin}/sign-up`,
    );

    return redirect(redirectUrl);
  } catch (error) {
    console.error("Google OAuth error:", error);
    throw error;
  }
}
