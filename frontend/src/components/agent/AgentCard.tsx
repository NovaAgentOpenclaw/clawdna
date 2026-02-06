"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TraitBar } from "./TraitBar";
import { cn, formatNumber, truncateId } from "@/lib/utils";
import type { Agent } from "@/types";

interface AgentCardProps {
  agent: Agent;
  variant?: "default" | "compact" | "detailed";
  isSelected?: boolean;
  onSelect?: () => void;
  showActions?: boolean;
}

export function AgentCard({
  agent,
  variant = "default",
  isSelected = false,
  onSelect,
  showActions = true,
}: AgentCardProps) {
  const primaryTrait = agent.traits.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  );

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all",
          isSelected && "ring-2 ring-neon-cyan border-neon-cyan/50"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 flex items-center justify-center text-lg">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">{agent.name}</h4>
            <p className="text-xs text-white/50">Gen {agent.generation}</p>
          </div>
          <Badge variant="cyan">{formatNumber(agent.fitness)}</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden group", isSelected && "ring-2 ring-neon-cyan")}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/30 via-neon-purple/30 to-neon-green/30 flex items-center justify-center text-2xl shadow-neon-cyan">
                🤖
              </div>
              <div>
                <Link href={`/agent/${agent.id}`}>
                  <h3 className="font-semibold text-white hover:text-neon-cyan transition-colors">
                    {agent.name}
                  </h3>
                </Link>
                <p className="text-xs text-white/50 font-mono">{truncateId(agent.genome.hash)}</p>
              </div>
            </div>
            <Badge variant={primaryTrait.category === "cognitive" ? "cyan" : primaryTrait.category === "physical" ? "green" : "purple"}>
              {primaryTrait.name}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="glass rounded-lg p-3">
              <p className="text-xs text-white/50 mb-1">Fitness</p>
              <p className="text-xl font-bold text-neon-cyan">{formatNumber(agent.fitness)}</p>
            </div>
            <div className="glass rounded-lg p-3">
              <p className="text-xs text-white/50 mb-1">Generation</p>
              <p className="text-xl font-bold text-neon-purple">#{agent.generation}</p>
            </div>
          </div>

          {/* Traits */}
          <div className="space-y-2">
            {agent.traits.slice(0, 3).map((trait) => (
              <TraitBar
                key={trait.id}
                name={trait.name}
                value={trait.value}
                maxValue={trait.maxValue}
                color={trait.color}
                compact
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        {showActions && (
          <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
            <Link
              href={`/agent/${agent.id}`}
              className="text-sm text-neon-cyan hover:text-white transition-colors"
            >
              View Details →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
