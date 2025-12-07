"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api)["time-tracking"][":timeEntryId"]["$delete"]>;
type RequestType = InferRequestType<(typeof client.api)["time-tracking"][":timeEntryId"]["$delete"]>;

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api["time-tracking"][":timeEntryId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete time entry");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Time entry deleted");
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete time entry");
    },
  });

  return mutation;
};
