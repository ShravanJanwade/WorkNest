"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.admin.users.invite.$post>;
type RequestType = InferRequestType<typeof client.api.admin.users.invite.$post>;

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.admin.users.invite.$post({ json });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as { error: string }).error || "Failed to invite user.");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("User invited successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
