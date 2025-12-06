import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.sprints.$post, 200>;
type RequestType = InferRequestType<typeof client.api.sprints.$post>;

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.sprints.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to create sprint");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      toast.success("Sprint created");
      queryClient.invalidateQueries({ queryKey: ["sprints", variables.json.workspaceId] });
    },
    onError: () => {
      toast.error("Failed to create sprint");
    },
  });
};
