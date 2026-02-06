import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Dna,
  Sparkles
} from 'lucide-react';
import { AgentCard } from '../components/AgentCard';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { mockAgents } from '../data/mock';
import { Agent, AgentTraits } from '../types';
import { cn, formatNumber } from '../lib/utils';

type SortField = 'fitness' | 'generation' | 'age' | 'speed' | 'strength' | 'intelligence' | 'cooperation' | 'adaptability';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface FilterState {
  generation: number | null;
  minFitness: number;
  mutatedOnly: boolean;
  traitFilter: keyof AgentTraits | null;
}

export function PopulationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('fitness');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    generation: null,
    minFitness: 0,
    mutatedOnly: false,
    traitFilter: null,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalAgents = mockAgents.length;
    const avgFitness = mockAgents.reduce((acc, a) => acc + a.fitness, 0) / totalAgents;
    const maxFitness = Math.max(...mockAgents.map(a => a.fitness));
    const mutatedCount = mockAgents.filter(a => a.mutated).length;
    
    return {
      totalAgents,
      avgFitness,
      maxFitness,
      mutatedCount,
    };
  }, []);

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let result = [...mockAgents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent => 
        agent.id.toLowerCase().includes(query) ||
        agent.generation.toString().includes(query)
      );
    }

    // Generation filter
    if (filters.generation !== null) {
      result = result.filter(agent => agent.generation === filters.generation);
    }

    // Fitness filter
    if (filters.minFitness > 0) {
      result = result.filter(agent => agent.fitness >= filters.minFitness);
    }

    // Mutated filter
    if (filters.mutatedOnly) {
      result = result.filter(agent => agent.mutated);
    }

    // Trait filter
    if (filters.traitFilter) {
      result = result.sort((a, b) => 
        b.traits[filters.traitFilter!] - a.traits[filters.traitFilter!]
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (['speed', 'strength', 'intelligence', 'cooperation', 'adaptability'].includes(sortField)) {
        aVal = a.traits[sortField as keyof AgentTraits];
        bVal = b.traits[sortField as keyof AgentTraits];
      } else {
        aVal = a[sortField as keyof Agent] as number;
        bVal = b[sortField as keyof Agent] as number;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [searchQuery, sortField, sortOrder, filters]);

  const generations = useMemo(() => {
    return Array.from(new Set(mockAgents.map(a => a.generation))).sort((a, b) => a - b);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Agent Population</h1>
          <p className="text-text-secondary mt-1">
            Browse, filter, and analyze your evolving agent population
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'border-neon-500/50' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(filters.generation !== null || filters.minFitness > 0 || filters.mutatedOnly) && (
              <Badge variant="neon" size="sm" className="ml-2">Active</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agents"
          value={stats.totalAgents.toLocaleString()}
          icon={Dna}
          color="cyan"
        />
        <StatCard
          title="Average Fitness"
          value={formatNumber(stats.avgFitness)}
          icon={SlidersHorizontal}
          color="neon"
        />
        <StatCard
          title="Max Fitness"
          value={formatNumber(stats.maxFitness)}
          icon={Sparkles}
          color="purple"
        />
        <StatCard
          title="Mutated Agents"
          value={stats.mutatedCount}
          subtitle={`${((stats.mutatedCount / stats.totalAgents) * 100).toFixed(1)}% of population`}
          icon={Sparkles}
          color="orange"
        />
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-bg-secondary/60 border border-border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Filter Options</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ generation: null, minFitness: 0, mutatedOnly: false, traitFilter: null })}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-text-muted mb-2 block">Generation</label>
                  <select
                    value={filters.generation ?? ''}
                    onChange={(e) => setFilters({ ...filters, generation: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-neon-500/50 focus:outline-none"
                  >
                    <option value="">All Generations</option>
                    {generations.map(gen => (
                      <option key={gen} value={gen}>Generation {gen}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-text-muted mb-2 block">Min Fitness: {filters.minFitness.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.minFitness}
                    onChange={(e) => setFilters({ ...filters, minFitness: parseFloat(e.target.value) })}
                    className="w-full accent-neon-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-text-muted mb-2 block">Special Traits</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.mutatedOnly}
                        onChange={(e) => setFilters({ ...filters, mutatedOnly: e.target.checked })}
                        className="rounded border-border bg-bg-tertiary text-neon-500 focus:ring-neon-500/30"
                      />
                      <span className="text-sm text-text-secondary">Mutated only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search agents by ID or generation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="bg-bg-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:border-neon-500/50 focus:outline-none"
          >
            <option value="fitness">Fitness</option>
            <option value="generation">Generation</option>
            <option value="age">Age</option>
            <option value="speed">Speed</option>
            <option value="strength">Strength</option>
            <option value="intelligence">Intelligence</option>
            <option value="cooperation">Cooperation</option>
            <option value="adaptability">Adaptability</option>
          </select>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3"
          >
            <ArrowUpDown className={cn('w-4 h-4', sortOrder === 'asc' && 'rotate-180')} />
          </Button>
          
          <div className="h-8 w-px bg-border mx-1" />
          
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-3"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Showing <span className="text-text-primary font-medium">{filteredAgents.length}</span> agents
        </p>
      </div>

      {/* Agent Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'
          : 'space-y-3'
      )}>
        <AnimatePresence mode="popLayout">
          {filteredAgents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <AgentCard
                agent={agent}
                onClick={() => setSelectedAgent(agent)}
                isSelected={selectedAgent?.id === agent.id}
                compact={viewMode === 'list'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-tertiary flex items-center justify-center">
            <Search className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No agents found</h3>
          <p className="text-text-secondary">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}
