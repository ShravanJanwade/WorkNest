"use client";

import { redirect } from "next/navigation";
import { useCurrent } from "@/features/auth/api/use-current";
import { Loader2 } from "lucide-react";

import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";
import { CreateEpicModal } from "@/features/epics/components/create-epic-modal";
import { InviteModal } from "@/features/workspaces/components/invite-modal";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { data: user, isLoading } = useCurrent();

  // Show loading while checking user
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect Super Admin to their panel - they shouldn't access regular dashboard
  if (user?.prefs?.isSuperAdmin) {
    redirect("/superadmin");
  }

  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
      <CreateEpicModal />
      <InviteModal />
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
          <Sidebar />
        </div>
        <div className="lg:pl-[264px] w-full">
          <div className="mx-auto max-w-screen-2xl h-full">
            <Navbar />
            <main className="h-full py-8 px-6 flex flex-col">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
