"use client";

import { MessageSquare, Loader2 } from "lucide-react";

import { useGetComments } from "../api/use-get-comments";
import { CommentItem } from "./comment-item";
import { CommentInput } from "./comment-input";
import { DottedSeparator } from "@/components/dotted-separator";

interface CommentThreadProps {
  taskId: string;
}

export const CommentThread = ({ taskId }: CommentThreadProps) => {
  const { data, isLoading } = useGetComments({ taskId });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">
          Comments
          {data && data.documents.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({data.documents.length})
            </span>
          )}
        </h3>
      </div>

      <DottedSeparator />

      {}
      <CommentInput taskId={taskId} />

      <DottedSeparator />

      {}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : data && data.documents.length > 0 ? (
        <div className="space-y-4">
          {data.documents.map((comment) => (
            <CommentItem key={comment.$id} comment={comment} taskId={taskId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No comments yet</p>
          <p className="text-xs text-gray-400">Be the first to start the conversation</p>
        </div>
      )}
    </div>
  );
};
