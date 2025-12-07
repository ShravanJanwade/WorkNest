import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetTimeEntriesProps {
  taskId?: string;
  workspaceId?: string;
  startDate?: string;
  endDate?: string;
}

export const useGetTimeEntries = ({
  taskId,
  workspaceId,
  startDate,
  endDate,
}: UseGetTimeEntriesProps = {}) => {
  return useQuery({
    queryKey: ["time-entries", { taskId, workspaceId, startDate, endDate }],
    queryFn: async () => {
      const response = await client.api["time-tracking"].$get({
        query: {
          taskId,
          workspaceId,
          startDate,
          endDate,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch time entries");
      }

      const { data } = await response.json();
      return data;
    },
  });
};
