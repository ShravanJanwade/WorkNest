"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetSuperAdminStats = () => {
  const query = useQuery({
    queryKey: ["superadmin-stats"],
    queryFn: async () => {
      const response = await client.api.superadmin.stats.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch stats.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
