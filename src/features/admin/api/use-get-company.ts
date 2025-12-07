"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetCompany = () => {
  const query = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await client.api.admin.company.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch company.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
