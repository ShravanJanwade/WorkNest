"use client";

import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface EditorProps {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  className?: string;
  preview?: "live" | "edit" | "preview";
  height?: number;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export const Editor = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  preview = "edit",
  height = 200,
  disabled,
  onImageUpload
}: EditorProps) => {
  const { theme } = useTheme();

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!onImageUpload) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") === 0) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            const url = await onImageUpload(file);
            const imageMarkdown = `![${file.name}](${url})`;
            onChange?.((value || "") + imageMarkdown);
          } catch (error) {
            console.error("Image upload failed:", error);
          }
        }
      }
    }
  };

  return (
    <div 
      className={cn("w-full border rounded-md overflow-hidden", className, disabled && "opacity-50 pointer-events-none")}
      onPaste={handlePaste}
    >
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        textareaProps={{
          placeholder: placeholder
        }}
        data-color-mode={theme === "dark" ? "dark" : "light"}
        className="!border-none !shadow-none"
      />
    </div>
  );
};

