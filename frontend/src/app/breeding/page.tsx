"use client";

import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { AgentCard } from "@/components/agent/AgentCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useBreeding } from "@/hooks/useBreeding";
import { useAgents } from "@/hooks/useAgents";
import { cn, calculateCompatibility, formatNumber } from "@/lib/utils";
import type { Agent } from "@/types";

export default function BreedingPage() {
  const { agents } = useAgents();
  const {
    parent1,
    parent2,
    canBreed,
    isBreeding,
    result,
    selectParent,
    clearParent,
    breed,
    reset,
  } = useBreeding();

  const compatibility = parent1 && parent2 
    ? calculateCompatibility(parent1, parent2) 
    : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Breeding Lab"
        subtitle="Select two parent agents to create offspring with combined traits"
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Parent Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Parent 1 Slot */}
            <ParentSlot
              label="Parent 1"
              agent={parent1}
              onClear={() => clearParent(1)}
            />

            {/* Parent 2 Slot */}
            <ParentSlot
              label="Parent 2"
              agent={parent2}
              onClear={() => clearParent(2)}
            />
          </div>

          {/* Compatibility */}
          {parent1 && parent2 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/70">Genetic Compatibility</span>
                <span className={cn(
                  "text-2xl font-bold",
                  compatibility >= 70 ? "text-neon-green" : compatibility >= 40 ? "text-neon-yellow" : "text-red-400"
                )}>
                  {compatibility}%
                </span>
              </div>
              <Progress
                value={compatibility}
                max={100}
                size="lg"
                variant={compatibility >= 70 ? "green" : compatibility >= 40 ? "default" : "default"}
              />
              <p className="text-sm text-white/50 mt-3">
                {compatibility >= 70 
                  ? "Excellent match! High probability of producing elite offspring."
                  : compatibility >= 40
                  ? "Moderate compatibility. Some traits may complement each other."
                  : "Low compatibility. Results may be unpredictable."}
              </p>
            </Card>
          )}

          {/* Breed Button */}
          <Button
            onClick={breed}
            isLoading={isBreeding}
            disabled={!canBreed || isBreeding}
            size="lg"
            className="w-full"
          >
            {isBreeding ? "Breeding..." : "Breed New Agent"}
          </Button>

          {/* Result */}
          {result && (
            <Card className="p-6 border-neon-green/30 glow-green">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neon-green">New Agent Created!</h3>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Breed Again
                </Button>
              </div>
              <AgentCard agent={result} variant="detailed" showActions={false} />
            </Card>
          )}
        </div>

        {/* Agent Selection Panel */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-[600px] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Select Parents</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {agents.map((agent) => {
                const isSelected = parent1?.id === agent.id || parent2?.id === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      if (!parent1) selectParent(agent, 1);
                      else if (!parent2 && parent1.id !== agent.id) selectParent(agent, 2);
                    }}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected && "opacity-50 pointer-events-none"
                    )}
                  >
                    <AgentCard
                      agent={agent}
                      variant="compact"
                      onSelect={() => {
                        if (!parent1) selectParent(agent, 1);
                        else if (!parent2 && parent1.id !== agent.id) selectParent(agent, 2);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function ParentSlot({
  label,
  agent,
  onClear,
}: {
  label: string;
  agent: Agent | null;
  onClear: () => void;
}) {
  return (
    <Card className={cn(
      "p-6 h-64 flex flex-col",
      agent ? "border-neon-cyan/30" : "border-dashed border-white/20"
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-white/50">{label}</span>
        {agent && (
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {agent ? (
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h4 className="font-semibold text-white">{agent.name}</h4>
              <Badge variant="cyan">Gen {agent.generation}</Badge>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {agent.traits.slice(0, 2).map((trait) => (
              <div key={trait.id} className="flex items-center justify-between text-sm">
                <span className="text-white/60">{trait.name}</span>
                <span className="font-medium">{trait.value}/{trait.maxValue}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-sm">Click an agent to select</p>
        </div>
      )}
    </Card>
  );
}
