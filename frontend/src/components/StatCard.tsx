import { motion } from 'framer-motion';
import { cn, formatPercent } from '../lib/utils';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'neon' | 'purple' | 'cyan' | 'orange' | 'pink';
  className?: string;
  loading?: boolean;
}

const colorClasses = {
  neon: {
    bg: 'from-neon-500/20 to-neon-500/5',
    icon: 'text-neon-400',
    trend: 'text-neon-400',
  },
  purple: {
    bg: 'from-accent-purple/20 to-accent-purple/5',
    icon: 'text-accent-purple',
    trend: 'text-accent-purple',
  },
  cyan: {
    bg: 'from-accent-cyan/20 to-accent-cyan/5',
    icon: 'text-accent-cyan',
    trend: 'text-accent-cyan',
  },
  orange: {
    bg: 'from-accent-orange/20 to-accent-orange/5',
    icon: 'text-accent-orange',
    trend: 'text-accent-orange',
  },
  pink: {
    bg: 'from-accent-pink/20 to-accent-pink/5',
    icon: 'text-accent-pink',
    trend: 'text-accent-pink',
  },
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendLabel,
  color = 'neon',
  className,
  loading = false,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'p-6 bg-bg-secondary/80 backdrop-blur-xl border border-border rounded-2xl',
        'hover:border-border-hover transition-all duration-300',
        className
      )}
    >
      <div className={cn(
        'p-3 rounded-xl bg-gradient-to-br w-fit transition-transform duration-300',
        colors.bg
      )}>
        <Icon className={cn('w-6 h-6', colors.icon)} />
      </div>
      
      <div className="mt-4">
        <p className="text-text-muted text-sm">{title}</p>
        
        {loading ? (
          <div className="h-8 w-24 bg-bg-tertiary rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        )}
        
        {subtitle && (
          <p className="text-text-muted text-xs mt-1">{subtitle}</p>
        )}
        
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 mt-2 text-sm font-medium',
            trend >= 0 ? 'text-neon-400' : 'text-red-400'
          )}>
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatPercent(Math.abs(trend) / 100)}</span>
            {trendLabel && <span className="text-text-muted ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: number;
  className?: string;
}

export function MiniStat({ label, value, trend, className }: MiniStatProps) {
  return (
    <div className={cn('text-center', className)}>
      <p className="text-text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-text-primary mt-0.5">{value}</p>
      {trend !== undefined && (
        <span className={cn(
          'text-xs font-medium',
          trend >= 0 ? 'text-neon-400' : 'text-red-400'
        )}>
          {trend >= 0 ? '+' : ''}{formatPercent(trend / 100)}
        </span>
      )}
    </div>
  );
}
