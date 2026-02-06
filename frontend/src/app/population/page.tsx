"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { AgentCard } from "@/components/agent/AgentCard";
import { FilterTabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useAgents } from "@/hooks/useAgents";
import type { TabId } from "@/types";

const tabs = [
  { value: "all" as TabId, label: "All Agents", icon: <GridIcon className="w-4 h-4" /> },
  { value: "elite" as TabId, label: "Elite", icon: <StarIcon className="w-4 h-4" /> },
  { value: "favorites" as TabId, label: "Favorites", icon: <HeartIcon className="w-4 h-4" /> },
  { value: "recent" as TabId, label: "Recent", icon: <ClockIcon className="w-4 h-4" /> },
];

export default function PopulationPage() {
  const { agents, loading } = useAgents();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter((agent) => {
    if (searchQuery) {
      return agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeTab === "elite") return agent.fitness >= 950;
    if (activeTab === "recent") return agent.generation >= 42;
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Population"
        subtitle="Explore and analyze your evolving agent population"
        action={
          <Button variant="secondary">
            <FilterIcon className="w-4 h-4" />
            Filters
          </Button>
        }
      />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-neon-cyan/50"
          />
        </div>
        <FilterTabs
          options={tabs}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Agents", value: agents.length.toString() },
          { label: "Avg Fitness", value: agents.length > 0 ? Math.round(agents.reduce((a, b) => a + b.fitness, 0) / agents.length).toString() : "0" },
          { label: "Generations", value: "44" },
          { label: "Elite", value: agents.filter((a) => a.fitness >= 950).length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-lg p-4">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-80 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {filteredAgents.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <SearchIcon className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
          <p className="text-white/50">Try adjusting your filters or search query</p>
        </div>
      )}
    </PageContainer>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
