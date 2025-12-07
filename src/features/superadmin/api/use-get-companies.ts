"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetSuperAdminCompanies = () => {
  const query = useQuery({
    queryKey: ["superadmin-companies"],
    queryFn: async () => {
      const response = await client.api.superadmin.companies.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch companies.");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
