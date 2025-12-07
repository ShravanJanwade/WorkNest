import { useEffect, useState } from "react";

const WORKSPACE_STORAGE_KEY = "worknest-last-workspace-id";

export const useWorkspacePersistence = () => {
  const [savedWorkspaceId, setSavedWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      setSavedWorkspaceId(saved);
    }
  }, []);

  const saveWorkspaceId = (workspaceId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
      setSavedWorkspaceId(workspaceId);
    }
  };

  return {
    savedWorkspaceId,
    saveWorkspaceId,
  };
};
