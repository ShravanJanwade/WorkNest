import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api)["time-tracking"]["start"]["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api)["time-tracking"]["start"]["$post"]>;

export const useStartTimer = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api["time-tracking"]["start"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to start timer");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Timer started");
      queryClient.invalidateQueries({ queryKey: ["active-timer"] });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
    onError: () => {
      toast.error("Failed to start timer");
    },
  });
};
