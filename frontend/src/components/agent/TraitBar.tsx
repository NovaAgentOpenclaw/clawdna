"use client";

import { cn } from "@/lib/utils";

interface TraitBarProps {
  name: string;
  value: number;
  maxValue?: number;
  color?: string;
  compact?: boolean;
  showValue?: boolean;
  className?: string;
}

export function TraitBar({
  name,
  value,
  maxValue = 100,
  color = "#00F0FF",
  compact = false,
  showValue = true,
  className,
}: TraitBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className={cn(compact ? "space-y-1" : "space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-white/70", compact ? "text-xs" : "text-sm")}>
          {name}
        </span>
        {showValue && (
          <span className={cn("font-medium tabular-nums", compact ? "text-xs" : "text-sm")}>
            {Math.round(value)}
          </span>
        )}
      </div>
      <div className="w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}50`,
          }}
        />
      </div>
    </div>
  );
}

interface CircularTraitProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  className?: string;
}

export function CircularTrait({
  value,
  maxValue = 100,
  size = 80,
  strokeWidth = 6,
  color = "#00F0FF",
  label,
  className,
}: CircularTraitProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              transition: "stroke-dashoffset 0.5s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{Math.round(percentage)}</span>
        </div>
      </div>
      {label && <span className="text-sm text-white/60 mt-2">{label}</span>}
    </div>
  );
}
