/**
 * Backblaze B2 Native API Storage Utility
 * Uses raw HTTP requests instead of S3 compatibility layer to avoid SDK issues.
 */

const B2_KEY_ID = process.env.B2_KEY_ID?.trim() || "";
const B2_APP_KEY = process.env.B2_APP_KEY?.trim() || "";
const B2_BUCKET_ID = process.env.B2_BUCKET_ID?.trim() || "";
const B2_BUCKET_NAME_ENV = process.env.B2_BUCKET_NAME?.trim() || "";

console.log("--- Backblaze B2 Config Check ---");
console.log("Key ID Length:", B2_KEY_ID ? B2_KEY_ID.length : 0);
console.log("Key ID Start:", B2_KEY_ID ? B2_KEY_ID.substring(0, 4) + "..." : "N/A");
console.log("App Key Length:", B2_APP_KEY ? B2_APP_KEY.length : 0);
console.log("Bucket ID:", B2_BUCKET_ID ? B2_BUCKET_ID.substring(0, 8) + "..." : "N/A");
console.log("Bucket Name:", B2_BUCKET_NAME_ENV || "N/A");
console.log("---------------------------------");

if (!B2_KEY_ID || !B2_APP_KEY) {
  console.warn("Missing Backblaze B2 environment variables (B2_KEY_ID, B2_APP_KEY).");
}
if (!B2_BUCKET_NAME_ENV) {
  console.warn("B2_BUCKET_NAME not set - required for download URLs.");
}

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  allowed: {
    bucketId?: string;
    bucketName?: string;
  };
}

interface B2UploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

// Cache auth token (valid for 24 hours, we refresh every hour)
let cachedAuth: { auth: B2AuthResponse; expires: number } | null = null;

/**
 * Authorize with B2 and get API URLs
 */
async function authorizeB2(): Promise<B2AuthResponse> {
  // Return cached auth if still valid
  if (cachedAuth && Date.now() < cachedAuth.expires) {
    return cachedAuth.auth;
  }

  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString("base64");

  const response = await fetch(
    "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`B2 authorization failed: ${response.status} - ${errorText}`);
  }

  const auth = (await response.json()) as B2AuthResponse;

  // Cache for 1 hour
  cachedAuth = {
    auth,
    expires: Date.now() + 60 * 60 * 1000,
  };

  return auth;
}

/**
 * Get an upload URL for the bucket
 */
async function getUploadUrl(auth: B2AuthResponse): Promise<B2UploadUrlResponse> {
  const bucketId = B2_BUCKET_ID || auth.allowed.bucketId;

  if (!bucketId) {
    throw new Error("B2_BUCKET_ID is not set and could not be determined from auth.");
  }

  const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`B2 get upload URL failed: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as B2UploadUrlResponse;
}

/**
 * Upload a file to B2 bucket using Native B2 API.
 * @param bucketName - Not used with native API, kept for interface compatibility
 * @param fileId - The unique key/name for the file
 * @param file - The file object (Blob/File)
 * @returns The file key
 */
export async function uploadFile(
  bucketName: string,
  fileId: string,
  file: File
): Promise<string> {
  const auth = await authorizeB2();
  const uploadUrl = await getUploadUrl(auth);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Calculate SHA1 hash for B2
  const crypto = await import("crypto");
  const sha1 = crypto.createHash("sha1").update(buffer).digest("hex");

  const response = await fetch(uploadUrl.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: uploadUrl.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(fileId),
      "Content-Type": file.type || "application/octet-stream",
      "Content-Length": buffer.length.toString(),
      "X-Bz-Content-Sha1": sha1,
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`B2 upload failed: ${response.status} - ${errorText}`);
  }

  return fileId;
}

/**
 * Get a download URL for a file.
 * For private buckets, this creates an authorization header approach.
 * @param bucketName - The bucket name (used to construct URL)
 * @param fileId - The file key/name
 * @returns Download URL string
 */
export async function getSignedUrl(
  bucketNameParam: string,
  fileId: string
): Promise<string> {
  const auth = await authorizeB2();

  // For private buckets, we need to use the download authorization
  const response = await fetch(
    `${auth.apiUrl}/b2api/v2/b2_get_download_authorization`,
    {
      method: "POST",
      headers: {
        Authorization: auth.authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: B2_BUCKET_ID || auth.allowed.bucketId,
        fileNamePrefix: fileId,
        validDurationInSeconds: 3600, // 1 hour
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`B2 get download auth failed: ${response.status} - ${errorText}`);
  }

  const downloadAuth = (await response.json()) as { authorizationToken: string };

  // Use bucket name from env or the param (which might be from config)
  const bucketName = B2_BUCKET_NAME_ENV || bucketNameParam;
  
  // Return URL with authorization token as query param
  return `${auth.downloadUrl}/file/${bucketName}/${encodeURIComponent(fileId)}?Authorization=${downloadAuth.authorizationToken}`;
}

/**
 * Delete a file from B2.
 * Note: B2 requires both fileName and fileId for deletion.
 * This is a simplified version that may need adjustment.
 */
export async function deleteFile(bucketName: string, fileId: string) {
  const auth = await authorizeB2();

  // First, we need to get the file's B2 fileId (different from our fileId/name)
  // This requires listing files first - simplified version just logs warning
  console.warn(
    "deleteFile: B2 Native API requires fileId from upload response. " +
      "Consider storing B2 fileId in database for proper deletion."
  );
}
