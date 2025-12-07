"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

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

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    if (!userId || !secret) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [userId, secret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!userId || !secret) {
      toast.error("Invalid reset link");
      return;
    }

    setIsLoading(true);
    try {
      const response = await client.api.auth["reset-password"].$post({
        json: { userId, secret, password },
      });
      
      if (response.ok) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        const data = await response.json();
        toast.error((data as any).error || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500"];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];

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
                  Password Reset!
                </CardTitle>
                <CardDescription>
                  Your password has been successfully reset. You can now sign in with your new password.
                </CardDescription>
              </>
            ) : error ? (
              <>
                <div className="mx-auto p-3 bg-red-100 rounded-full w-fit">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-black">
                  Invalid Link
                </CardTitle>
                <CardDescription className="text-red-600">
                  {error}
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-black">
                  Reset Password
                </CardTitle>
                <CardDescription>
                  Enter your new password below.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {isSuccess ? (
              <Button className="w-full" asChild>
                <Link href="/sign-in">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Sign In
                </Link>
              </Button>
            ) : error ? (
              <Button className="w-full" asChild>
                <Link href="/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${i < strength ? strengthColors[strength - 1] : "bg-gray-200"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength: {strengthLabels[strength - 1] || "Too Weak"}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>

          {!isSuccess && !error && (
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

export default ResetPasswordPage;
