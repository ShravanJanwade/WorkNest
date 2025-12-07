"use client";

import { z } from "zod";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { cn } from "@/lib/utils";
import { DottedSeparator } from "@/components/dotted-separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createProjectSchema } from "../schemas";
import { useCreateProject } from "../api/use-create-project";

/* helper: convert base64 string -> Blob */
function b64ToBlob(b64: string, mime = "image/png") {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

/** Convert an external URL to a File so server treat it like an uploaded file */
// client-side helper — use when converting a remote image URL (ImageKit) into a File
async function urlToFile(
  url: string,
  defaultBaseName = "project-ai"
): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

  const blob = await res.blob();

  // try Content-Disposition header for filename (rare), otherwise use URL path
  const cd = res.headers.get("content-disposition");
  let filename = "";
  if (cd) {
    const m = /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i.exec(cd);
    if (m?.[1]) filename = decodeURIComponent(m[1]);
  }

  if (!filename) {
    try {
      const pathname = new URL(url).pathname;
      filename = pathname.split("/").pop() || "";
    } catch {
      filename = "";
    }
  }

  // extension from blob.type or from filename; fallback to png
  const mime = blob.type || "image/png";
  const extFromMime = mime.split("/")[1] ?? "png";
  const extFromName = filename.includes(".")
    ? filename.split(".").pop()
    : undefined;
  const ext = (extFromName || extFromMime || "png")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  // sanitize base name
  let base = filename ? filename.replace(/\.[^/.]+$/, "") : defaultBaseName;
  base = base.replace(/[^\w\-]/g, "-").slice(0, 40);

  const finalName = `${base}.${ext}`;

  return new File([blob], finalName, { type: mime });
}

/* Local ImageGenerator component used by both create/edit UIs */
function ImageGenerator({
  value,
  setValue,
  setTouched,
  isPending,
  initialName,
}: {
  value: File | string | null | undefined;
  setValue: (val: File | string | null) => void;
  setTouched?: () => void;
  isPending: boolean;
  initialName?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isGenOpen, setIsGenOpen] = useState(false);
  const [genPrompt, setGenPrompt] = useState(
    `Generate a clean, modern project icon for a project named "${
      initialName || "Project"
    }". Minimal, flat, single-color background, simple symbol that hints at collaboration and tasks. Square composition.`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedB64, setGeneratedB64] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // revoke created object url on unmount
  useEffect(() => {
    return () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
      }
    };
  }, [objectUrl]);

  function onFilePicked(f: File) {
    setGeneratedB64(null);
    setGeneratedUrl(null);
    setGenError(null);
    setObjectUrl(null);
    setValue(f);
    setTouched?.();
  }

  async function handleGenerate() {
    setGenError(null);
    setGeneratedB64(null);
    setGeneratedUrl(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: genPrompt }),
      });

      const json = await res.json();

      if (!res.ok || json?.error) {
        setGenError(json?.error || "Failed to generate image");
        setIsGenerating(false);
        return;
      }

      // ImageKit or your server may respond with `pending` + url
      if (json.pending && json.url) {
        setGeneratedUrl(json.url);
        setIsGenerating(false);
        return;
      }

      // server returned an uploaded info with URL
      if (json.uploaded?.url) {
        setGeneratedUrl(json.uploaded.url);
        setIsGenerating(false);
        return;
      }

      // base64 fallback
      if (json.b64) {
        setGeneratedB64(json.b64);
        try {
          const blob = b64ToBlob(json.b64);
          const url = URL.createObjectURL(blob);
          setObjectUrl(url);
          setGeneratedUrl(url);
        } catch {
          // ignore
        }
        setIsGenerating(false);
        return;
      }

      setGenError("No image returned from server");
    } catch (err) {
      setGenError((err as Error)?.message || "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleUseGenerated() {
    // prefer uploaded URL, otherwise b64 -> File
    try {
      if (generatedUrl && generatedUrl.startsWith("blob:")) {
        // object URL we created on client -> just make a File from blob (can't access blob directly),
        // But we already created objectUrl from a blob: so let's convert by fetching it
        const f = await urlToFile(generatedUrl, initialName || "project-ai");
        setValue(f);
        setTouched?.();
        setIsGenOpen(false);
        return;
      }

      if (generatedUrl && /^https?:\/\//.test(generatedUrl)) {
        // fetch external URL and convert to File so Appwrite accepts it on the server
        const f = await urlToFile(generatedUrl, initialName || "project-ai");
        setValue(f);
        setTouched?.();
        setIsGenOpen(false);
        return;
      }

      if (generatedB64) {
        const blob = b64ToBlob(generatedB64);
        const f = new File([blob], `${initialName || "project"}-ai.png`, {
          type: blob.type || "image/png",
        });
        setValue(f);
        setTouched?.();
        setIsGenOpen(false);
        return;
      }

      setGenError("No generated image to use");
    } catch (err) {
      setGenError(
        (err as Error)?.message || "Failed to convert generated image"
      );
    }
  }

  function handleRemove() {
    setGeneratedB64(null);
    setGeneratedUrl(null);
    setObjectUrl(null);
    setValue(null);
    setTouched?.();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onFilePicked(f);
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center gap-x-4">
        <div className="w-[72px] h-[72px] rounded-md overflow-hidden bg-neutral-50 border flex items-center justify-center">
          {/* preview priority: explicit field value (file/url) > generated (b64/url) */}
          {value instanceof File ? (
            <img
              src={URL.createObjectURL(value)}
              alt="preview"
              className="object-cover w-full h-full"
            />
          ) : typeof value === "string" && value ? (
            // string could be dataURL, blob URL, or remote URL
            // use normal <img> to avoid Next/Image host config problems inside the form
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="object-cover w-full h-full"
            />
          ) : generatedB64 ? (
            // data b64 preview
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${generatedB64}`}
              alt="preview"
              className="object-cover w-full h-full"
            />
          ) : generatedUrl ? (
            // external/generated URL
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={generatedUrl}
              alt="preview"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="text-neutral-400 flex items-center justify-center">
              <ImageIcon className="w-7 h-7" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {initialName || "Project Icon"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            JPG, PNG, SVG or JPEG — recommended 1:1, max 1MB
          </div>

          <div className="flex items-center gap-x-2 mt-3">
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.png,.jpeg,.svg"
              onChange={onInputChange}
              className="hidden"
              id="project-image-input-create"
            />

            <Button
              size="xs"
              variant="outline"
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
            >
              Upload Image
            </Button>

            <Button
              size="xs"
              onClick={() => setIsGenOpen((s) => !s)}
              disabled={isPending}
              type="button"
            >
              Generate with AI
            </Button>

            {value ? (
              <Button
                size="xs"
                variant="destructive"
                onClick={handleRemove}
                disabled={isPending}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Generate panel */}
      {isGenOpen && (
        <div className="mt-2 p-4 rounded-lg border bg-white shadow-sm">
          <label className="block text-sm font-semibold mb-2">
            Image prompt
          </label>
          <textarea
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-300 focus:outline-none text-sm resize-none"
            placeholder="Describe the icon or image you want..."
          />

          <div className="mt-3 flex items-center gap-x-3">
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              type="button"
            >
              {isGenerating ? "Generating…" : "Generate Image"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsGenOpen(false);
                setGeneratedB64(null);
                setGeneratedUrl(null);
                setGenError(null);
              }}
              type="button"
            >
              Close
            </Button>

            <div className="ml-auto text-xs text-muted-foreground">
              {genPrompt.length} chars
            </div>
          </div>

          <div className="mt-4">
            {isGenerating && (
              <div className="rounded-lg border p-4 bg-gradient-to-r from-white to-slate-50 overflow-hidden">
                <div className="h-40 w-full rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse" />
                <div className="mt-3 text-xs text-muted-foreground">
                  Generating image…
                </div>
              </div>
            )}

            {!isGenerating && (generatedB64 || generatedUrl) && (
              <div className="flex flex-col gap-y-3">
                <div className="relative w-48 h-48 rounded-md overflow-hidden border">
                  {generatedB64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:image/png;base64,${generatedB64}`}
                      alt="generated preview"
                      className="object-cover w-full h-full"
                    />
                  ) : generatedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={generatedUrl}
                      alt="generated preview"
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                </div>

                <div className="flex gap-x-2">
                  <Button size="sm" onClick={handleUseGenerated} type="button">
                    Use Image
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setGeneratedB64(null);
                      setGeneratedUrl(null);
                    }}
                    type="button"
                  >
                    Discard
                  </Button>

                  {generatedUrl && (
                    <a
                      className="ml-auto text-xs text-muted-foreground underline"
                      href={generatedUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  )}
                </div>
              </div>
            )}

            {genError && (
              <div className="mt-2 text-sm text-red-500 rounded-md p-2 bg-red-50 border border-red-100">
                {genError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const CreateProjectForm = ({ onCancel }: { onCancel?: () => void }) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { mutate, isPending } = useCreateProject();
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  // local image value tracked so previews don't rely solely on form internals
  const [fieldImageValue, setFieldImageValue] = useState<File | string | null>(
    null
  );

  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    const finalValues = {
      ...values,
      workspaceId,
      image: values.image instanceof File ? values.image : "",
    };

    mutate(
      { form: finalValues },
      {
        onSuccess: ({ data }) => {
          form.reset();
          router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
        },
      }
    );
  };

  // when user picks a file directly
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file, { shouldTouch: true });
      setFieldImageValue(file);
    }
  }

  // used by ImageGenerator child to apply file/url to outer form
  function setFormImageValue(v: File | string | null) {
    if (v instanceof File) {
      form.setValue("image", v, { shouldTouch: true });
      setFieldImageValue(v);
    } else if (typeof v === "string") {
      // If passed a string that is a blob or data url, use it as preview but we must not send string to server
      // Instead keep as string preview and convert to File on Use in generator (we convert earlier).
      form.setValue("image", v, { shouldTouch: true });
      setFieldImageValue(v);
    } else {
      form.setValue("image", "", { shouldTouch: true });
      setFieldImageValue(null);
    }
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new project
        </CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Icon</FormLabel>
                    <FormControl>
                      <ImageGenerator
                        value={
                          fieldImageValue ??
                          (field.value as File | string | null)
                        }
                        setValue={(v) => {
                          // if string (external URL), ImageGenerator converts to File before calling setValue,
                          // but to be safe, we accept both
                          if (v instanceof File) {
                            form.setValue("image", v, { shouldTouch: true });
                            setFieldImageValue(v);
                          } else if (typeof v === "string") {
                            // preview-only; generator will convert to File on Use; still set preview
                            form.setValue("image", v, { shouldTouch: true });
                            setFieldImageValue(v);
                          } else {
                            form.setValue("image", "", { shouldTouch: true });
                            setFieldImageValue(null);
                          }
                        }}
                        setTouched={() => form.trigger("image")}
                        isPending={isPending}
                        initialName={form.getValues("name") || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DottedSeparator className="py-7" />

            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
