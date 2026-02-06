import { motion } from 'framer-motion';
import { Wind, Sword, Brain, Heart, Zap, Sparkles } from 'lucide-react';
import { Agent } from '../types';
import { cn, formatNumber, formatPercent } from '../lib/utils';
import { Badge } from './ui/Badge';

interface AgentCardProps {
  agent: Agent;
  rank?: number;
  onClick?: () => void;
  isSelected?: boolean;
  selectable?: boolean;
  compact?: boolean;
  className?: string;
}

const traitIcons = {
  speed: Wind,
  strength: Sword,
  intelligence: Brain,
  cooperation: Heart,
  adaptability: Zap,
};

export function AgentCard({ 
  agent, 
  rank, 
  onClick, 
  isSelected = false, 
  selectable = false,
  compact = false,
  className 
}: AgentCardProps) {
  const maxTrait = Object.entries(agent.traits).reduce((a, b) => a[1] > b[1] ? a : b);
  const maxTraitName = maxTrait[0] as keyof typeof traitIcons;
  const MaxTraitIcon = traitIcons[maxTraitName];

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={cn(
          'p-4 bg-bg-secondary/60 border rounded-xl cursor-pointer transition-all duration-200',
          isSelected ? 'border-neon-500 shadow-neon-sm' : 'border-border hover:border-border-hover',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {rank && (
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold',
                rank === 1 && 'bg-yellow-500/20 text-yellow-400',
                rank === 2 && 'bg-gray-400/20 text-gray-400',
                rank === 3 && 'bg-orange-600/20 text-orange-400',
                rank > 3 && 'bg-bg-tertiary text-text-muted'
              )}>
                {rank}
              </div>
            )}
            <div>
              <p className="font-mono text-sm text-text-primary">{agent.id.slice(0, 12)}</p>
              <p className="text-xs text-text-muted">Gen {agent.generation}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-neon-400">{formatNumber(agent.fitness)}</p>
            {agent.mutated && <Badge variant="neon">MUTANT</Badge>}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'group relative p-5 bg-bg-secondary/60 backdrop-blur-sm border rounded-2xl cursor-pointer',
        'transition-all duration-300 overflow-hidden',
        isSelected 
          ? 'border-neon-500 shadow-neon-sm bg-neon-500/5' 
          : 'border-border hover:border-neon-500/30 hover:shadow-neon-sm hover:bg-bg-tertiary/60',
        className
      )}
    >
      {/* Background glow effect */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br from-neon-500/0 via-neon-500/0 to-neon-500/0 transition-opacity duration-500',
        isSelected && 'from-neon-500/5 via-transparent to-transparent opacity-100'
      )} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {rank ? (
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
                rank === 1 && 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 text-yellow-400 border border-yellow-500/30',
                rank === 2 && 'bg-gradient-to-br from-gray-400/30 to-gray-500/10 text-gray-300 border border-gray-400/30',
                rank === 3 && 'bg-gradient-to-br from-orange-500/30 to-orange-600/10 text-orange-400 border border-orange-500/30',
                rank > 3 && 'bg-bg-tertiary text-text-muted border border-border'
              )}>
                {rank}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border flex items-center justify-center">
                <MaxTraitIcon className="w-5 h-5 text-neon-400" />
              </div>
            )}
            
            <div>
              <p className="font-mono text-sm text-text-primary tracking-tight">{agent.id.slice(0, 16)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-muted">Gen {agent.generation}</span>
                <span className="w-1 h-1 rounded-full bg-text-muted" />
                <span className="text-xs text-text-muted">{agent.age} cycles</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-gradient">{formatNumber(agent.fitness)}</p>
            <p className="text-xs text-text-muted mt-0.5">Fitness Score</p>
          </div>
        </div>

        {/* Traits Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Object.entries(agent.traits).map(([trait, value]) => {
            const Icon = traitIcons[trait as keyof typeof traitIcons];
            return (
              <div key={trait} className="text-center">
                <div className="relative h-1.5 bg-bg-tertiary rounded-full overflow-hidden mb-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-600 to-neon-400 rounded-full"
                  />
                </div>
                <Icon className="w-3 h-3 text-text-muted mx-auto mb-0.5" />
                <p className="text-2xs text-text-muted font-mono">{formatPercent(value, 0)}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {agent.mutated && (
              <Badge variant="neon" size="sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Mutated
              </Badge>
            )}
            {agent.parents && (
              <Badge variant="outline" size="sm">
                Child
              </Badge>
            )}
          </div>
          
          {selectable && (
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected 
                ? 'bg-neon-500 border-neon-500' 
                : 'border-text-muted group-hover:border-neon-500/50'
            )}>
              {isSelected && <svg className="w-3 h-3 text-bg-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
