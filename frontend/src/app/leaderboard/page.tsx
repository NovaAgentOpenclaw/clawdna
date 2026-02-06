"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { useAgents } from "@/hooks/useAgents";
import { cn, getOrdinalSuffix, formatNumber } from "@/lib/utils";
import type { Agent } from "@/types";

export default function LeaderboardPage() {
  const { agents } = useAgents();

  // Sort by fitness
  const sortedAgents = [...agents].sort((a, b) => b.fitness - a.fitness);

  return (
    <PageContainer>
      <PageHeader
        title="Leaderboard"
        subtitle="The fittest agents across all generations"
      />

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-12">
        {sortedAgents.slice(0, 3).map((agent, index) => {
          const position = index + 1;
          const heights = ["h-40", "h-52", "h-32"];
          const orders = [2, 1, 3];
          const colors = [
            "from-yellow-400/30 to-yellow-600/30",
            "from-neon-cyan/30 to-neon-purple/30",
            "from-orange-400/30 to-orange-600/30",
          ];

          return (
            <div
              key={agent.id}
              className="flex flex-col items-center"
              style={{ order: orders[index] }}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-2xl mx-auto mb-2 shadow-glass"
003e
                  🤖
                </div>
                <p className="font-semibold text-white text-sm">{agent.name}</p>
                <p className="text-neon-cyan font-bold">{formatNumber(agent.fitness)}</p>
              </div>
              <div
                className={cn(
                  "w-24 rounded-t-xl bg-gradient-to-t flex items-end justify-center pb-4",
                  heights[index],
                  colors[index]
                )}
              >
                <span className="text-3xl font-bold text-white">
                  {position}
                  <sup className="text-lg">{getOrdinalSuffix(position)}</sup>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Agent</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Generation</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/50">Top Trait</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white/50">Fitness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedAgents.map((agent, index) => {
                const rank = index + 1;
                const topTrait = agent.traits.reduce((prev, current) =>
                  prev.value > current.value ? prev : current
                );

                return (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                          rank === 1 && "bg-yellow-500/20 text-yellow-400",
                          rank === 2 && "bg-white/20 text-white",
                          rank === 3 && "bg-orange-500/20 text-orange-400",
                          rank > 3 && "text-white/50"
                        )}>
                          {rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 flex items-center justify-center">
                          🤖
                        </div>
                        <div>
                          <p className="font-medium text-white">{agent.name}</p>
                          <p className="text-xs text-white/50 font-mono">{agent.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="purple">Gen {agent.generation}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-sm"
                        style={{ color: topTrait.color }}
                      >
                        {topTrait.name} ({topTrait.value})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-neon-cyan">
                        {formatNumber(agent.fitness)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
