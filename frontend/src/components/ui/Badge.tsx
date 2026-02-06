"use client";

import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "cyan" | "purple" | "green" | "yellow";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-white/80",
    cyan: "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30",
    purple: "bg-neon-purple/20 text-neon-purple border border-neon-purple/30",
    green: "bg-neon-green/20 text-neon-green border border-neon-green/30",
    yellow: "bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
