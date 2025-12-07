import { Storage } from "node-appwrite";
async function createThumbnail(file: File, maxSize = 300): Promise<Blob> {
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

  const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8));
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

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
  const thumbBlob = await createThumbnail(image, 300);

  const originalFileId = idGenerator();
  const originalFile = await storage.createFile(bucketId, originalFileId, image);

  const thumbFileId = idGenerator();

  const thumbFile = await storage.createFile(bucketId, thumbFileId, thumbBlob as unknown as File);

  const previewDataUrl = await blobToDataUrl(thumbBlob);

  return {
    original: { file: originalFile, id: originalFileId },
    thumbnail: { file: thumbFile, id: thumbFileId },
    previewDataUrl,
  };
}
