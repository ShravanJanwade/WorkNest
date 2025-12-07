import { NextResponse } from "next/server";

const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const DEFAULT_FILENAME_PREFIX = "gen";
const DEFAULT_EXTENSION = "png";

if (!IMAGEKIT_URL_ENDPOINT) {
  console.warn("IMAGEKIT_URL_ENDPOINT not set. Image generation will fail until you set it.");
}
if (!IMAGEKIT_PRIVATE_KEY) {
  console.warn("IMAGEKIT_PRIVATE_KEY not set. Server-side upload will fail until you set it.");
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
      { status: 500 },
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

  const filename = body.filename ?? `${DEFAULT_FILENAME_PREFIX}-${Date.now()}.${DEFAULT_EXTENSION}`;
  const promptSegment = `ik-genimg-prompt-${safeSegment(prompt)}`;

  const generatedUrl = `${IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "")}/${promptSegment}/${filename}`;

  try {
    const tryRes = await fetch(generatedUrl, { method: "GET" });

    const contentType = tryRes.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");
    if (isHtml || tryRes.status === 202 || tryRes.status === 302) {
      return NextResponse.json({
        pending: true,
        url: generatedUrl,
        message: "ImageKit is preparing the asset. Try fetching the url shortly.",
      });
    }

    if (!contentType.startsWith("image/")) {
      const txt = await tryRes.text();
      console.error("[generate-image] unexpected non-image response", {
        status: tryRes.status,
        text: txt,
      });
      return NextResponse.json(
        { error: "ImageKit returned non-image response", details: txt },
        { status: 500 },
      );
    }

    const arrayBuffer = await tryRes.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString("base64");

    if (IMAGEKIT_PRIVATE_KEY) {
      const uploadUrl = "https://upload.imagekit.io/api/v1/files/upload";

      const fileData = `data:${contentType};base64,${b64}`;

      const form = new FormData();
      form.append("file", fileData);
      form.append("fileName", filename);

      const basicAuth = `Basic ${Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`;

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
        },
        body: form as unknown as BodyInit,
      });

      const uploadText = await uploadRes.text();
      let uploadJson: unknown = uploadText;
      try {
        uploadJson = JSON.parse(uploadText);
      } catch {}

      if (!uploadRes.ok) {
        console.error("[generate-image] ImageKit upload failed", {
          status: uploadRes.status,
          raw: uploadText,
          parsed: uploadJson,
        });

        return NextResponse.json({
          pending: false,
          url: generatedUrl,
          b64,
          uploadError: uploadJson,
        });
      }

      const fileInfo = uploadJson as any;
      return NextResponse.json({
        pending: false,
        url: fileInfo.url ?? generatedUrl,
        b64,
        uploaded: fileInfo,
      });
    }

    return NextResponse.json({ pending: false, url: generatedUrl, b64 });
  } catch (err: unknown) {
    console.error("[generate-image] unexpected error", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
