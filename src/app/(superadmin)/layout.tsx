"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Building2, Home, Trash2, Loader2 } from "lucide-react";

import { useCurrent } from "@/features/auth/api/use-current";
import { useLogout } from "@/features/auth/api/use-logout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/superadmin", label: "Dashboard", icon: Home },
  { href: "/superadmin/companies", label: "Companies", icon: Building2 },
  { href: "/superadmin/delete-requests", label: "Delete Requests", icon: Trash2 },
];

const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isRedirecting) {
      if (!user) {
        setIsRedirecting(true);
        router.push("/superadmin-setup");
      } else if (!user.prefs?.isSuperAdmin) {
        setIsRedirecting(true);
        router.push("/");
      }
    }
  }, [user, isLoading, router, isRedirecting]);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto" />
            <p className="text-muted-foreground mt-4">Loading Super Admin Console...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !user.prefs?.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    WorkNest
                  </h1>
                  <p className="text-xs text-muted-foreground">Super Admin Console</p>
                </div>
              </div>

              {}
              <nav className="hidden md:flex items-center gap-1 ml-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-2 transition-all",
                          isActive
                            ? "bg-violet-100 text-violet-700 hover:bg-violet-100"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 border border-violet-200">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-violet-700">{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/sign-in");
                }}
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {}
      <footer className="border-t bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            WorkNest Super Admin Console • Platform Management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SuperAdminLayout;
