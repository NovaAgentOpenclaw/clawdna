"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "cyan" | "purple" | "green";
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "cyan",
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variants = {
    default: "bg-white/20",
    cyan: "bg-neon-cyan",
    purple: "bg-neon-purple",
    green: "bg-neon-green",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-white/10 rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-white/60 mt-1">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}
