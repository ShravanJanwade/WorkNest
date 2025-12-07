"use client";

import { useEffect, useState } from "react";
import { QuoteIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Quote {
  q: string;
  a: string;
  h: string;
}

export const QuoteWidget = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch("/api/quote");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuote(data[0]);
        }
      } catch (error) {
        console.error("Failed to load quote", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none shadow-md text-white h-32">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <Skeleton className="h-4 w-3/4 bg-white/20" />
        </CardContent>
      </Card>
    );
  }

  if (!quote) return null;

  return (
    <Card className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none shadow-md text-white relative overflow-hidden">
      <CardContent className="p-6 flex flex-col justify-center h-full relative z-10">
        <div className="flex gap-2 mb-2">
          <QuoteIcon className="size-4 fill-white/50 text-white/50" />
          <p className="font-medium text-lg leading-tight italic">"{quote.q}"</p>
        </div>
        <p className="text-xs font-semibold text-white/80 text-right">- {quote.a}</p>
      </CardContent>
      {}
      <div className="absolute -bottom-4 -right-4 size-24 bg-white/10 rounded-full blur-xl" />
    </Card>
  );
};
