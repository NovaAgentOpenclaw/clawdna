import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitMerge, 
  Sparkles, 
  RefreshCw,
  Heart,
  Dna,
  Zap,
  Wind,
  Sword,
  Brain,
  X
} from 'lucide-react';
import { AgentCard } from '../components/AgentCard';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockAgents } from '../data/mock';
import { Agent, AgentTraits } from '../types';
import { cn, formatNumber, formatPercent } from '../lib/utils';

// Mock breeding prediction function
function predictOffspring(parent1: Agent, parent2: Agent): {
  traits: AgentTraits;
  fitness: number;
  mutationChance: number;
} {
  const traits: AgentTraits = {
    speed: (parent1.traits.speed + parent2.traits.speed) / 2 * (0.9 + Math.random() * 0.2),
    strength: (parent1.traits.strength + parent2.traits.strength) / 2 * (0.9 + Math.random() * 0.2),
    intelligence: (parent1.traits.intelligence + parent2.traits.intelligence) / 2 * (0.9 + Math.random() * 0.2),
    cooperation: (parent1.traits.cooperation + parent2.traits.cooperation) / 2 * (0.9 + Math.random() * 0.2),
    adaptability: (parent1.traits.adaptability + parent2.traits.adaptability) / 2 * (0.9 + Math.random() * 0.2),
  };

  // Clamp values to 0-1
  (Object.keys(traits) as (keyof AgentTraits)[]).forEach(key => {
    traits[key] = Math.max(0, Math.min(1, traits[key]));
  });

  const fitness = Object.values(traits).reduce((a, b) => a + b, 0) / 5 * (3 + Math.random());
  const mutationChance = Math.random() * 0.3;

  return { traits, fitness, mutationChance };
}

export function BreedingPage() {
  const [parent1, setParent1] = useState<Agent | null>(null);
  const [parent2, setParent2] = useState<Agent | null>(null);
  const [offspring, setOffspring] = useState<ReturnType<typeof predictOffspring> | null>(null);
  const [showParentSelector, setShowParentSelector] = useState<1 | 2 | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);

  // Top agents for selection
  const topAgents = useMemo(() => {
    return [...mockAgents].sort((a, b) => b.fitness - a.fitness).slice(0, 20);
  }, []);

  const handleBreed = () => {
    if (!parent1 || !parent2) return;
    
    setIsBreeding(true);
    
    // Simulate breeding delay
    setTimeout(() => {
      setOffspring(predictOffspring(parent1, parent2));
      setIsBreeding(false);
    }, 1000);
  };

  const handleSelectParent = (agent: Agent) => {
    if (showParentSelector === 1) {
      setParent1(agent);
    } else {
      setParent2(agent);
    }
    setShowParentSelector(null);
    setOffspring(null);
  };

  const compatibility = useMemo(() => {
    if (!parent1 || !parent2) return null;
    
    const traitDiffs = Object.keys(parent1.traits).map(key => {
      const k = key as keyof AgentTraits;
      return Math.abs(parent1.traits[k] - parent2.traits[k]);
    });
    
    const avgDiff = traitDiffs.reduce((a, b) => a + b, 0) / traitDiffs.length;
    return Math.round((1 - avgDiff) * 100);
  }, [parent1, parent2]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Breeding Lab</h1>
          <p className="text-text-secondary mt-1">
            Select two parent agents to create offspring with combined traits
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            setParent1(null);
            setParent2(null);
            setOffspring(null);
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Breeding Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parent 1 */}
        <Card className={cn(
          'transition-all duration-300',
          parent1 ? 'border-neon-500/30' : 'border-dashed border-border'
        )}>
          <CardHeader>
            <CardTitle icon={parent1 ? undefined : Heart}>
              {parent1 ? 'Parent 1' : 'Select Parent 1'}
            </CardTitle>
            {parent1?.mutated && <Badge variant="neon">Mutated</Badge>}
          </CardHeader>
          
          <CardContent>
            {parent1 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center">
                    <Dna className="w-6 h-6 text-neon-400" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-text-primary">{parent1.id.slice(0, 16)}</p>
                    <p className="text-xs text-text-muted">Gen {parent1.generation} - {parent1.age} cycles</p>
                  </div>
                </div>
                
                <div className="p-4 bg-bg-tertiary/50 rounded-xl">
                  <p className="text-sm text-text-muted mb-2">Fitness Score</p>
                  <p className="text-2xl font-bold text-neon-400">{formatNumber(parent1.fitness)}</p>
                </div>
                
                <TraitGrid traits={parent1.traits} compact />
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setShowParentSelector(1)}
                >
                  Change Parent
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowParentSelector(1)}
                className="w-full py-12 border-2 border-dashed border-border rounded-xl hover:border-neon-500/30 hover:bg-neon-500/5 transition-all group"
              >
                <Heart className="w-8 h-8 text-text-muted mx-auto mb-3 group-hover:text-neon-400 transition-colors" />
                <p className="text-text-secondary">Click to select parent</p>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Breeding Controls */}
        <Card className="flex flex-col justify-center">
          <CardContent className="text-center py-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border animate-spin-slow" 
                  style={{ animationDuration: '10s' }} 
                />
              </div>
              
              <motion.div
                animate={{ 
                  scale: parent1 && parent2 ? [1, 1.1, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative z-10 w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neon-500/20 to-neon-600/10 border border-neon-500/30 flex items-center justify-center"
              >
                <GitMerge className="w-10 h-10 text-neon-400" />
              </motion.div>
            </div>

            {compatibility !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <p className="text-sm text-text-muted">Compatibility</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${compatibility}%` }}
                      className={cn(
                        'h-full rounded-full',
                        compatibility >= 70 ? 'bg-neon-500' : 
                        compatibility >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                    />
                  </div>
                  <span className={cn(
                    'font-semibold',
                    compatibility >= 70 ? 'text-neon-400' : 
                    compatibility >= 40 ? 'text-yellow-400' : 'text-red-400'
                  )}>
                    {compatibility}%
                  </span>
                </div>
              </motion.div>
            )}

            <Button
              size="lg"
              className="mt-6 w-full"
              disabled={!parent1 || !parent2 || isBreeding}
              onClick={handleBreed}
            >
              {isBreeding ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Breeding...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Breed Agents
                </>
              )}
            </Button>

            {parent1 && parent2 && (
              <p className="mt-3 text-sm text-text-muted">
                Mutation chance: <span className="text-neon-400">15-30%</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Parent 2 */}
        <Card className={cn(
          'transition-all duration-300',
          parent2 ? 'border-neon-500/30' : 'border-dashed border-border'
        )}>
          <CardHeader>
            <CardTitle icon={parent2 ? undefined : Heart}>
              {parent2 ? 'Parent 2' : 'Select Parent 2'}
            </CardTitle>
            {parent2?.mutated && <Badge variant="neon">Mutated</Badge>}
          </CardHeader>
          
          <CardContent>
            {parent2 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center">
                    <Dna className="w-6 h-6 text-accent-purple" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-text-primary">{parent2.id.slice(0, 16)}</p>
                    <p className="text-xs text-text-muted">Gen {parent2.generation} - {parent2.age} cycles</p>
                  </div>
                </div>
                
                <div className="p-4 bg-bg-tertiary/50 rounded-xl">
                  <p className="text-sm text-text-muted mb-2">Fitness Score</p>
                  <p className="text-2xl font-bold text-accent-purple">{formatNumber(parent2.fitness)}</p>
                </div>
                
                <TraitGrid traits={parent2.traits} compact />
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setShowParentSelector(2)}
                >
                  Change Parent
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowParentSelector(2)}
                className="w-full py-12 border-2 border-dashed border-border rounded-xl hover:border-neon-500/30 hover:bg-neon-500/5 transition-all group"
              >
                <Heart className="w-8 h-8 text-text-muted mx-auto mb-3 group-hover:text-accent-purple transition-colors" />
                <p className="text-text-secondary">Click to select parent</p>
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Offspring Preview */}
      <AnimatePresence>
        {offspring && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card glow className="border-neon-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neon-500/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-neon-400" />
                  </div>
                  <div>
                    <CardTitle>New Offspring Created!</CardTitle>
                    <p className="text-sm text-text-muted">
                      Generation {Math.max(parent1?.generation || 0, parent2?.generation || 0) + 1}
                    </p>
                  </div>
                </div>
                
                {offspring.mutationChance > 0.2 && (
                  <Badge variant="neon">High Mutation Potential</Badge>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-bg-tertiary/50 rounded-xl">
                    <p className="text-sm text-text-muted">Predicted Fitness</p>
                    <motion.p 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-4xl font-bold text-gradient mt-2"
                    >
                      {formatNumber(offspring.fitness)}
                    </motion.p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-text-muted">vs Parents:</span>
                      <span className={cn(
                        'text-sm font-medium',
                        offspring.fitness > (parent1?.fitness || 0) && offspring.fitness > (parent2?.fitness || 0)
                          ? 'text-neon-400' : 'text-text-muted'
                      )}>
                        {offspring.fitness > (parent1?.fitness || 0) && offspring.fitness > (parent2?.fitness || 0)
                          ? 'Improved ↗' : 'Mixed'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <p className="text-sm font-medium text-text-primary mb-4">Inherited Traits</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Object.entries(offspring.traits) as [keyof AgentTraits, number][]).map(([trait, value], index) => {
                        const parent1Value = parent1?.traits[trait] || 0;
                        const parent2Value = parent2?.traits[trait] || 0;
                        const avgParent = (parent1Value + parent2Value) / 2;
                        const improvement = ((value - avgParent) / avgParent) * 100;
                        
                        return (
                          <motion.div
                            key={trait}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-bg-tertiary/30 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-text-secondary capitalize">{trait}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-text-primary">{formatPercent(value)}</span>
                                {improvement > 5 && (
                                  <Badge variant="neon" size="sm">+{formatPercent(improvement / 100, 0)}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${value * 100}%` }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-neon-600 to-neon-400 rounded-full"
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setOffspring(null)}>Discard</Button>
                  <Button>Add to Population</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parent Selector Modal */}
      <AnimatePresence>
        {showParentSelector && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowParentSelector(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-4xl lg:max-h-[90vh] bg-bg-primary border border-border rounded-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">Select Parent {showParentSelector}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowParentSelector(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onClick={() => handleSelectParent(agent)}
                      selectable
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for trait grid
function TraitGrid({ traits, compact = false }: { traits: AgentTraits; compact?: boolean }) {
  const traitIcons = {
    speed: Wind,
    strength: Sword,
    intelligence: Brain,
    cooperation: Heart,
    adaptability: Zap,
  };

  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-2')}>
      {(Object.entries(traits) as [keyof AgentTraits, number][]).map(([trait, value]) => {
        const Icon = traitIcons[trait];
        return (
          <div key={trait} className="flex items-center justify-between p-2 bg-bg-tertiary/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-secondary capitalize">{trait}</span>
            </div>
            <span className="font-mono text-sm text-text-primary">{formatPercent(value)}</span>
          </div>
        );
      })}
    </div>
  );
}
