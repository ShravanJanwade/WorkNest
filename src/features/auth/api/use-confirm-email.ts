"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type RequestType = {
  userId: string;
  secret: string;
};

export const useConfirmEmail = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, RequestType>({
    mutationFn: async ({ userId, secret }) => {
      const response = await client.api.auth["verify-email"].$post({
        json: { userId, secret },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Email verified successfully");
      router.push("/dashboard");
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Verification failed. Link may be invalid or expired.");
    },
  });

  return mutation;
};
