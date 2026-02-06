import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award,
  Crown,
  Zap,
  Wind,
  Sword,
  Brain,
  Heart,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { mockAgents } from '../data/mock';
import { Agent } from '../types';
import { cn, formatNumber, formatPercent } from '../lib/utils';

type SortField = 'rank' | 'fitness' | 'generation' | 'age';
type SortOrder = 'asc' | 'desc';
type TimeRange = 'all' | 'day' | 'week' | 'month';

interface LeaderboardEntry extends Agent {
  rank: number;
  previousRank: number;
  change: number;
}

export function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedAgent, setSelectedAgent] = useState<LeaderboardEntry | null>(null);

  // Generate leaderboard entries with mock ranking data
  const leaderboardData: LeaderboardEntry[] = useMemo(() => {
    const sorted = [...mockAgents].sort((a, b) => b.fitness - a.fitness);
    return sorted.map((agent, index) => ({
      ...agent,
      rank: index + 1,
      previousRank: index + 1 + Math.floor(Math.random() * 10) - 5,
      change: Math.floor(Math.random() * 10) - 5,
    }));
  }, []);

  // Filter and sort
  const filteredData = useMemo(() => {
    let result = [...leaderboardData];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry => 
        entry.id.toLowerCase().includes(query) ||
        entry.generation.toString().includes(query)
      );
    }

    result.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'fitness':
          aVal = a.fitness;
          bVal = b.fitness;
          break;
        case 'generation':
          aVal = a.generation;
          bVal = b.generation;
          break;
        case 'age':
          aVal = a.age;
          bVal = b.age;
          break;
        default:
          aVal = a.rank;
          bVal = b.rank;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [leaderboardData, searchQuery, sortField, sortOrder]);

  // Top 3 for podium
  const topThree = useMemo(() => filteredData.slice(0, 3), [filteredData]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-neon-400" /> : 
      <ChevronDown className="w-4 h-4 text-neon-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Leaderboard</h1>
          <p className="text-text-secondary mt-1">
            Top performing agents ranked by fitness score
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {(['all', 'day', 'week', 'month'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-400/30 to-gray-500/10 border border-gray-400/30 flex items-center justify-center mb-4">
              <Medal className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-300">#2</p>
            <p className="font-mono text-sm text-text-primary text-center mt-1 px-2 truncate w-full">
              {topThree[1].id.slice(0, 12)}
            </p>
            <p className="text-lg font-semibold text-neon-400 mt-1">{formatNumber(topThree[1].fitness)}</p>
          </motion.div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center -mt-4"
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center mb-4 shadow-neon">
              <Crown className="w-12 h-12 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">#1</p>
            <p className="font-mono text-sm text-text-primary text-center mt-1 px-2 truncate w-full">
              {topThree[0].id.slice(0, 12)}
            </p>
            <p className="text-xl font-bold text-neon-400 mt-1">{formatNumber(topThree[0].fitness)}</p>
            <Badge variant="neon" className="mt-2">Champion</Badge>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/30 to-orange-600/10 border border-orange-500/30 flex items-center justify-center mb-4">
              <Award className="w-10 h-10 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">#3</p>
            <p className="font-mono text-sm text-text-primary text-center mt-1 px-2 truncate w-full">
              {topThree[2].id.slice(0, 12)}
            </p>
            <p className="text-lg font-semibold text-neon-400 mt-1">{formatNumber(topThree[2].fitness)}</p>
          </motion.div>
        )}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th 
                    className="text-left py-4 px-6 cursor-pointer hover:bg-bg-tertiary/30 transition-colors"
                    onClick={() => toggleSort('rank')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-text-muted">Rank</span>
                      <SortIcon field="rank" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <span className="text-sm font-medium text-text-muted">Agent</span>
                  </th>
                  <th 
                    className="text-left py-4 px-6 cursor-pointer hover:bg-bg-tertiary/30 transition-colors"
                    onClick={() => toggleSort('fitness')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-text-muted">Fitness</span>
                      <SortIcon field="fitness" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <span className="text-sm font-medium text-text-muted">Top Traits</span>
                  </th>
                  <th 
                    className="text-left py-4 px-6 cursor-pointer hover:bg-bg-tertiary/30 transition-colors hidden sm:table-cell"
                    onClick={() => toggleSort('generation')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-text-muted">Gen</span>
                      <SortIcon field="generation" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 hidden md:table-cell">
                    <span className="text-sm font-medium text-text-muted">Status</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedAgent(entry)}
                    className={cn(
                      'border-b border-border last:border-0 cursor-pointer transition-colors',
                      'hover:bg-bg-tertiary/30',
                      entry.rank <= 3 && 'bg-gradient-to-r from-neon-500/5 to-transparent'
                    )}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                          entry.rank === 1 && 'bg-yellow-500/20 text-yellow-400',
                          entry.rank === 2 && 'bg-gray-400/20 text-gray-300',
                          entry.rank === 3 && 'bg-orange-500/20 text-orange-400',
                          entry.rank > 3 && 'text-text-muted'
                        )}>
                          {entry.rank}
                        </span>
                        
                        {entry.change !== 0 && (
                          <span className={cn(
                            'text-xs font-medium flex items-center',
                            entry.change > 0 ? 'text-neon-400' : 'text-red-400'
                          )}>
                            {entry.change > 0 ? (
                              <><ChevronUp className="w-3 h-3" />{entry.change}</>
                            ) : (
                              <><ChevronDown className="w-3 h-3" />{Math.abs(entry.change)}</>
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-neon-400" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-text-primary">{entry.id.slice(0, 12)}</p>
                          <p className="text-xs text-text-muted">{entry.age} cycles old</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-neon-400">
                          {formatNumber(entry.fitness)}
                        </span>
                        <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-neon-500 rounded-full"
                            style={{ width: `${(entry.fitness / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        {Object.entries(entry.traits)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([trait, value]) => (
                            <Badge key={trait} variant="outline" size="sm">
                              {trait.slice(0, 3)}: {formatPercent(value, 0)}
                            </Badge>
                          ))}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <span className="text-text-secondary">Gen {entry.generation}</span>
                    </td>
                    
                    <td className="py-4 px-6 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {entry.mutated && (
                          <Badge variant="neon" size="sm">Mutated</Badge>
                        )}
                        {entry.parents && (
                          <Badge variant="outline" size="sm">Bred</Badge>
                        )}
                        {!entry.mutated && !entry.parents && (
                          <Badge variant="outline" size="sm">Natural</Badge>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
        />
      )}
    </div>
  );
}

// Agent Detail Modal Component
function AgentDetailModal({ agent, onClose }: { agent: LeaderboardEntry; onClose: () => void }) {
  const traitIcons = {
    speed: Wind,
    strength: Sword,
    intelligence: Brain,
    cooperation: Heart,
    adaptability: Zap,
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-4 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:max-h-[90vh] bg-bg-primary border border-border rounded-2xl z-50 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center',
              agent.rank === 1 && 'bg-yellow-500/20',
              agent.rank === 2 && 'bg-gray-400/20',
              agent.rank === 3 && 'bg-orange-500/20',
              agent.rank > 3 && 'bg-bg-tertiary'
            )}>
              <span className={cn(
                'text-2xl font-bold',
                agent.rank === 1 && 'text-yellow-400',
                agent.rank === 2 && 'text-gray-300',
                agent.rank === 3 && 'text-orange-400',
                agent.rank > 3 && 'text-text-muted'
              )}>
                #{agent.rank}
              </span>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-text-primary">Agent Details</h2>
              <p className="font-mono text-sm text-text-muted">{agent.id}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-bg-tertiary/50 rounded-xl">
              <p className="text-sm text-text-muted">Fitness Score</p>
              <p className="text-2xl font-bold text-neon-400">{formatNumber(agent.fitness)}</p>
            </div>
            
            <div className="p-4 bg-bg-tertiary/50 rounded-xl">
              <p className="text-sm text-text-muted">Generation</p>
              <p className="text-2xl font-bold text-text-primary">{agent.generation}</p>
            </div>
            
            <div className="p-4 bg-bg-tertiary/50 rounded-xl">
              <p className="text-sm text-text-muted">Age</p>
              <p className="text-2xl font-bold text-text-primary">{agent.age} cycles</p>
            </div>
            
            <div className="p-4 bg-bg-tertiary/50 rounded-xl">
              <p className="text-sm text-text-muted">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {agent.mutated && <Badge variant="neon">Mutated</Badge>}
                {agent.parents && <Badge variant="outline">Bred</Badge>}
                {!agent.mutated && !agent.parents && <Badge variant="outline">Natural</Badge>}
              </div>
            </div>
          </div>
          
          {/* Traits */}
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-4">Trait Analysis</h3>
            <div className="space-y-3">
              {(Object.entries(agent.traits) as [keyof typeof traitIcons, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([trait, value]) => {
                  const Icon = traitIcons[trait];
                  return (
                    <div key={trait} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-32">
                        <Icon className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-secondary capitalize">{trait}</span>
                      </div>
                      
                      <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neon-600 to-neon-400 rounded-full"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      
                      <span className="w-16 text-right font-mono text-sm text-text-primary">
                        {formatPercent(value)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
          
          {/* Parents */}
          {agent.parents && (
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Parentage</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 p-3 bg-bg-tertiary/50 rounded-lg">
                  <p className="font-mono text-xs text-text-muted">{agent.parents[0]}</p>
                </div>
                <span className="text-text-muted">×</span>
                <div className="flex-1 p-3 bg-bg-tertiary/50 rounded-lg">
                  <p className="font-mono text-xs text-text-muted">{agent.parents[1]}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-bg-tertiary/30 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button>Use in Breeding</Button>
        </div>
      </motion.div>
    </>
  );
}
