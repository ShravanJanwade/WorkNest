import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID } from "node-appwrite";

import { B2_BUCKET_NAME } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { uploadFile, getSignedUrl } from "@/lib/storage";

const app = new Hono()
  .post("/", sessionMiddleware, async (c) => {
    const formData = await c.req.parseBody();
    const image = formData["image"];

    if (!(image instanceof File)) {
      return c.json({ error: "No image file provided" }, 400);
    }

    const fileId = ID.unique();
    await uploadFile(B2_BUCKET_NAME, fileId, image);

    // Return the stable proxy URL
    return c.json({ 
      data: { 
        url: `/api/upload/${fileId}`,
        fileId 
      } 
    });
  })
  .get("/:fileId", sessionMiddleware, async (c) => {
    const { fileId } = c.req.param();

    try {
      // Get a fresh signed URL
      const signedUrl = await getSignedUrl(B2_BUCKET_NAME, fileId);
      return c.redirect(signedUrl);
    } catch (error) {
      console.error("Error fetching image:", error);
      return c.json({ error: "Failed to fetch image" }, 500);
    }
  });

export default app;
