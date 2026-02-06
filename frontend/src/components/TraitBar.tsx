import { motion } from 'framer-motion';
import { AgentTraits } from '../types';
import { cn, formatPercent } from '../lib/utils';
import { Wind, Sword, Brain, Heart, Zap } from 'lucide-react';

interface TraitBarProps {
  trait: keyof AgentTraits;
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const traitIcons = {
  speed: Wind,
  strength: Sword,
  intelligence: Brain,
  cooperation: Heart,
  adaptability: Zap,
};

const traitColors = {
  speed: 'from-cyan-500 to-cyan-400',
  strength: 'from-orange-500 to-orange-400',
  intelligence: 'from-purple-500 to-purple-400',
  cooperation: 'from-pink-500 to-pink-400',
  adaptability: 'from-neon-500 to-neon-400',
};

const sizes = {
  sm: { height: 'h-1.5', text: 'text-xs', icon: 'w-3 h-3' },
  md: { height: 'h-2', text: 'text-sm', icon: 'w-4 h-4' },
  lg: { height: 'h-3', text: 'text-base', icon: 'w-5 h-5' },
};

export function TraitBar({ 
  trait, 
  value, 
  size = 'md', 
  showIcon = true, 
  showValue = true,
  animated = true,
  className 
}: TraitBarProps) {
  const Icon = traitIcons[trait];
  const sizeClasses = sizes[size];

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {showIcon && <Icon className={cn(sizeClasses.icon, 'text-text-muted')} />}
          <span className={cn('text-text-secondary capitalize font-medium', sizeClasses.text)}>
            {trait}
          </span>
        </div>
        {showValue && (
          <span className={cn('font-mono text-neon-400', sizeClasses.text)}>
            {formatPercent(value)}
          </span>
        )}
      </div>
      
      <div className={cn('bg-bg-tertiary rounded-full overflow-hidden', sizeClasses.height)}>
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full bg-gradient-to-r rounded-full', traitColors[trait])}
        />
      </div>
    </div>
  );
}

interface TraitGridProps {
  traits: AgentTraits;
  columns?: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TraitGrid({ traits, columns = 1, size = 'md', className }: TraitGridProps) {
  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  return (
    <div className={cn('grid gap-4', columnClass[columns], className)}>
      {Object.entries(traits).map(([trait, value]) => (
        <TraitBar
          key={trait}
          trait={trait as keyof AgentTraits}
          value={value}
          size={size}
        />
      ))}
    </div>
  );
}

interface TraitRadarProps {
  traits: AgentTraits;
  size?: number;
  className?: string;
}

export function TraitRadar({ traits, size = 120, className }: TraitRadarProps) {
  const values = Object.values(traits);
  const keys = Object.keys(traits) as (keyof AgentTraits)[];
  const numTraits = values.length;
  const angleStep = (2 * Math.PI) / numTraits;
  const center = size / 2;
  const radius = size * 0.4;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * value;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = values.map((value, i) => getPoint(i, value));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Background grid */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
          <polygon
            key={scale}
            points={values.map((_, i) => {
              const p = getPoint(i, scale);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="#27272a"
            strokeWidth="1"
          />
        ))}
        
        {/* Axes */}
        {values.map((_, i) => {
          const end = getPoint(i, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#27272a"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Data polygon */}
        <motion.path
          d={pathD}
          fill="rgba(34, 197, 94, 0.25)"
          stroke="#22c55e"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#22c55e"
            stroke="#0a0a0f"
            strokeWidth="2"
          />
        ))}
      </svg>
      
      {/* Labels */}
      {keys.map((trait, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = radius * 1.2;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        return (
          <span
            key={trait}
            className="absolute text-2xs text-text-muted font-medium uppercase tracking-wider"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {trait.slice(0, 4)}
          </span>
        );
      })}
    </div>
  );
}
