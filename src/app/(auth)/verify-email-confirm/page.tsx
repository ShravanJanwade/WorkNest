"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useConfirmEmail } from "@/features/auth/api/use-confirm-email"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const VerifyEmailConfirmPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const userId = searchParams.get("userId")
    const secret = searchParams.get("secret")
    
    const { mutate, isPending, isError, isSuccess } = useConfirmEmail()
    
    useEffect(() => {
        if (userId && secret) {
            mutate({ userId, secret })
        }
    }, [userId, secret, mutate])
    
    if (!userId || !secret) {
        return (
            <div className="h-screen flex items-center justify-center">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-red-500">Invalid Link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        Missing verification parameters.
                    </CardContent>
                 </Card>
            </div>
        )
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
             <Card className="w-full max-w-md text-center p-6">
                 {isPending && (
                     <div className="flex flex-col items-center gap-4">
                         <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                         <p className="text-lg font-medium">Verifying your email...</p>
                     </div>
                 )}
                 {isError && (
                     <div className="flex flex-col items-center gap-4">
                         <p className="text-lg font-medium text-red-600">Verification Failed</p>
                         <p className="text-muted-foreground">The link is invalid or has expired.</p>
                     </div>
                 )}
                 {isSuccess && (
                     <div className="flex flex-col items-center gap-4">
                         <p className="text-lg font-medium text-green-600">Email Verified!</p>
                         <p className="text-muted-foreground">Redirecting you to dashboard...</p>
                     </div>
                 )}
             </Card>
        </div>
    )
}

export default VerifyEmailConfirmPage
