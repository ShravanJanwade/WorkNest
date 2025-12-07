"use client";

import { useRef } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useResponsiveChart, PIE_COLORS } from "@/hooks/use-responsive-chart";

interface AnalyticsPieChartProps {
  data: { name: string; value: number }[];
  title: string;
  description?: string;
}

const renderCustomLabel = ({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent,
  name 
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  if (percent < 0.05) return null; // Don't show labels for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 px-2">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div 
            className="w-2.5 h-2.5 rounded-full shrink-0" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsPieChart = ({ data, title, description }: AnalyticsPieChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet, pieOuterRadius, pieInnerRadius } = useResponsiveChart(containerRef);

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
            <PieChart>
              <defs>
                {PIE_COLORS.map((color, index) => (
                  <linearGradient
                    key={`pie-gradient-${index}`}
                    id={`pie-gradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy={isMobile ? "45%" : "50%"}
                outerRadius={pieOuterRadius}
                innerRadius={pieInnerRadius}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                label={!isMobile && !isTablet ? renderCustomLabel : undefined}
                labelLine={!isMobile && !isTablet}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#pie-gradient-${index % PIE_COLORS.length})`}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
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
                }}
                itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(value: number, name: string) => [
                  `${value} tasks`,
                  name
                ]}
              />
              <Legend 
                content={<CustomLegend />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
