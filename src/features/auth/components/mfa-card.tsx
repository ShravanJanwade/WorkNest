"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useVerifyMfa } from "@/features/auth/api/use-verify-mfa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export const MfaCard = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [value, setValue] = useState("");
  const { mutate, isPending } = useVerifyMfa();

  useEffect(() => {
    const storedEmail = localStorage.getItem("mfa_temp_email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = () => {};

  const handleVerify = () => {
    const storedPass = sessionStorage.getItem("mfa_temp_pass");

    if (!userId || !email || !storedPass) {
      toast.error("Session invalid. Please login again.");
      return;
    }

    mutate({ userId, code: value, email, password: storedPass });
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md border-neutral-200 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <CardDescription>
            We sent a verification code to{" "}
            <span className="font-medium text-neutral-900">{email}</span>. Check your email and
            enter the code below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={value} onChange={(value) => setValue(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={value.length < 6 || isPending}
              onClick={handleVerify}
            >
              {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
              Verify & Login
            </Button>
            <Button variant="link" className="w-full" asChild>
              <Link href="/sign-in">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
