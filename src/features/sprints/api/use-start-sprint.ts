import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.sprints)[":sprintId"]["start"]["$post"],
  200
>;

type RequestType = InferRequestType<(typeof client.api.sprints)[":sprintId"]["start"]["$post"]>;

interface UseStartSprintProps {
  workspaceId: string;
}

export const useStartSprint = ({ workspaceId }: UseStartSprintProps) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.sprints[":sprintId"]["start"]["$post"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to start sprint");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Sprint started");
      queryClient.invalidateQueries({ queryKey: ["sprints", workspaceId] });
    },
    onError: () => {
      toast.error("Failed to start sprint");
    },
  });
};
