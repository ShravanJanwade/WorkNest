import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetEpicsProps {
  workspaceId: string;
  projectId: string;
  search?: string;
}

export const useGetEpics = ({
  workspaceId,
  projectId,
  search,
}: UseGetEpicsProps) => {
  const query = useQuery({
    queryKey: ["epics", workspaceId, projectId, search],
    queryFn: async () => {
      const response = await client.api.epics.$get({
        query: { workspaceId, projectId, search },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch epics");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!projectId,
  });

  return query;
};
