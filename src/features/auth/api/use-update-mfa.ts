import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type RequestType = {
  enabled: boolean;
};

export const useUpdateMfa = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, RequestType>({
    mutationFn: async ({ enabled }) => {
      const response = await client.api.auth["update-mfa"].$post({
        json: { enabled },
      });
      return await response.json();
    },
    onSuccess: (_, { enabled }) => {
      toast.success(enabled ? "MFA Enabled" : "MFA Disabled");
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Failed to update MFA settings");
    },
  });

  return mutation;
};
