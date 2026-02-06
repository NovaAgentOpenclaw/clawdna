"use client";

import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useEvolution } from "@/hooks/useEvolution";
import { useAgents } from "@/hooks/useAgents";
import { formatNumber } from "@/lib/utils";

export default function EvolutionPage() {
  const { generation, isEvolving, progress, stats, evolve } = useEvolution();
  const { agents } = useAgents();

  const topAgent = agents.length > 0 
    ? agents.reduce((prev, current) => prev.fitness > current.fitness ? prev : current)
    : null;

  return (
    <PageContainer>
      <PageHeader
        title="Evolution"
        subtitle="Advance to the next generation through natural selection"
        action={
          <Button
            onClick={evolve}
            isLoading={isEvolving}
            disabled={isEvolving}
            size="lg"
          >
            {isEvolving ? "Evolving..." : "Evolve Next Gen"}
          </Button>
        }
      />

      {/* Generation Counter */}
      <div className="text-center mb-12">
        <p className="text-white/50 mb-2">Current Generation</p>
        <div className="text-7xl sm:text-8xl font-bold gradient-text">
          #{generation}
        </div>
      </div>

      {/* Evolution Progress */}
      {isEvolving && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70">Processing generation {generation + 1}...</span>
            <span className="text-neon-cyan font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} max={100} size="lg" variant="cyan" />
          <div className="flex items-center justify-center gap-2 mt-4 text-white/50 text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Calculating fitness scores...
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm text-white/50">Population Size</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.populationSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
              <TrendingIcon className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-white/50">Avg Fitness</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.averageFitness)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center">
              <DnaIcon className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-white/50">Mutations</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.mutations)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-yellow/20 flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-neon-yellow" />
            </div>
            <div>
              <p className="text-sm text-white/50">Survivors</p>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.survivors)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performer */}
      {topAgent && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Performer</h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan/30 via-neon-purple/30 to-neon-green/30 flex items-center justify-center text-4xl shadow-neon-cyan">
              🤖
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-white">{topAgent.name}</h4>
              <p className="text-white/50">Generation #{topAgent.generation} • {formatNumber(topAgent.fitness)} fitness</p>
              <div className="flex gap-2 mt-3">
                {topAgent.traits.slice(0, 3).map((trait) => (
                  <span
                    key={trait.id}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${trait.color}20`,
                      color: trait.color,
                    }}
                  >
                    {trait.name}: {trait.value}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-neon-cyan">#{1}</p>
              <p className="text-sm text-white/50">Global Rank</p>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
