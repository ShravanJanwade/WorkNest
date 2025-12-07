"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ResponsiveChartDimensions {
  containerWidth: number;
  containerHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  // Pie/Donut chart dimensions
  pieOuterRadius: number;
  pieInnerRadius: number;
  // Bar chart dimensions
  barSize: number;
  horizontalBarSize: number;
  // Axis dimensions
  yAxisWidth: number;
  fontSize: number;
  // Legend
  legendPosition: "bottom" | "right";
}

export function useResponsiveChart(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState<ResponsiveChartDimensions>({
    containerWidth: 400,
    containerHeight: 300,
    isMobile: false,
    isTablet: false,
    pieOuterRadius: 100,
    pieInnerRadius: 60,
    barSize: 32,
    horizontalBarSize: 20,
    yAxisWidth: 100,
    fontSize: 12,
    legendPosition: "right",
  });

  const calculateDimensions = useCallback((width: number, height: number): ResponsiveChartDimensions => {
    const isMobile = width < 480;
    const isTablet = width >= 480 && width < 768;
    
    // Calculate pie chart radius based on smaller dimension
    const minDimension = Math.min(width, height);
    const pieOuterRadius = isMobile 
      ? Math.min(minDimension * 0.35, 70) 
      : isTablet 
        ? Math.min(minDimension * 0.38, 90)
        : Math.min(minDimension * 0.4, 120);
    
    const pieInnerRadius = pieOuterRadius * 0.55;

    // Bar sizes
    const barSize = isMobile ? 20 : isTablet ? 28 : 36;
    const horizontalBarSize = isMobile ? 14 : isTablet ? 18 : 22;

    // Y-axis width for horizontal bar charts
    const yAxisWidth = isMobile ? 60 : isTablet ? 80 : 100;

    // Font sizes
    const fontSize = isMobile ? 10 : 12;

    // Legend position
    const legendPosition = isMobile ? "bottom" : "right";

    return {
      containerWidth: width,
      containerHeight: height,
      isMobile,
      isTablet,
      pieOuterRadius,
      pieInnerRadius,
      barSize,
      horizontalBarSize,
      yAxisWidth,
      fontSize,
      legendPosition,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions(calculateDimensions(width, height));
      }
    });

    resizeObserver.observe(container);
    
    // Initial measurement
    const { width, height } = container.getBoundingClientRect();
    setDimensions(calculateDimensions(width, height));

    return () => resizeObserver.disconnect();
  }, [containerRef, calculateDimensions]);

  return dimensions;
}

// Premium color palette with gradients
export const PREMIUM_COLORS = {
  primary: ["hsl(220, 70%, 50%)", "hsl(220, 70%, 60%)"],
  secondary: ["hsl(160, 60%, 45%)", "hsl(160, 60%, 55%)"],
  tertiary: ["hsl(30, 80%, 55%)", "hsl(30, 80%, 65%)"],
  quaternary: ["hsl(280, 65%, 60%)", "hsl(280, 65%, 70%)"],
  quinary: ["hsl(340, 75%, 55%)", "hsl(340, 75%, 65%)"],
};

export const CHART_GRADIENT_COLORS = [
  { id: "gradient-1", start: "hsl(220, 70%, 55%)", end: "hsl(200, 80%, 45%)" },
  { id: "gradient-2", start: "hsl(160, 60%, 50%)", end: "hsl(140, 70%, 40%)" },
  { id: "gradient-3", start: "hsl(30, 80%, 60%)", end: "hsl(15, 90%, 50%)" },
  { id: "gradient-4", start: "hsl(280, 65%, 65%)", end: "hsl(260, 75%, 55%)" },
  { id: "gradient-5", start: "hsl(340, 75%, 60%)", end: "hsl(320, 85%, 50%)" },
];

export const PIE_COLORS = [
  "hsl(220, 70%, 55%)",
  "hsl(160, 60%, 50%)",
  "hsl(30, 80%, 60%)",
  "hsl(280, 65%, 65%)",
  "hsl(340, 75%, 60%)",
  "hsl(45, 85%, 55%)",
  "hsl(190, 70%, 50%)",
];
