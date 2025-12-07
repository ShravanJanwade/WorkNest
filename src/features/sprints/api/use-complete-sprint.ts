import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.sprints)[":sprintId"]["complete"]["$post"],
  200
>;

type RequestType = InferRequestType<(typeof client.api.sprints)[":sprintId"]["complete"]["$post"]>;

interface UseCompleteSprintProps {
  workspaceId: string;
}

export const useCompleteSprint = ({ workspaceId }: UseCompleteSprintProps) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.sprints[":sprintId"]["complete"]["$post"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to complete sprint");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Sprint completed");
      queryClient.invalidateQueries({ queryKey: ["sprints", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to complete sprint");
    },
  });
};
