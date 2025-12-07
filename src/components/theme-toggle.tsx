"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "p-2 rounded-full transition-all duration-300",
          theme === "light" 
            ? "bg-white text-amber-500 shadow-sm" 
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        )}
      >
        <Sun className="size-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "p-2 rounded-full transition-all duration-300",
          theme === "dark" 
            ? "bg-neutral-950 text-indigo-400 shadow-sm" 
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        )}
      >
        <Moon className="size-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "p-2 rounded-full transition-all duration-300",
          theme === "system" 
            ? "bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm" 
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        )}
      >
        <Monitor className="size-4" />
      </button>
    </div>
  );
}
