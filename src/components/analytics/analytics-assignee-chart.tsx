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

interface AnalyticsAssigneeChartProps {
  data: { name: string; value: number }[];
  title: string;
  description?: string;
}

const CustomYAxisTick = ({ 
  x, 
  y, 
  payload,
  isMobile 
}: { 
  x: number; 
  y: number; 
  payload: { value: string };
  isMobile: boolean;
}) => {
  const maxLength = isMobile ? 8 : 12;
  const displayName = payload.value.length > maxLength 
    ? `${payload.value.substring(0, maxLength)}...` 
    : payload.value;
  
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill="hsl(var(--muted-foreground))"
      fontSize={isMobile ? 10 : 12}
    >
      {displayName}
    </text>
  );
};

export const AnalyticsAssigneeChart = ({
  data,
  title,
  description,
}: AnalyticsAssigneeChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, horizontalBarSize, yAxisWidth, fontSize } = useResponsiveChart(containerRef);

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
              layout="vertical"
              margin={{ 
                top: 10, 
                right: isMobile ? 15 : 30, 
                left: isMobile ? 5 : 10, 
                bottom: 10 
              }}
            >
              <defs>
                <linearGradient id="assignee-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(260, 70%, 60%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(280, 80%, 55%)" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={false}
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis 
                type="number" 
                fontSize={fontSize} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={yAxisWidth}
                fontSize={fontSize}
                tickLine={false}
                axisLine={false}
                tick={(props) => <CustomYAxisTick {...props} isMobile={isMobile} />}
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
                formatter={(value: number) => [`${value} tasks`, "Assigned"]}
              />
              <Bar 
                dataKey="value" 
                fill="url(#assignee-gradient)" 
                radius={[0, 6, 6, 0]} 
                barSize={horizontalBarSize}
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
