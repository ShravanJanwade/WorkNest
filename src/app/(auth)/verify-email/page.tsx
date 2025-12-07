"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import Link from "next/link";

const VerifyEmailPage = () => {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
             <Card className="w-full max-w-md border-neutral-200 shadow-xl text-center">
                 <CardHeader>
                     <div className="flex justify-center mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <MailCheck className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                    <CardDescription>
                        We've sent a verification link to your email address. 
                        Please click the link to activate your account.
                    </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <p className="text-sm text-muted-foreground">
                         Once verified, you can sign in to access your workspace.
                     </p>
                     <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                         <Link href="/sign-in">Back to Sign In</Link>
                     </Button>
                 </CardContent>
             </Card>
        </div>
    );
};

export default VerifyEmailPage;
