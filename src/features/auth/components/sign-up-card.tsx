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

import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";

// Import your Lottie animation JSON
import signupAnimation from "@/assets/signup.json";

export const SignUpCard = () => {
  const { mutate, isPending } = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({ json: values });
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
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
          animationData={signupAnimation}
          loop
          className="w-[70%] h-[200px] md:w-[80%] md:h-[80%] object-contain"
        />
      </div>

      {/* Right section (Form) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 min-h-[60vh] md:h-full flex items-center justify-center bg-white px-4 py-8"
      >
        <Card className="w-full max-w-[400px] shadow-2xl border-none bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl md:text-2xl font-semibold text-center text-black">
              Create an account
            </CardTitle>

            {/* Google Sign Up Button */}
            <Button
              onClick={() => signUpWithGoogle()}
              className="w-full !mt-4 text-black bg-white border border-gray-300 hover:bg-gray-50 hover:cursor-pointer hover:text-black/80 hover:scale-105 transition-transform"
              variant="outline"
              disabled={isPending}
            >
              <FcGoogle className="mr-2 size-5" />
              Sign up with Google
            </Button>

            {/* GitHub Sign Up Button */}
            <Button
              onClick={() => signUpWithGithub()}
              className="w-full text-black bg-white border border-gray-300 hover:bg-gray-50 hover:cursor-pointer hover:text-black/80 hover:scale-105 transition-transform"
              variant="outline"
              disabled={isPending}
            >
              <FaGithub className="mr-2 size-5" />
              Sign up with GitHub
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
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          type="text"
                          className="bg-white text-black border-gray-300"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Email</FormLabel>
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
                      <FormLabel className="text-black">Password</FormLabel>
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
                  {isPending ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="text-sm text-center text-muted-foreground flex justify-center flex-wrap">
            <span>Already have an account?</span>
            <Link
              href="/sign-in"
              className="text-blue-600 underline ml-1 hover:text-blue-700"
            >
              Sign in
            </Link>
          </CardFooter>

          {/* Terms */}
          <div className="px-6 pb-6 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
            .
          </div>
        </Card>
      </motion.div>
    </div>
  );
};