import { useParams } from "next/navigation";

export const useWorkspaceId = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  // If no workspaceId in URL, fallback to localStorage
  if (!workspaceId && typeof window !== "undefined") {
    const savedId = localStorage.getItem("worknest-last-workspace-id");
    return savedId || "";
  }
  
  return workspaceId || "";
};
