"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.superadmin.companies.$post>;
type RequestType = InferRequestType<typeof client.api.superadmin.companies.$post>;

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.superadmin.companies.$post({ json });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as { error: string }).error || "Failed to create company.");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      const message = (data as any)?.data?.message || "Company created successfully!";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["superadmin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-stats"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
