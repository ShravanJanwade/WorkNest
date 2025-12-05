// utils/image-upload-client.ts
// Assumes you have `storage` (Appwrite Storage SDK) available in this context
// and IMAGES_BUCKET_ID + an ID generator (like nanoid or your existing ID.unique()).
import { Storage } from "node-appwrite";
async function createThumbnail(file: File, maxSize = 300): Promise<Blob> {
  // read file into image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    image.src = url;
  });

  // compute scaled size while keeping aspect ratio
  const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  // draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  // export to blob (jpeg or png)
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8)
  );
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload original and thumbnail to Appwrite and return preview data URL & file ids.
 * storage: instance of Appwrite Storage
 * image: File
 */
export async function uploadImageWithClientThumbnail({
  storage,
  image,
  bucketId,
  idGenerator,
}: {
  storage: Storage;
  image: File;
  bucketId: string;
  idGenerator: () => string;
}) {
  // 1. Create thumbnail in browser
  const thumbBlob = await createThumbnail(image, 300); // 300px max

  // 2. Upload original file
  const originalFileId = idGenerator();
  const originalFile = await storage.createFile(
    bucketId,
    originalFileId,
    image
  );
  // 3. Upload thumbnail (as a separate file)
  const thumbFileId = idGenerator();
  // Appwrite SDK accepts File/Blob in browser
  const thumbFile = await storage.createFile(
    bucketId,
    thumbFileId,
    thumbBlob as unknown as File
  );

  // 4. Create data URL for immediate UI preview (from thumbnail blob)
  const previewDataUrl = await blobToDataUrl(thumbBlob);

  return {
    original: { file: originalFile, id: originalFileId },
    thumbnail: { file: thumbFile, id: thumbFileId },
    previewDataUrl,
  };
}
