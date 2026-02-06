import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockGenerations } from '../data/mock';
import { formatNumber } from '../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

export function EvolutionPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState(mockGenerations.length);
  const [selectedGeneration, setSelectedGeneration] = useState(mockGenerations[mockGenerations.length - 1]);

  // Calculate stats
  const stats = useMemo(() => {
    const latest = mockGenerations[mockGenerations.length - 1];
    const previous = mockGenerations[mockGenerations.length - 2];
    const fitnessTrend = previous 
      ? ((latest.averageFitness - previous.averageFitness) / previous.averageFitness) * 100 
      : 0;
    
    return {
      currentGen: currentGeneration,
      avgFitness: latest.averageFitness,
      maxFitness: latest.maxFitness,
      fitnessTrend,
      totalGenerations: mockGenerations.length,
    };
  }, [currentGeneration]);

  // Line chart data
  const lineChartData: ChartData<'line'> = useMemo(() => {
    return {
      labels: mockGenerations.map(g => `G${g.generation}`),
      datasets: [
        {
          label: 'Max Fitness',
          data: mockGenerations.map(g => g.maxFitness),
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74, 222, 128, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
        {
          label: 'Average Fitness',
          data: mockGenerations.map(g => g.averageFitness),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
        {
          label: 'Min Fitness',
          data: mockGenerations.map(g => g.minFitness),
          borderColor: '#71717a',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 1.5,
        },
      ],
    };
  }, []);

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#a1a1aa',
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 24, 0.95)',
        titleColor: '#a1a1aa',
        bodyColor: '#fafafa',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#27272a',
        },
        ticks: {
          color: '#71717a',
          font: { size: 10 },
          maxTicksLimit: 10,
        },
      },
      y: {
        min: 0,
        max: 5,
        grid: {
          color: '#27272a',
        },
        ticks: {
          color: '#71717a',
          font: { size: 10 },
        },
      },
    },
  };

  // Radar chart for best agent traits
  const radarChartData: ChartData<'radar'> = useMemo(() => {
    if (!selectedGeneration?.bestAgent) return { labels: [], datasets: [] };
    
    const traits = selectedGeneration.bestAgent.traits;
    return {
      labels: ['Speed', 'Strength', 'Intel', 'Coop', 'Adapt'],
      datasets: [
        {
          label: 'Best Agent Traits',
          data: [
            traits.speed * 100,
            traits.strength * 100,
            traits.intelligence * 100,
            traits.cooperation * 100,
            traits.adaptability * 100,
          ],
          backgroundColor: 'rgba(74, 222, 128, 0.25)',
          borderColor: '#4ade80',
          borderWidth: 2,
          pointBackgroundColor: '#4ade80',
          pointBorderColor: '#0a0a0f',
          pointHoverBackgroundColor: '#0a0a0f',
          pointHoverBorderColor: '#4ade80',
          pointRadius: 4,
        },
      ],
    };
  }, [selectedGeneration]);

  const radarChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 24, 0.95)',
        titleColor: '#a1a1aa',
        bodyColor: '#fafafa',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          display: false,
        },
        grid: {
          color: '#27272a',
        },
        pointLabels: {
          color: '#a1a1aa',
          font: { size: 11 },
        },
      },
    },
  };

  const handleEvolve = () => {
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    setCurrentGeneration(prev => prev + 1);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentGeneration(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Evolution Timeline</h1>
          <p className="text-text-secondary mt-1">
            Track fitness progression and generational improvements
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStep}
            disabled={isRunning}
          >
            <StepForward className="w-4 h-4 mr-2" />
            Step
          </Button>
          
          <Button
            variant={isRunning ? 'danger' : 'primary'}
            size="sm"
            onClick={handleEvolve}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Evolve
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Generation"
          value={stats.currentGen}
          subtitle={`${stats.totalGenerations} total generations`}
          icon={Clock}
          color="cyan"
        />
        <StatCard
          title="Average Fitness"
          value={formatNumber(stats.avgFitness)}
          trend={stats.fitnessTrend}
          trendLabel="vs last gen"
          icon={TrendingUp}
          color="neon"
        />
        <StatCard
          title="Max Fitness"
          value={formatNumber(stats.maxFitness)}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Evolution Rate"
          value={`+${(stats.fitnessTrend * 0.1).toFixed(2)}%`}
          subtitle="Per generation"
          icon={Zap}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fitness Chart */}
        <Card className="lg:col-span-2"
        >
          <CardHeader>
            <CardTitle icon={TrendingUp}>Fitness Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Trait Analysis */}
        <Card>
          <CardHeader>
            <CardTitle icon={Target}>Best Agent Traits</CardTitle>
            <Badge variant="outline">Gen {selectedGeneration.generation}</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <Radar data={radarChartData} options={radarChartOptions} />
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Agent ID</span>
                <span className="font-mono text-sm text-text-primary">
                  {selectedGeneration.bestAgent.id.slice(0, 16)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-text-muted">Fitness Score</span>
                <span className="font-semibold text-neon-400">
                  {formatNumber(selectedGeneration.bestAgent.fitness)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation History */}
      <Card>
        <CardHeader>
          <CardTitle icon={GitBranch}>Generation History</CardTitle>
          <span className="text-sm text-text-muted">Last 10 generations</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockGenerations.slice(-10).reverse().map((gen, index) => (
              <motion.div
                key={gen.generation}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedGeneration(gen)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${selectedGeneration.generation === gen.generation 
                    ? 'bg-neon-500/5 border-neon-500/30' 
                    : 'bg-bg-tertiary/30 border-border hover:border-border-hover'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                      ${selectedGeneration.generation === gen.generation 
                        ? 'bg-neon-500/20 text-neon-400' 
                        : 'bg-bg-secondary text-text-muted'}
                    `}>
                      {gen.generation}
                    </div>
                    
                    <div>
                      <p className="font-mono text-sm text-text-primary">
                        {gen.bestAgent.id.slice(0, 12)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {gen.populationSize} agents
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-text-muted">Avg</p>
                      <p className="font-semibold text-text-primary">{formatNumber(gen.averageFitness)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-muted">Max</p>
                      <p className="font-semibold text-neon-400">{formatNumber(gen.maxFitness)}</p>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-text-muted" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
