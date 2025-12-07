"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.superadmin["delete-requests"]["approve"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.superadmin["delete-requests"]["approve"]["$post"]>;

export const useApproveDelete = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.superadmin["delete-requests"]["approve"]["$post"]({ json });
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as { error?: string }).error || "Failed to process request");
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      const approved = (variables as any).json?.approved;
      toast.success(approved ? "Company deleted successfully" : "Request rejected");
      queryClient.invalidateQueries({ queryKey: ["superadmin-delete-requests"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-stats"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process request");
    },
  });

  return mutation;
};
