"use client";

import { useState } from "react";
import { SearchIcon, ExternalLinkIcon, LightbulbIcon, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      // Using StackExchange API (Public)
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&site=stackoverflow&intitle=${encodedQuery}&pagesize=3`;
      
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
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
            <LightbulbIcon className="size-5 text-yellow-500" />
            Solution Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
            <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search StackOverflow..." 
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button size="icon" onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
            </Button>
        </div>

        <div className="space-y-3">
             {results.length === 0 && hasSearched && !loading && (
                 <p className="text-sm text-center text-muted-foreground py-4">No results found.</p>
             )}
              {results.length === 0 && !hasSearched && (
                 <p className="text-sm text-center text-muted-foreground py-4">Search for a bug or topic to find solutions.</p>
             )}

            {results.map((item) => (
                <div key={item.link} className="flex flex-col gap-1 p-3 border rounded-md hover:bg-neutral-50 transition">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:underline line-clamp-2">
                        {item.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                    </a>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={item.is_answered ? "secondary" : "outline"} className="text-[10px] px-1 py-0 h-5">
                            {item.is_answered ? "Answered" : "Open"}
                        </Badge>
                         <span className="text-[10px] text-muted-foreground">Score: {item.score}</span>
                         <ExternalLinkIcon className="size-3 text-muted-foreground ml-auto" />
                    </div>
                </div>
            ))}
        </div>
        <div className="flex justify-center">
            <p className="text-[10px] text-muted-foreground">Powered by Stack Exchange</p>
        </div>
      </CardContent>
    </Card>
  );
};
