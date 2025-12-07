import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useGetActiveTimer = () => {
  return useQuery({
    queryKey: ["active-timer"],
    queryFn: async () => {
      const response = await client.api["time-tracking"]["active"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch active timer");
      }

      const { data } = await response.json();
      return data;
    },
    refetchInterval: 1000,
  });
};
