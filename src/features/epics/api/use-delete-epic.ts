import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.epics)[":epicId"]["$delete"], 200>;

type RequestType = InferRequestType<(typeof client.api.epics)[":epicId"]["$delete"]>;

export const useDeleteEpic = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.epics[":epicId"].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete epic");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Epic deleted");
      queryClient.invalidateQueries({ queryKey: ["epics"] });
    },
    onError: () => {
      toast.error("Failed to delete epic");
    },
  });

  return mutation;
};
