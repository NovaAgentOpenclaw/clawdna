"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber } from "@/lib/utils";
import type { Agent } from "@/types";

interface StatsCardProps {
  agent: Agent;
  className?: string;
}

export function StatsCard({ agent, className }: StatsCardProps) {
  const totalTraitValue = agent.traits.reduce((sum, t) => sum + t.value, 0);
  const avgTraitValue = totalTraitValue / agent.traits.length;

  const stats = [
    { label: "Fitness", value: formatNumber(agent.fitness), color: "text-neon-cyan", icon: ZapIcon },
    { label: "Generation", value: `#${agent.generation}`, color: "text-neon-purple", icon: DnaIcon },
    { label: "Traits", value: agent.traits.length, color: "text-neon-green", icon: TraitIcon },
    { label: "Avg Trait", value: Math.round(avgTraitValue), color: "text-neon-yellow", icon: ChartIcon },
  ];

  return (
    <Card className={cn("p-5", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-lg p-4 flex items-center gap-3"
          >
            <div className={cn("w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/50">{stat.label}</p>
              <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Genome Hash</span>
          <span className="font-mono text-white/70">{agent.genome.hash}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-white/50">Mutation Rate</span>
          <Badge variant="purple">{(agent.genome.mutationRate * 100).toFixed(1)}%</Badge>
        </div>
      </div>
    </Card>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function DnaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function TraitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
