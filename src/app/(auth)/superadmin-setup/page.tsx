"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, CheckCircle, Copy, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

const SuperAdminSetupPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [exists, setExists] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      setIsLoading(true);
      const res = await client.api.superadmin.check.$get();
      const data = await res.json();
      setExists(data.exists);

      if (data.exists) {
        toast.info("Super Admin exists. Please log in.");
      }
    } catch (err) {
      console.error("Check error:", err);
      setError("Failed to check Super Admin status");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSuperAdmin = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const res = await client.api.superadmin.init.$post();
      const data = await res.json();

      if ((data as any).success) {
        setCredentials((data as any).credentials);
        setExists(true);
        toast.success("Super Admin created successfully!");
      } else if ((data as any).message) {
        toast.info((data as any).message);
        setExists(true);
      } else if ((data as any).error) {
        setError((data as any).error);
      }
    } catch (err) {
      console.error("Init error:", err);
      setError("Failed to initialize Super Admin");
    } finally {
      setIsInitializing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-violet-400 animate-spin mx-auto" />
          <p className="text-white/60 mt-4">Checking Super Admin status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 w-fit mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Super Admin Setup</CardTitle>
          <CardDescription className="text-white/60">
            {exists
              ? "Super Admin account is ready"
              : "Initialize the Super Admin account for WorkNest"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {!exists && !credentials && (
            <>
              <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 text-sm">
                <p className="font-medium mb-1">⚠️ First Time Setup</p>
                <p>
                  This will create a Super Admin account with default credentials. Make sure to
                  change the password after first login.
                </p>
              </div>
              <Button
                onClick={initializeSuperAdmin}
                disabled={isInitializing}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Super Admin...
                  </>
                ) : (
                  "Create Super Admin Account"
                )}
              </Button>
            </>
          )}

          {credentials && (
            <>
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Account Created!</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-black/30 rounded p-2">
                    <div>
                      <p className="text-xs text-white/60">Email</p>
                      <p className="text-white font-mono text-sm">{credentials.email}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(credentials.email)}
                      className="text-white/60 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 rounded p-2">
                    <div>
                      <p className="text-xs text-white/60">Password</p>
                      <p className="text-white font-mono text-sm">{credentials.password}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(credentials.password)}
                      className="text-white/60 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200 text-sm">
                <strong>Important:</strong> Save these credentials now! They won't be shown again.
              </div>
            </>
          )}

          {exists && (
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Go to Login
            </Button>
          )}

          {exists && !credentials && (
            <p className="text-center text-white/50 text-sm">
              Log in with your Super Admin credentials to access the console.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSetupPage;
