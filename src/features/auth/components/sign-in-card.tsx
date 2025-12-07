"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";

import { loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";

// Import your Lottie animation JSON
import loginAnimation from "@/assets/signup.json";

export const SignInCard = () => {
  const { mutate, isPending } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate({ json: values });
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
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl md:text-2xl font-semibold text-center text-black">
              Welcome back
            </CardTitle>

            {/* Google Login Button */}
            <Button
              variant="outline"
              className="w-full !mt-4 text-black bg-white border border-gray-300 hover:bg-gray-50 hover:cursor-pointer hover:text-black/80 hover:scale-105 transition-transform"
              onClick={() => signUpWithGoogle()}
              disabled={isPending}
            >
              <FcGoogle className="mr-2 size-5" />
              Sign in with Google
            </Button>

            {/* GitHub Login Button */}
            <Button
              variant="outline"
              className="w-full text-black bg-white border border-gray-300 hover:bg-gray-50 hover:cursor-pointer hover:text-black/80 hover:scale-105 transition-transform"
              onClick={() => signUpWithGithub()}
              disabled={isPending}
            >
              <FaGithub className="mr-2 size-5" />
              Sign in with GitHub
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 text-sm"
              >
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          type="email"
                          className="bg-white text-black border-gray-300"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          className="bg-white text-black border-gray-300"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full !mt-6 cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="text-sm text-center text-muted-foreground flex flex-col gap-2">
            <Link
              href="/forgot-password"
              className="text-blue-600 underline hover:text-blue-700"
            >
              Forgot your password?
            </Link>
            <div>
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-blue-600 underline ml-1 hover:text-blue-700"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};