"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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

import { updateProjectSchema } from "../schemas";
import { Project } from "../types";
import { useUpdateProject } from "../api/use-update-project";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProject } from "../api/use-delete-project";

interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues: Project;
}

function b64ToBlob(b64: string, mime = "image/png") {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

function b64ToFile(b64: string, filename = "ai-generated.png", mime = "image/png") {
  const blob = b64ToBlob(b64, mime);
  return new File([blob], filename, { type: mime });
}

function ImageGenerator({
  fieldValue,
  onFilePicked,
  onSetImageValue,
  isPending,
  initialName,
}: {
  fieldValue: File | string | null | undefined;
  onFilePicked: (file: File) => void;
  onSetImageValue: (urlOrFile: string | File | null) => void;
  isPending: boolean;
  initialName?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isGenOpen, setIsGenOpen] = useState(false);
  const [genPrompt, setGenPrompt] = useState(
    `Generate a clean, modern project icon for a project named "${initialName}". Minimal, flat, single-color background, simple symbol that hints at collaboration and tasks. Square composition.`,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedB64, setGeneratedB64] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
      }
    };
  }, [objectPreviewUrl]);

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

      if (json.pending && json.url) {
        setGeneratedUrl(json.url);
        setIsGenerating(false);
        return;
      }

      if (json.uploaded?.url) {
        setGeneratedUrl(json.uploaded.url);
        setIsGenerating(false);
        return;
      }

      if (json.b64) {
        setGeneratedB64(String(json.b64));

        try {
          const blob = b64ToBlob(String(json.b64));
          const url = URL.createObjectURL(blob);
          setObjectPreviewUrl(url);
          setGeneratedUrl(url);
        } catch {
          setObjectPreviewUrl(null);
          setGeneratedUrl(null);
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

  async function handleAcceptGenerated() {
    if (generatedUrl && /^https?:\/\//.test(generatedUrl)) {
      onSetImageValue(generatedUrl);
      setIsGenOpen(false);
      return;
    }

    if (generatedB64) {
      const file = b64ToFile(generatedB64, `${initialName || "project"}-ai.png`);
      onSetImageValue(file);
      setIsGenOpen(false);
      return;
    }

    if (objectPreviewUrl) {
      try {
        const resp = await fetch(objectPreviewUrl);
        const blob = await resp.blob();
        const file = new File([blob], `${initialName || "project"}-ai.png`, {
          type: blob.type || "image/png",
        });
        onSetImageValue(file);
      } catch {
        setGenError("Unable to convert preview to file. Try regenerating.");
      } finally {
        setIsGenOpen(false);
      }
      return;
    }

    setGenError("No generated image to accept");
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      onFilePicked(f);
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center gap-x-4">
        <div className="w-[72px] h-[72px] rounded-md overflow-hidden bg-neutral-50 border flex items-center justify-center">
          {fieldValue instanceof File ? (
            <img
              src={URL.createObjectURL(fieldValue)}
              alt="preview"
              className="object-cover w-full h-full"
            />
          ) : fieldValue ? (
            <img src={String(fieldValue)} alt="preview" className="object-cover w-full h-full" />
          ) : generatedB64 ? (
            <img
              src={`data:image/png;base64,${generatedB64}`}
              alt="preview"
              className="object-cover w-full h-full"
            />
          ) : generatedUrl ? (
            <img src={generatedUrl} alt="preview" className="object-cover w-full h-full" />
          ) : (
            <div className="text-neutral-400 flex items-center justify-center">
              <ImageIcon className="w-7 h-7" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{initialName || "Project Icon"}</div>
          <div className="text-xs text-muted-foreground mt-1">
            JPG, PNG, SVG or JPEG — recommended 1:1, max 1MB
          </div>

          <div className="flex items-center gap-x-2 mt-3">
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.png,.jpeg,.svg"
              onChange={handleFileInputChange}
              className="hidden"
              id="project-image-input"
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
              type="button"
              onClick={() => setIsGenOpen((s) => !s)}
              disabled={isPending}
            >
              Generate with AI
            </Button>

            {fieldValue ? (
              <Button
                size="xs"
                variant="destructive"
                type="button"
                onClick={() => onSetImageValue(null)}
                disabled={isPending}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isGenOpen && (
        <div className="mt-2 p-4 rounded-lg border bg-white shadow-sm">
          <label className="block text-sm font-semibold mb-2">Image prompt</label>
          <textarea
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-300 focus:outline-none text-sm resize-none"
            placeholder="Describe the icon or image you want..."
          />

          <div className="mt-3 flex items-center gap-x-3">
            <Button size="sm" type="button" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating…" : "Generate Image"}
            </Button>

            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => {
                setIsGenOpen(false);
                setGeneratedB64(null);
                setGeneratedUrl(null);
                setGenError(null);
              }}
            >
              Close
            </Button>

            <div className="ml-auto text-xs text-muted-foreground">{genPrompt.length} chars</div>
          </div>

          <div className="mt-4">
            {isGenerating && (
              <div className="rounded-lg border p-4 bg-gradient-to-r from-white to-slate-50 overflow-hidden">
                <div className="h-40 w-full rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse" />
                <div className="mt-3 text-xs text-muted-foreground">Generating image…</div>
              </div>
            )}

            {!isGenerating && (generatedB64 || generatedUrl) && (
              <div className="flex flex-col gap-y-3">
                <div className="relative w-48 h-48 rounded-md overflow-hidden border">
                  {generatedB64 ? (
                    <img
                      src={`data:image/png;base64,${generatedB64}`}
                      alt="generated preview"
                      className="object-cover w-full h-full"
                    />
                  ) : generatedUrl ? (
                    <img
                      src={generatedUrl}
                      alt="generated preview"
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                </div>

                <div className="flex gap-x-2">
                  <Button size="sm" type="button" onClick={handleAcceptGenerated}>
                    Use Image
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setGeneratedB64(null);
                      setGeneratedUrl(null);
                    }}
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

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeletingProject } = useDeleteProject();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone.",
    "destructive",
  );

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",
    },
  });

  const [fieldImageValue, setFieldImageValue] = useState<File | string | null>(() => {
    return initialValues.imageUrl ?? null;
  });

  const createdObjectUrls = useRef<string[]>([]);
  useEffect(() => {
    return () => {
      createdObjectUrls.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, []);

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteProject(
      { param: { projectId: initialValues.$id } },
      {
        onSuccess: () => {
          window.location.href = `/workspaces/${initialValues.workspaceId}`;
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    const finalValues = {
      ...values,
      image:
        values.image instanceof File
          ? values.image
          : typeof values.image === "string"
            ? values.image
            : "",
    };

    mutate({ form: finalValues, param: { projectId: initialValues.$id } });
  };

  const handleImageChange = (file: File) => {
    setFieldImageValue(file);
    form.setValue("image", file, { shouldTouch: true });
  };

  function handleSetImageValue(urlOrFile: string | File | null) {
    if (!urlOrFile) {
      setFieldImageValue(null);
      form.setValue("image", "", { shouldTouch: true });
      return;
    }

    if (typeof urlOrFile === "string") {
      if (urlOrFile.startsWith("blob:")) {
        createdObjectUrls.current.push(urlOrFile);
      }
      setFieldImageValue(urlOrFile);
      form.setValue("image", urlOrFile, { shouldTouch: true });
    } else {
      setFieldImageValue(urlOrFile);
      form.setValue("image", urlOrFile, { shouldTouch: true });
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={
              onCancel
                ? onCancel
                : () =>
                    router.push(
                      `/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`,
                    )
            }
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">{initialValues.name}</CardTitle>
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  render={() => (
                    <FormItem>
                      <FormLabel>Project Icon</FormLabel>
                      <FormControl>
                        <ImageGenerator
                          fieldValue={fieldImageValue}
                          onFilePicked={handleImageChange}
                          onSetImageValue={handleSetImageValue}
                          isPending={isPending}
                          initialName={initialValues.name}
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
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a project is irreversible and will remove all associated data.
            </p>
            <DottedSeparator className="py-7" />
            <Button
              className="mt-6 w-fit ml-auto"
              size="sm"
              variant="destructive"
              type="button"
              disabled={isPending || isDeletingProject}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
