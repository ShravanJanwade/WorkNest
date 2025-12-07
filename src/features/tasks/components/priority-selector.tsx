"use client";

import { ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskPriority } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrioritySelectorProps {
  value?: TaskPriority;
  onChange: (value: TaskPriority) => void;
  disabled?: boolean;
  className?: string;
}

const priorityConfig = {
  [TaskPriority.HIGHEST]: {
    label: "Highest",
    icon: ChevronsUp,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
  },
  [TaskPriority.HIGH]: {
    label: "High",
    icon: ChevronUp,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
  },
  [TaskPriority.MEDIUM]: {
    label: "Medium",
    icon: Minus,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
  },
  [TaskPriority.LOW]: {
    label: "Low",
    icon: ChevronDown,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  [TaskPriority.LOWEST]: {
    label: "Lowest",
    icon: ChevronsDown,
    color: "text-gray-400",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
  },
};

export const PrioritySelector = ({
  value,
  onChange,
  disabled,
  className,
}: PrioritySelectorProps) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as TaskPriority)}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="Select priority">
          {value && (
            <div className="flex items-center gap-2">
              <PriorityIcon priority={value} />
              <span>{priorityConfig[value].label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(priorityConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span>{config.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

interface PriorityIconProps {
  priority: TaskPriority;
  className?: string;
  showLabel?: boolean;
}

export const PriorityIcon = ({ priority, className, showLabel = false }: PriorityIconProps) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("flex items-center justify-center w-5 h-5 rounded", config.bgColor)}>
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
      </div>
      {showLabel && <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>}
    </div>
  );
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.bgColor,
        config.borderColor,
        config.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
};

export { priorityConfig };
