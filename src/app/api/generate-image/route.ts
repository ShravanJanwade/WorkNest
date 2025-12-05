// app/api/generate-image/route.ts
import { NextResponse } from "next/server";

const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT; // e.g. https://ik.imagekit.io/your_imagekit_id
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY; // private key — keep server-only
const DEFAULT_FILENAME_PREFIX = "gen";
const DEFAULT_EXTENSION = "png";

if (!IMAGEKIT_URL_ENDPOINT) {
  console.warn(
    "IMAGEKIT_URL_ENDPOINT not set. Image generation will fail until you set it."
  );
}
if (!IMAGEKIT_PRIVATE_KEY) {
  console.warn(
    "IMAGEKIT_PRIVATE_KEY not set. Server-side upload will fail until you set it."
  );
}

type ReqBody = {
  prompt?: string;
  width?: number;
  height?: number;
  filename?: string;
};

function safeSegment(s: string) {
  return encodeURIComponent(String(s).replace(/\//g, "-"));
}

export async function POST(req: Request) {
  if (!IMAGEKIT_URL_ENDPOINT) {
    return NextResponse.json(
      { error: "Server not configured with IMAGEKIT_URL_ENDPOINT" },
      { status: 500 }
    );
  }

  let body: ReqBody;
  try {
    body = (await req.json()) as ReqBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = String(body?.prompt || "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const filename =
    body.filename ??
    `${DEFAULT_FILENAME_PREFIX}-${Date.now()}.${DEFAULT_EXTENSION}`;
  const promptSegment = `ik-genimg-prompt-${safeSegment(prompt)}`;
  // imagekit delivery url that triggers generation
  const generatedUrl = `${IMAGEKIT_URL_ENDPOINT.replace(
    /\/$/,
    ""
  )}/${promptSegment}/${filename}`;

  try {
    // Try fetching the generated URL once.
    // If ImageKit hasn't produced the asset yet, it may return an HTML "processing" page or 302/202.
    const tryRes = await fetch(generatedUrl, { method: "GET" });

    // If we got HTML or ImageKit indicates intermediate, tell client to poll/use the url.
    const contentType = tryRes.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    if (isHtml || tryRes.status === 202 || tryRes.status === 302) {
      // Not ready yet — return the delivery url so the client can poll or show it directly
      return NextResponse.json({
        pending: true,
        url: generatedUrl,
        message:
          "ImageKit is preparing the asset. Try fetching the url shortly.",
      });
    }

    // If it's an image, read bytes and optionally upload to ImageKit via server-side Upload API
    if (!contentType.startsWith("image/")) {
      // unexpected: return raw text for debugging
      const txt = await tryRes.text();
      console.error("[generate-image] unexpected non-image response", {
        status: tryRes.status,
        text: txt,
      });
      return NextResponse.json(
        { error: "ImageKit returned non-image response", details: txt },
        { status: 500 }
      );
    }

    // we have an image binary
    const arrayBuffer = await tryRes.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString("base64");

    // If private key present, upload to ImageKit account via Upload API (Basic Auth)
    if (IMAGEKIT_PRIVATE_KEY) {
      // upload endpoint (server-side)
      const uploadUrl = "https://upload.imagekit.io/api/v1/files/upload";
      // The upload API accepts form-data `file` as base64 data (data:<mime>;base64,<b64>)
      const fileData = `data:${contentType};base64,${b64}`;

      const form = new FormData();
      form.append("file", fileData);
      form.append("fileName", filename);
      // optional: you can set folder, tags etc:
      // form.append("folder", "/generated");

      const basicAuth = `Basic ${Buffer.from(
        `${IMAGEKIT_PRIVATE_KEY}:`
      ).toString("base64")}`;

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          // Note: DO NOT set Content-Type here — fetch will add multipart boundary.
        },
        body: form as unknown as BodyInit,
      });

      const uploadText = await uploadRes.text();
      let uploadJson: unknown = uploadText;
      try {
        uploadJson = JSON.parse(uploadText);
      } catch {
        // keep raw text
      }

      if (!uploadRes.ok) {
        console.error("[generate-image] ImageKit upload failed", {
          status: uploadRes.status,
          raw: uploadText,
          parsed: uploadJson,
        });
        // still return the b64 and original generatedUrl for fallback, but communicate upload failure
        return NextResponse.json({
          pending: false,
          url: generatedUrl,
          b64,
          uploadError: uploadJson,
        });
      }

      // successful upload — uploadJson contains file details including url
      const fileInfo = uploadJson as any;
      return NextResponse.json({
        pending: false,
        url: fileInfo.url ?? generatedUrl,
        b64,
        uploaded: fileInfo,
      });
    }

    // No private key present; return b64 + generatedUrl (client can later upload if desired).
    return NextResponse.json({ pending: false, url: generatedUrl, b64 });
  } catch (err: unknown) {
    console.error("[generate-image] unexpected error", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
