"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.admin["request-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.admin["request-delete"]["$post"]>;

export const useRequestDelete = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.admin["request-delete"]["$post"]({ json });
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as { error?: string }).error || "Failed to request deletion");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Deletion request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit deletion request");
    },
  });

  return mutation;
};
