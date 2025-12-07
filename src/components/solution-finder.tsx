"use client";

import { useState } from "react";
import { SearchIcon, ExternalLinkIcon, Sparkles, Loader2, ArrowRight, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface StackOverflowItem {
  title: string;
  link: string;
  is_answered: boolean;
  score: number;
}

interface SolutionFinderProps {
  defaultQuery?: string;
}

export const SolutionFinder = ({ defaultQuery = "" }: SolutionFinderProps) => {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<StackOverflowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&site=stackoverflow&intitle=${encodedQuery}&pagesize=5`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        setResults(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch solutions", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-md transition-all duration-300 group">
          <Sparkles className="size-4 mr-2 fill-white text-white group-hover:animate-pulse" />
          Solution Finder
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[30%] sm:max-w-md !max-w-none p-0 flex flex-col bg-background border-l border-border shadow-2xl">
        <SheetHeader className="p-6 pb-4 border-b border-border bg-card/50 backdrop-blur-sm relative">
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-full transition-colors"
            >
              <X className="size-4 text-muted-foreground" />
            </Button>
          </SheetClose>
          <SheetTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent font-bold pt-2">
            <Sparkles className="size-5 text-amber-500 fill-amber-500" />
            Solution Finder
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Search specifically for development solutions and fixes.
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 bg-card border-b border-border z-10">
          <div className="flex gap-2 relative">
            <SearchIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search error message or topic..."
              className="pl-9 bg-muted/50 border-input focus-visible:ring-amber-500 transition-all font-medium placeholder:text-muted-foreground/70"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            <Button
              size="icon"
              onClick={handleSearch}
              disabled={loading}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6 bg-muted/10">
          <div className="space-y-4">
            {results.length === 0 && !hasSearched && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6 opacity-80">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative size-24 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center border border-amber-200/50 dark:border-amber-700/50 shadow-inner">
                    <Sparkles className="size-10 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
                <div className="space-y-2 max-w-[250px]">
                  <h3 className="font-semibold text-xl text-foreground">Ready to help</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enter an error message or generic query to find immediate solutions.
                  </p>
                </div>
              </div>
            )}

            {results.length === 0 && hasSearched && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <SearchIcon className="size-8 text-muted-foreground/50" />
                </div>
                <p>No results found for your query.</p>
              </div>
            )}

            {results.map((item) => (
              <div
                key={item.link}
                className="group flex flex-col gap-3 p-4 border border-border bg-card rounded-xl hover:shadow-lg hover:border-amber-500/30 hover:scale-[1.01] transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => window.open(item.link, "_blank")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                <div className="flex items-start justify-between gap-3 relative">
                  <h4 className="font-semibold text-sm text-foreground leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                  </h4>
                  <ExternalLinkIcon className="size-4 text-muted-foreground group-hover:text-amber-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2" />
                </div>

                <Separator />

                <div className="flex items-center justify-between mt-1 relative">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={item.is_answered ? "default" : "secondary"}
                      className={
                        item.is_answered
                          ? "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/20 border-emerald-600/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {item.is_answered ? "Solved" : "Open"}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <span className="font-bold text-foreground">{item.score}</span> votes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
