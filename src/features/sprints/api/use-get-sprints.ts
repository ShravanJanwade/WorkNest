import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetSprintsProps {
  workspaceId: string;
  projectId?: string;
  status?: "planned" | "active" | "completed";
}

export const useGetSprints = ({ workspaceId, projectId, status }: UseGetSprintsProps) => {
  return useQuery({
    queryKey: ["sprints", workspaceId, projectId, status],
    queryFn: async () => {
      const response = await client.api.sprints.$get({
        query: { workspaceId, projectId, status },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sprints");
      }

      const { data } = await response.json();
      return data;
    },
  });
};
