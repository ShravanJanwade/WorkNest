"use client";

import { Plus } from "lucide-react";
import { format } from "date-fns";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent } from "@/components/ui/card";

import { useGetEpics } from "@/features/epics/api/use-get-epics";
import { useCreateEpicModal } from "@/features/epics/hooks/use-create-epic-modal";
import { useDeleteEpic } from "@/features/epics/api/use-delete-epic";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

export const EpicClient = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data: epics, isLoading } = useGetEpics({ workspaceId, projectId });
  const { open } = useCreateEpicModal();
  const { mutate: deleteEpic, isPending: isDeletingEpic } = useDeleteEpic();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!epics) {
    return <PageError message="Failed to load epics" />;
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this epic?")) {
      deleteEpic({ param: { epicId: id } });
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-bold">Epics</h1>
          <p className="text-muted-foreground">
            Manage epics for your project
          </p>
        </div>
        <Button onClick={open} size="sm">
          <Plus className="size-4 mr-2" />
          Create Epic
        </Button>
      </div>
      <DottedSeparator />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {epics.documents.length === 0 && (
          <div className="col-span-1 lg:col-span-2 h-40 flex items-center justify-center bg-white dark:bg-card rounded-lg border border-dashed text-muted-foreground">
            No epics found
          </div>
        )}
        {epics.documents.map((epic) => (
          <Card key={epic.$id} className="cursor-pointer hover:opacity-75 transition">
            <CardContent className="p-4 flex flex-col gap-y-2">
              <div className="flex items-start justify-between">
                <p className="text-lg font-bold">{epic.name}</p>
                <div className="text-sm text-muted-foreground">
                 {epic.startDate ? format(new Date(epic.startDate), "MMM d") : "No start"} - {epic.endDate ? format(new Date(epic.endDate), "MMM d") : "No end"}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {epic.description || "No description"}
              </p>
              <div className="flex items-center justify-end mt-2">
                 <Button
                    variant="destructive"
                    size="xs"
                    disabled={isDeletingEpic}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(epic.$id);
                    }}
                  >
                    Delete
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
