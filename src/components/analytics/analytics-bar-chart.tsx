"use client";

import { useRef } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useResponsiveChart, CHART_GRADIENT_COLORS } from "@/hooks/use-responsive-chart";

interface AnalyticsBarChartProps {
  data: { name: string; value: number }[];
  title: string;
  description?: string;
}

export const AnalyticsBarChart = ({ data, title, description }: AnalyticsBarChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, barSize, fontSize } = useResponsiveChart(containerRef);

  return (
    <Card className="w-full h-full border-none shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div 
          ref={containerRef} 
          className="h-[250px] sm:h-[300px] lg:h-[320px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ 
                top: 10, 
                right: isMobile ? 10 : 20, 
                left: isMobile ? -10 : 0, 
                bottom: isMobile ? 40 : 20 
              }}
            >
              <defs>
                {CHART_GRADIENT_COLORS.map((color, index) => (
                  <linearGradient
                    key={color.id}
                    id={color.id}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color.start} stopOpacity={1} />
                    <stop offset="100%" stopColor={color.end} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey="name" 
                fontSize={fontSize} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                interval={0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 60 : 30}
              />
              <YAxis 
                fontSize={fontSize} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.3 }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  backdropFilter: "blur(8px)",
                  backgroundColor: "hsl(var(--background) / 0.95)",
                  padding: "8px 12px",
                }}
                labelStyle={{ 
                  color: "hsl(var(--foreground))",
                  fontWeight: 600,
                  marginBottom: "4px"
                }}
                itemStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]} 
                barSize={barSize}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#${CHART_GRADIENT_COLORS[index % CHART_GRADIENT_COLORS.length].id})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
