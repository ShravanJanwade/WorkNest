"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetAdminStats = () => {
  const query = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await client.api.admin.stats.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch admin stats.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
