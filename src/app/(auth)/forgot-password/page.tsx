"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

import loginAnimation from "@/assets/signup.json";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await client.api.auth["forgot-password"].$post({
        json: { email },
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Password reset email sent!");
      } else {
        const data = await response.json();
        toast.error((data as any).error || "Failed to send reset email");
      }
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 md:flex-row">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex h-[40vh] w-full items-center justify-center bg-slate-950/40 px-6 py-6 md:h-auto md:w-1/2 md:px-10 md:py-10">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute left-4 top-4 md:left-8 md:top-8"
        >
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full bg-slate-900/80 px-3 py-2 text-sm backdrop-blur-md transition hover:bg-slate-800/90 md:gap-4 md:px-4 md:py-2.5"
          >
            <img src="/Logo.png" alt="WorkNest Logo" className="h-8 w-8 md:h-10 md:w-10" />

            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-lg font-black tracking-[0.25em] text-transparent md:text-2xl">
              WORKNEST
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex h-full w-full max-w-xl items-center justify-center"
        >
          <Lottie
            animationData={loginAnimation}
            loop
            className="h-full w-[80%] max-w-[420px] object-contain"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex h-[60vh] w-full items-center justify-center px-4 py-8 md:h-auto md:w-1/2 md:px-10"
      >
        <Card className="w-full max-w-[420px] border border-slate-800/70 bg-slate-950/70 shadow-[0_18px_45px_rgba(15,23,42,0.8)] backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center">
            {isSuccess ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/40">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-50 md:text-2xl">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-sm text-slate-300">
                  We&apos;ve sent a secure password reset link to{" "}
                  <span className="font-semibold text-slate-50">{email}</span>. Follow the
                  instructions there to create a new password.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/15 ring-2 ring-sky-500/40">
                  <Mail className="h-8 w-8 text-sky-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-50 md:text-2xl">
                  Forgot your password?
                </CardTitle>
                <CardDescription className="text-sm text-slate-300">
                  Enter the email associated with your account and we&apos;ll send you a link to
                  reset your password securely.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {isSuccess ? (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                >
                  Use a different email
                </Button>
                <Button className="w-full bg-sky-500 text-slate-950 hover:bg-sky-400">
                  <Link href="/sign-in" className="flex w-full items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="text-sm font-medium text-slate-200">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-10 border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus-visible:ring-sky-500"
                  />

                  <p className="text-xs text-slate-400">
                    We&apos;ll send a one-time reset link to this email.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 bg-sky-500 text-slate-950 transition hover:translate-y-[1px] hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading || !email}
                >
                  {isLoading ? "Sending link..." : "Send reset link"}
                </Button>
              </form>
            )}
          </CardContent>

          {!isSuccess && (
            <CardFooter className="flex items-center justify-center gap-1 text-center text-xs text-slate-400">
              <span>Remember your password?</span>
              <Link
                href="/sign-in"
                className="text-sky-400 underline underline-offset-4 hover:text-sky-300"
              >
                Sign in
              </Link>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
