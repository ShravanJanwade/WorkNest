import { Models } from "node-appwrite";

export type Comment = Models.Document & {
  taskId: string;
  authorId: string;
  content: string;
  parentId?: string;
  mentions?: string[];
  isEdited?: boolean;
};

export type CommentWithAuthor = Comment & {
  author: {
    name: string;
    email: string;
    $id: string;
  };
  replies?: CommentWithAuthor[];
};
