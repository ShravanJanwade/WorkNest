"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Editor } from "@/components/editor";

import { useCreateComment } from "../api/use-create-comment";
import { useCurrent } from "@/features/auth/api/use-current";
import { useUploadImage } from "@/features/upload/api/use-upload-image";

interface CommentInputProps {
  taskId: string;
  parentId?: string;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  commentId?: string;
  isEdit?: boolean;
}

export const CommentInput = ({
  taskId,
  parentId,
  onCancel,
  placeholder = "Add a comment...",
  initialValue = "",
  isEdit = false,
}: CommentInputProps) => {
  const [content, setContent] = useState(initialValue);
  const { data: currentUser } = useCurrent();
  const { mutate: createComment, isPending } = useCreateComment();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();

  const handleImageUpload = async (file: File) => {
    const response = await uploadImage({ image: file });
    return response.data.url;
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    createComment(
      {
        json: {
          taskId,
          content: content.trim(),
          parentId,
        },
      },
      {
        onSuccess: () => {
          setContent("");
          onCancel?.();
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex gap-3">
      {!isEdit && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 space-y-2">
        <Editor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={isEdit ? 100 : 200}
          placeholder={placeholder}
          disabled={isPending || isUploading}
          onImageUpload={handleImageUpload}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Press Ctrl+Enter to submit</span>

          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isPending || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-1" />
              {isEdit ? "Update" : parentId ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
