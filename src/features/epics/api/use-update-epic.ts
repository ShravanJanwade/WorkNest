import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.epics)[":epicId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.epics)[":epicId"]["$patch"]
>;

export const useUpdateEpic = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.epics[":epicId"].$patch({
        json,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update epic");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Epic updated");
      queryClient.invalidateQueries({ queryKey: ["epics"] });
    },
    onError: () => {
      toast.error("Failed to update epic");
    },
  });

  return mutation;
};
