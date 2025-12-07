"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left section (Animation) */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-gray-100 relative flex items-center justify-center">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-4 left-4 md:top-6 md:left-6"
        >
          <Link href="/" className="flex items-center gap-3 md:gap-4">
            <img
              src="/Logo.png"
              alt="WorkNest Logo"
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="text-xl md:text-3xl font-black tracking-widest text-blue-400 drop-shadow-[0_2px_6px_rgba(255,255,255,0.25)] hover:text-blue-500 transition">
              WorkNest
            </span>
          </Link>
        </motion.div>
        <Lottie
          animationData={loginAnimation}
          loop
          className="w-[70%] md:w-[80%] h-full object-contain"
        />
      </div>

      {/* Right section (Form) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 h-[60vh] md:h-full flex items-center justify-center bg-white px-4 py-8"
      >
        <Card className="w-full max-w-[400px] shadow-2xl border-none bg-white">
          <CardHeader className="space-y-2 text-center">
            {isSuccess ? (
              <>
                <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-black">
                  Check Your Email
                </CardTitle>
                <CardDescription>
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and follow the instructions.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-black">
                  Forgot Password?
                </CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {isSuccess ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                >
                  Send to different email
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/sign-in">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>

          {!isSuccess && (
            <CardFooter className="text-sm text-center text-muted-foreground flex justify-center">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 underline ml-1 hover:text-blue-700"
              >
                Sign In
              </Link>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
