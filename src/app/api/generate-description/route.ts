// app/api/generate-description/route.ts
import { NextResponse } from "next/server";

const MODEL = process.env.GEN_MODEL || "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const API_KEY = process.env.NEXT_PUBLIC_GEN_API_KEY;

if (!API_KEY) {
  // This file runs at module load; helpful for dev to detect missing key early.
  console.warn(
    "GEN_API_KEY not set — set process.env.GEN_API_KEY in your environment."
  );
}

export async function POST(req: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Server not configured with GEN_API_KEY" },
        { status: 500 }
      );
    }
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Build request in the shape the Gemini docs expect.
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      // optional config tweaks:
      generationConfig: {
        // reduce hallucination / speed vs quality tradeoff settings here
        temperature: 0.2,
      },
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: "Gemini error", details: txt },
        { status: res.status }
      );
    }

    const json = await res.json();
    // the REST response contains candidates -> content -> parts -> text (see docs)
    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      json?.candidates?.[0]?.content?.[0]?.parts?.[0]?.text ||
      "";

    return NextResponse.json({ text });
  } catch (err: unknown) {
    console.error("generate-description error:", err);
    return NextResponse.json(
      { error: String((err as { message: string })?.message || err) },
      { status: 500 }
    );
  }
}
