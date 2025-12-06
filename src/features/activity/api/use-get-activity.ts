import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetActivityProps {
  taskId: string;
  limit?: number;
}

export const useGetActivity = ({ taskId, limit = 50 }: UseGetActivityProps) => {
  return useQuery({
    queryKey: ["activity", taskId],
    queryFn: async () => {
      const response = await client.api.activity.$get({
        query: { taskId, limit: limit.toString() },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      const { data } = await response.json();
      return data;
    },
    refetchInterval: 3000,
  });
};
