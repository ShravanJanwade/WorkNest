import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api)["time-tracking"]["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api)["time-tracking"]["$post"]>;

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api["time-tracking"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to create time entry");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Time entry logged");
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
    onError: () => {
      toast.error("Failed to log time entry");
    },
  });
};
