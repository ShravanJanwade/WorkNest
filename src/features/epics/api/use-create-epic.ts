import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.epics)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.epics)["$post"]>;

export const useCreateEpic = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.epics.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to create epic");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Epic created");
      queryClient.invalidateQueries({ queryKey: ["epics"] });
    },
    onError: () => {
      toast.error("Failed to create epic");
    },
  });

  return mutation;
};
