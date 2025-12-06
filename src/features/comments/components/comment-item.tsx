"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Reply, Trash2, Edit, CornerDownRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CommentWithAuthor } from "../types";
import { useDeleteComment } from "../api/use-delete-comment";
import { CommentInput } from "./comment-input";
import { useCurrent } from "@/features/auth/api/use-current";

interface CommentItemProps {
  comment: CommentWithAuthor;
  taskId: string;
  isReply?: boolean;
}

export const CommentItem = ({ comment, taskId, isReply = false }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: currentUser } = useCurrent();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment({ taskId });

  const isAuthor = currentUser?.$id === comment.authorId;

  const handleDelete = () => {
    deleteComment({ param: { commentId: comment.$id } });
  };

  const initials = comment.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`group ${isReply ? "ml-8 mt-3" : ""}`}>
      <div className="flex gap-3">
        {isReply && (
          <CornerDownRight className="h-4 w-4 text-gray-400 mt-2 flex-shrink-0" />
        )}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">
              {comment.author.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          
          {isEditing ? (
            <CommentInput
              taskId={taskId}
              initialValue={comment.content}
              commentId={comment.$id}
              onCancel={() => setIsEditing(false)}
              isEdit
            />
          ) : (
            <div className="mt-1 text-sm text-gray-700 prose prose-sm max-w-none [&>p]:mb-1 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {comment.content}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Actions */}
          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Reply input */}
      {isReplying && (
        <div className="ml-11 mt-3">
          <CommentInput
            taskId={taskId}
            parentId={comment.$id}
            onCancel={() => setIsReplying(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}
      
      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.$id}
              comment={reply}
              taskId={taskId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
};
