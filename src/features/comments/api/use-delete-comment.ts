import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.comments)[":commentId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.comments)[":commentId"]["$delete"]
>;

interface UseDeleteCommentProps {
  taskId: string;
}

export const useDeleteComment = ({ taskId }: UseDeleteCommentProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.comments[":commentId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  return mutation;
};
