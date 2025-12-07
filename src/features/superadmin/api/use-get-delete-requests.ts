"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetDeleteRequests = () => {
  const query = useQuery({
    queryKey: ["superadmin-delete-requests"],
    queryFn: async () => {
      const response = await client.api.superadmin["delete-requests"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch delete requests.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
