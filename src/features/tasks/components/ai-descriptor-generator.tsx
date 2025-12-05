"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Copy, Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";

interface AIDescriptionGeneratorProps {
  taskName: string;
  taskTitle?: string;
  onDescriptionGenerated: (description: string) => void;
}

export const AIDescriptionGenerator = ({
  taskName,
  taskTitle,
  onDescriptionGenerated,
}: AIDescriptionGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [displayedDescription, setDisplayedDescription] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const streamingTimeoutRef = useRef<NodeJS.Timeout>();

  // Character-by-character streaming effect
  useEffect(() => {
    if (!generatedDescription) return;

    if (displayedDescription.length < generatedDescription.length) {
      streamingTimeoutRef.current = setTimeout(() => {
        setDisplayedDescription(
          generatedDescription.slice(0, displayedDescription.length + 1)
        );
      }, 15); // Adjust speed here (lower = faster)
    } else if (displayedDescription.length === generatedDescription.length) {
      setIsFinished(true);
    }

    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, [displayedDescription, generatedDescription]);

  const generateDescription = async () => {
    setIsGenerating(true);
    setGeneratedDescription("");
    setDisplayedDescription("");
    setIsFinished(false);

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName, taskTitle }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setGeneratedDescription(fullText);
      }
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedDescription);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePaste = () => {
    onDescriptionGenerated(displayedDescription);
  };

  return (
    <div className="w-full space-y-4">
      {/* Generate Button */}
      {!generatedDescription && (
        <Button
          onClick={generateDescription}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transition-all duration-200 h-11"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Description with AI
            </>
          )}
        </Button>
      )}

      {/* Loading Skeleton */}
      {isGenerating && !generatedDescription && (
        <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Gemini AI is crafting your description...
            </span>
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse`}
                style={{
                  width: `${85 - i * 15}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Content */}
      {displayedDescription && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 mt-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-h-20">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {displayedDescription}
                  {!isFinished && (
                    <span className="inline-block w-2 h-5 ml-1 bg-blue-500 animate-pulse rounded-sm"></span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <DottedSeparator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1 h-10 border-slate-300 dark:border-slate-600 bg-transparent"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handlePaste}
              disabled={!isFinished}
              className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
            >
              Paste to Description
            </Button>
          </div>

          {/* Reset Option */}
          {isFinished && (
            <Button
              onClick={() => {
                setGeneratedDescription("");
                setDisplayedDescription("");
                setIsFinished(false);
              }}
              variant="secondary"
              className="w-full h-10"
            >
              Generate Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
