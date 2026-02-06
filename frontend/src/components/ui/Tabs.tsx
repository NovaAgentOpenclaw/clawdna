"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-white/5 rounded-lg", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === tab.id
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface FilterTabsProps<T extends string> {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div className={cn("flex gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            value === option.value
              ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
