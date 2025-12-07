"use client";

import { useState } from "react";
import { SearchIcon, ExternalLinkIcon, Sparkles, Loader2, ArrowRight } from "lucide-react";

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
        <Button 
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-md transition-all duration-300 group"
        >
            <Sparkles className="size-4 mr-2 fill-white text-white group-hover:animate-pulse" />
            Solution Finder
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[30%] sm:max-w-md !max-w-none p-0 flex flex-col bg-neutral-50/50 backdrop-blur-xl">
        <SheetHeader className="p-6 pb-4 border-b bg-white">
          <SheetTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
            <Sparkles className="size-5 text-amber-500 fill-amber-500" />
            Solution Finder
          </SheetTitle>
          <SheetDescription>
            Search specifically for development solutions and fixes.
          </SheetDescription>
        </SheetHeader>
        
        <div className="p-6 bg-white shadow-sm z-10">
            <div className="flex gap-2 relative">
                <SearchIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search error message or topic..." 
                    className="pl-9 bg-neutral-50 border-neutral-200 focus-visible:ring-amber-500 transition-all font-medium"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button size="icon" onClick={handleSearch} disabled={loading} className="shrink-0 bg-amber-600 hover:bg-amber-700">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                </Button>
            </div>
        </div>

        <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
                 {results.length === 0 && !hasSearched && (
                     <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4 opacity-70">
                        <div className="size-20 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                             <Sparkles className="size-10 text-amber-500" />
                        </div>
                        <div>
                             <h3 className="font-semibold text-lg text-neutral-900">Ready to help</h3>
                             <p className="text-sm text-neutral-500 max-w-[200px] mx-auto mt-1">
                                 Enter an error message or generic query to find immediate solutions.
                             </p>
                        </div>
                     </div>
                 )}

                 {results.length === 0 && hasSearched && !loading && (
                     <div className="text-center py-12">
                        <p className="text-muted-foreground">No results found for your query.</p>
                     </div>
                 )}

                {results.map((item) => (
                    <div key={item.link} className="group flex flex-col gap-2 p-4 border border-neutral-200 bg-white rounded-xl hover:shadow-lg hover:border-amber-200 transition-all duration-300 cursor-pointer" onClick={() => window.open(item.link, '_blank')}>
                        <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-sm text-neutral-900 leading-tight group-hover:text-amber-700 transition-colors">
                                {item.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                            </h4>
                            <ExternalLinkIcon className="size-4 text-neutral-400 group-hover:text-amber-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        
                        <Separator className="bg-neutral-100" />
                        
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={item.is_answered ? "default" : "secondary"} className={item.is_answered ? "bg-green-600 hover:bg-green-700" : ""}>
                                {item.is_answered ? "Solved" : "Open"}
                            </Badge>
                             <span className="text-xs font-medium text-neutral-500">Votes: {item.score}</span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
