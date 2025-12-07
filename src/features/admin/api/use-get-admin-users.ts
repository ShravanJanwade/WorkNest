"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetAdminUsers = () => {
  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await client.api.admin.users.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
