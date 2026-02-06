"use client";

import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "outline";
  hover?: boolean;
}

export function Card({
  children,
  variant = "glass",
  hover = true,
  className,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-card",
    glass: "glass-card",
    outline: "border border-white/10 bg-transparent",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-6",
        variants[variant],
        hover && "transition-all duration-300 hover:border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cn("text-lg font-semibold text-white", className)}>{children}</h3>;
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mt-4 pt-4 border-t border-white/10", className)}>{children}</div>;
}

