import { ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { DATABASE_ID, COMMENTS_ID, TASKS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";

import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";

import { createCommentSchema, updateCommentSchema } from "../schemas";
import { Comment, CommentWithAuthor } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        taskId: z.string(),
      }),
    ),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");
        const { taskId } = c.req.valid("query");

        if (!COMMENTS_ID) {
          return c.json({
            data: {
              documents: [],
              total: 0,
            },
          });
        }

        let task: Task;
        try {
          task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
        } catch {
          return c.json({ error: "Task not found" }, 404);
        }

        const member = await getMember({
          databases,
          workspaceId: task.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const comments = await databases.listDocuments<Comment>(DATABASE_ID, COMMENTS_ID, [
          Query.equal("taskId", taskId),
          Query.orderDesc("$createdAt"),
        ]);

        const authorIds = Array.from(new Set(comments.documents.map((c) => c.authorId)));

        const { users } = await createAdminClient();
        const authorPromises = authorIds.map(async (authorId) => {
          try {
            const authorUser = await users.get(authorId);
            return {
              $id: authorId,
              name: authorUser.name || authorUser.email,
              email: authorUser.email,
            };
          } catch {
            return {
              $id: authorId,
              name: "Unknown User",
              email: "",
            };
          }
        });

        const authors = await Promise.all(authorPromises);
        const authorMap = new Map(authors.map((a) => [a.$id, a]));

        const commentMap = new Map<string, CommentWithAuthor>();
        const topLevelComments: CommentWithAuthor[] = [];

        comments.documents.forEach((comment) => {
          const author = authorMap.get(comment.authorId) || {
            $id: comment.authorId,
            name: "Unknown",
            email: "",
          };

          commentMap.set(comment.$id, {
            ...comment,
            author,
            replies: [],
          });
        });

        comments.documents.forEach((comment) => {
          const commentWithAuthor = commentMap.get(comment.$id)!;

          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
              parent.replies = parent.replies || [];
              parent.replies.push(commentWithAuthor);
            }
          } else {
            topLevelComments.push(commentWithAuthor);
          }
        });

        topLevelComments.forEach((comment) => {
          if (comment.replies) {
            comment.replies.sort(
              (a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime(),
            );
          }
        });

        return c.json({
          data: {
            ...comments,
            documents: topLevelComments,
          },
        });
      } catch (error) {
        console.error("Comments GET error:", error);
        return c.json({
          data: {
            documents: [],
            total: 0,
          },
        });
      }
    },
  )
  .post("/", sessionMiddleware, zValidator("json", createCommentSchema), async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { taskId, content, parentId, mentions } = c.req.valid("json");

      if (!COMMENTS_ID) {
        return c.json({ error: "Comments not configured" }, 500);
      }

      let task: Task;
      try {
        task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
      } catch {
        return c.json({ error: "Task not found" }, 404);
      }

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const comment = await databases.createDocument(DATABASE_ID, COMMENTS_ID, ID.unique(), {
        taskId,
        authorId: user.$id,
        content,
        parentId: parentId || null,
        mentions: mentions || [],
        isEdited: false,
      });

      return c.json({ data: comment });
    } catch (error) {
      console.error("Comment POST error:", error);
      return c.json({ error: "Failed to create comment" }, 500);
    }
  })
  .patch("/:commentId", sessionMiddleware, zValidator("json", updateCommentSchema), async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { commentId } = c.req.param();
      const { content } = c.req.valid("json");

      if (!COMMENTS_ID) {
        return c.json({ error: "Comments not configured" }, 500);
      }

      const existingComment = await databases.getDocument<Comment>(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      if (existingComment.authorId !== user.$id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const comment = await databases.updateDocument(DATABASE_ID, COMMENTS_ID, commentId, {
        content,
        isEdited: true,
      });

      return c.json({ data: comment });
    } catch (error) {
      console.error("Comment PATCH error:", error);
      return c.json({ error: "Failed to update comment" }, 500);
    }
  })
  .delete("/:commentId", sessionMiddleware, async (c) => {
    try {
      const databases = c.get("databases");
      const user = c.get("user");
      const { commentId } = c.req.param();

      if (!COMMENTS_ID) {
        return c.json({ error: "Comments not configured" }, 500);
      }

      const existingComment = await databases.getDocument<Comment>(
        DATABASE_ID,
        COMMENTS_ID,
        commentId,
      );

      const task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, existingComment.taskId);

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      const isAuthor = existingComment.authorId === user.$id;
      const isAdmin = member?.role === "ADMIN";

      if (!isAuthor && !isAdmin) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const replies = await databases.listDocuments<Comment>(DATABASE_ID, COMMENTS_ID, [
          Query.equal("parentId", commentId),
        ]);

        for (const reply of replies.documents) {
          await databases.deleteDocument(DATABASE_ID, COMMENTS_ID, reply.$id);
        }
      } catch {}

      await databases.deleteDocument(DATABASE_ID, COMMENTS_ID, commentId);

      return c.json({ data: { $id: commentId } });
    } catch (error) {
      console.error("Comment DELETE error:", error);
      return c.json({ error: "Failed to delete comment" }, 500);
    }
  });

export default app;
