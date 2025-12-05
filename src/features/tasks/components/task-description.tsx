// components/task-description-ai.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { PencilIcon, XIcon, Wand } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTask } from "@/features/tasks/api/use-update-task";
import { Task } from "@/features/tasks/types";

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description || "");
  const { mutate, isPending } = useUpdateTask();

  // Prompt input state (editable by user)
  const defaultPrompt = `Write a clear, concise, professional task description for a Jira-like issue.
Task title: "${task.name}"
Current description: "${task.description || "none"}"
Requirements: 3-6 sentences, include acceptance criteria bullets, friendly professional tone.
Output only the description text.`;

  const [prompt, setPrompt] = useState(defaultPrompt);

  // AI UI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(""); // final text
  const [aiTyped, setAiTyped] = useState(""); // typing animation text shown progressively
  const [aiError, setAiError] = useState<string | null>(null);

  const typingRef = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // reset prompt if task changes (keeping user edits if any)
    setPrompt((prev) => (prev === defaultPrompt ? defaultPrompt : prev));
    // cleanup typing interval on unmount
    return () => {
      if (typingRef.current) {
        window.clearInterval(typingRef.current);
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.$id]);

  const handleSave = () => {
    mutate(
      { json: { description: value }, param: { taskId: task.$id } },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  async function generateWithAI() {
    // Cancel any previous in-flight request/typing
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    if (typingRef.current) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }

    setAiError(null);
    setAiGenerated("");
    setAiTyped("");
    setAiLoading(true);

    const payload = { prompt: (prompt || defaultPrompt).trim() };

    controllerRef.current = new AbortController();
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controllerRef.current.signal,
      });

      const json = await res.json();
      if (!res.ok || json?.error) {
        setAiError(json?.error || "Failed to generate description");
        setAiLoading(false);
        return;
      }

      const text = String(json.text || "");
      setAiGenerated(text);

      // Typing animation: character-by-character
      let i = 0;
      const speed = Math.max(
        12,
        Math.round(22 - Math.min(12, text.length / 40))
      ); // tuned speed
      setAiTyped("");
      typingRef.current = window.setInterval(() => {
        i++;
        setAiTyped(text.slice(0, i));
        if (i >= text.length) {
          if (typingRef.current) {
            clearInterval(typingRef.current);
          }
          typingRef.current = null;
          setAiLoading(false);
        }
      }, speed);
    } catch (err: unknown) {
      if ((err as DOMException)?.name === "AbortError") {
        setAiError("Request aborted.");
      } else if (err instanceof Error) {
        setAiError(err.message);
      } else {
        setAiError("Unknown error");
      }
      setAiLoading(false);
    } finally {
      controllerRef.current = null;
    }
  }

  function pasteIntoDescription() {
    const toPaste = aiGenerated || aiTyped;
    setValue((prev) => (prev ? `${prev}\n\n${toPaste}` : toPaste));
  }

  function clearAI() {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setAiGenerated("");
    setAiTyped("");
    setAiLoading(false);
    setAiError(null);
  }

  const showPreview = Boolean(aiTyped || aiGenerated);

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-white via-slate-50 to-white border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold tracking-tight">Overview</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Describe the task and acceptance criteria.
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            onClick={() => {
              setIsEditing((prev) => !prev);
              // reset AI UI when toggling
              clearAI();
              setAiError(null);
            }}
            size="sm"
            variant="secondary"
          >
            {isEditing ? (
              <XIcon className="size-4 mr-2" />
            ) : (
              <PencilIcon className="size-4 mr-2" />
            )}
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      <DottedSeparator className="my-4" />

      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description..."
            value={value}
            rows={6}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
          />

          {/* Prompt input */}
          <div className="bg-slate-50 border rounded-lg p-3">
            <label className="text-sm font-medium text-slate-700">
              AI prompt
            </label>
            <textarea
              className="w-full mt-2 p-3 text-sm rounded-md border border-slate-200 focus:ring-2 focus:ring-slate-300 focus:outline-none resize-none"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write a clear prompt for the AI..."
            />
            <div className="mt-2 flex items-center gap-x-3">
              <Button
                size="sm"
                onClick={generateWithAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-2"
              >
                <Wand className="size-4" />
                {aiLoading ? "Generating…" : "Generate with AI"}
              </Button>

              <Button
                size="sm"
                onClick={() => setPrompt(defaultPrompt)}
                variant="ghost"
              >
                Reset prompt
              </Button>

              <div className="ml-auto text-xs text-muted-foreground">
                {prompt.length} chars
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-3">
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {value ? `${value.length} chars` : "0 chars"}
            </div>
          </div>

          {/* AI response area */}
          <div className="mt-2">
            {aiLoading && (
              <div className="p-4 rounded-lg border border-slate-100 overflow-hidden bg-gradient-to-r from-white to-slate-50">
                {/* Animated Gemini-like skeleton */}
                <div className="space-y-3">
                  <div className="h-4 rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-[pulse_1.6s_ease-in-out_infinite]" />
                  <div className="h-3 rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-[pulse_1.6s_ease-in-out_infinite] w-11/12" />
                  <div className="h-3 rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-[pulse_1.6s_ease-in-out_infinite] w-10/12" />
                  <div className="h-3 rounded-lg bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-[pulse_1.6s_ease-in-out_infinite] w-9/12" />
                </div>
                <div className="mt-3 flex items-center gap-x-2">
                  <div className="text-xs text-muted-foreground">
                    Generating with Gemini…
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">•</div>
                </div>
              </div>
            )}

            {!aiLoading && showPreview && (
              <div className="p-4 rounded-lg border bg-white">
                <div className="prose max-w-none whitespace-pre-wrap text-sm text-slate-900">
                  {aiTyped || aiGenerated}
                </div>

                <div className="flex items-center gap-x-2 mt-3">
                  <Button size="sm" onClick={pasteIntoDescription}>
                    Paste into description
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearAI}>
                    Clear
                  </Button>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {aiGenerated
                      ? `${aiGenerated.length} chars`
                      : `${aiTyped.length} chars`}
                  </div>
                </div>
              </div>
            )}

            {aiError && (
              <div className="text-red-500 text-sm mt-2 rounded-md p-2 bg-red-50 border border-red-100">
                {aiError}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {task.description ? (
            <div className="prose max-w-none whitespace-pre-wrap text-slate-800">
              {task.description}
            </div>
          ) : (
            <span className="text-muted-foreground">No description</span>
          )}
        </div>
      )}
    </div>
  );
};
