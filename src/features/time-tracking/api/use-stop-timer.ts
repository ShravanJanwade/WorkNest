import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api)["time-tracking"]["stop"]["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api)["time-tracking"]["stop"]["$post"]>;

export const useStopTimer = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api["time-tracking"]["stop"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to stop timer");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Timer stopped");
      queryClient.invalidateQueries({ queryKey: ["active-timer"] });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
    onError: () => {
      toast.error("Failed to stop timer");
    },
  });
};
