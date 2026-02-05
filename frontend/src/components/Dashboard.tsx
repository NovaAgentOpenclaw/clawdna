import { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { Line, Radar } from 'react-chartjs-2'
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Dna,
  TrendingUp,
  Users,
  Award,
  Zap,
  Clock,
  BarChart3,
  GitBranch,
  Settings,
  ChevronRight,
  Sparkles,
  Target,
  Brain,
  Heart,
  Sword,
  Wind,
} from 'lucide-react'
import { useSimulation } from '../hooks/useSimulation'
import { DEFAULT_CONFIG, type Agent, type SimulationConfig } from '../types'
import { formatNumber, formatPercent, cn } from '../utils'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Filler,
  Tooltip,
  Legend
)

// Trait icons mapping
const traitIcons = {
  speed: Wind,
  strength: Sword,
  intelligence: Brain,
  cooperation: Heart,
  adaptability: Zap,
}

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'neon' 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: number
  color?: 'neon' | 'purple' | 'cyan' | 'orange'
}) => {
  const colorClasses = {
    neon: 'from-neon-500/20 to-neon-500/5 text-neon-400',
    purple: 'from-accent-purple/20 to-accent-purple/5 text-accent-purple',
    cyan: 'from-accent-cyan/20 to-accent-cyan/5 text-accent-cyan',
    orange: 'from-accent-orange/20 to-accent-orange/5 text-accent-orange',
  }

  return (
    <div className="stat-card group">
      <div className={cn(
        "p-3 rounded-xl bg-gradient-to-br transition-all duration-300 w-fit",
        colorClasses[color]
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="mt-4">
        <p className="text-text-muted text-sm">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {subtitle && (
          <p className="text-text-muted text-xs mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <span className={cn(
            "value-change mt-2 block",
            trend >= 0 ? "value-up" : "value-down"
          )}>
            {trend >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(trend) / 100)}
          </span>
        )}
      </div>
    </div>
  )
}

// Agent Card Component
const AgentCard = ({ agent, rank, onClick, isSelected }: { 
  agent: Agent
  rank: number
  onClick: () => void
  isSelected: boolean
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "agent-card",
        isSelected && "border-neon-500/50 shadow-neon-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
            rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
            rank === 2 ? "bg-gray-400/20 text-gray-400" :
            rank === 3 ? "bg-orange-600/20 text-orange-400" :
            "bg-bg-tertiary text-text-muted"
          )}>
            {rank}
          </div>
          <div>
            <p className="font-mono text-sm text-text-primary">{agent.id}</p>
            <p className="text-xs text-text-muted">Gen {agent.generation}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-neon-400">{formatNumber(agent.fitness)}</p>
          {agent.mutated && (
            <span className="badge-neon text-2xs">MUTATED</span>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1">
        {Object.entries(agent.traits).map(([trait, value]) => (
          <div key={trait} className="text-center">
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-600 to-neon-400 rounded-full transition-all duration-500"
                style={{ width: `${value * 100}%` }}
              />
            </div>
            <p className="text-2xs text-text-muted mt-1 capitalize">{trait.slice(0, 3)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Genealogy Tree Component
const GenealogyTree = ({ history, bestAgent }: { history: Agent[], bestAgent: Agent | null }) => {
  const uniqueAgents = useMemo(() => {
    const seen = new Set()
    return history.filter(a => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    }).slice(-20).reverse()
  }, [history])

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title">
          <GitBranch className="w-5 h-5 text-neon-400" />
          Evolutionary Lineage
        </h3>
        <span className="text-text-muted text-sm">Last 20 generations</span>
      </div>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-500/50 via-neon-500/20 to-transparent" />
        
        <div className="space-y-3">
          {uniqueAgents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-4 relative">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center z-10 text-xs font-bold",
                agent.id === bestAgent?.id 
                  ? "bg-neon-500 text-bg-primary shadow-neon" 
                  : "bg-bg-tertiary border border-border text-text-secondary"
              )}>
                {agent.generation}
              </div>
              <div className="flex-1 glass-panel py-2 px-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-text-primary">{agent.id}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neon-400 font-semibold">{formatNumber(agent.fitness)}</span>
                    {agent.parents && (
                      <span className="text-2xs text-text-muted">
                        ← {agent.parents[0].slice(0, 6)} × {agent.parents[1].slice(0, 6)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  const { state, start, stop, reset, step } = useSimulation(config)

  // Prepare line chart data
  const lineChartData: ChartData<'line'> = useMemo(() => {
    const labels = state.generations.map(g => `Gen ${g.generation}`)
    return {
      labels,
      datasets: [
        {
          label: 'Max Fitness',
          data: state.generations.map(g => g.maxFitness),
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Avg Fitness',
          data: state.generations.map(g => g.averageFitness),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Min Fitness',
          data: state.generations.map(g => g.minFitness),
          borderColor: '#71717a',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 2,
        },
      ],
    }
  }, [state.generations])

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
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
          font: { size: 11 },
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
          font: { size: 11 },
        },
      },
    },
  }

  // Prepare radar chart data
  const radarChartData: ChartData<'radar'> = useMemo(() => {
    const agent = selectedAgent || state.bestAgentEver
    if (!agent) return { labels: [], datasets: [] }
    
    return {
      labels: ['Speed', 'Strength', 'Intel', 'Coop', 'Adapt'],
      datasets: [
        {
          label: 'Traits',
          data: [
            agent.traits.speed * 100,
            agent.traits.strength * 100,
            agent.traits.intelligence * 100,
            agent.traits.cooperation * 100,
            agent.traits.adaptability * 100,
          ],
          backgroundColor: 'rgba(74, 222, 128, 0.25)',
          borderColor: '#4ade80',
          borderWidth: 2,
          pointBackgroundColor: '#4ade80',
          pointBorderColor: '#0a0a0f',
          pointHoverBackgroundColor: '#0a0a0f',
          pointHoverBorderColor: '#4ade80',
        },
      ],
    }
  }, [selectedAgent, state.bestAgentEver])

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
  }

  // Top agents
  const topAgents = useMemo(() => {
    return [...state.agents]
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, 10)
  }, [state.agents])

  // Calculate trend
  const fitnessTrend = useMemo(() => {
    if (state.generations.length < 2) return 0
    const current = state.generations[state.generations.length - 1]?.averageFitness || 0
    const previous = state.generations[state.generations.length - 2]?.averageFitness || 0
    return previous > 0 ? ((current - previous) / previous) * 100 : 0
  }, [state.generations])

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-neon-500/20 to-neon-600/10 rounded-xl">
                <Dna className="w-8 h-8 text-neon-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Claw
                  <span className="text-gradient">DNA</span>
                </h1>
                <p className="text-text-muted text-sm">Agent Evolution Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    state.isRunning ? "bg-neon-400 animate-pulse" : "bg-text-muted"
                  )} />
                  <span className="text-text-secondary">
                    {state.isRunning ? 'Evolution Active' : 'Paused'}
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-text-muted">
                  Gen <span className="text-text-primary font-mono">{state.currentGeneration}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn-secondary p-2"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                <button
                  onClick={reset}
                  className="btn-secondary p-2"
                  title="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                <button
                  onClick={step}
                  disabled={state.isRunning}
                  className="btn-secondary p-2 disabled:opacity-50"
                  title="Step"
                >
                  <StepForward className="w-5 h-5" />
                </button>
                
                <button
                  onClick={state.isRunning ? stop : start}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200",
                    state.isRunning 
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30" 
                      : "bg-neon-500 hover:bg-neon-400 text-bg-primary shadow-neon hover:shadow-neon-sm"
                  )}
                >
                  {state.isRunning ? (
                    <><Pause className="w-5 h-5" /> Pause</>
                  ) : (
                    <><Play className="w-5 h-5" /> Evolve</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 glass-panel p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">
                <Settings className="w-5 h-5 text-neon-400" />
                Simulation Parameters
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-text-muted mb-2">Population Size</label>
                <input
                  type="number"
                  value={config.populationSize}
                  onChange={(e) => setConfig({ ...config, populationSize: parseInt(e.target.value) || 10 })}
                  className="input-field w-full"
                  min="10"
                  max="500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-text-muted mb-2">Mutation Rate</label>
                <input
                  type="number"
                  value={config.mutationRate}
                  onChange={(e) => setConfig({ ...config, mutationRate: parseFloat(e.target.value) || 0.1 })}
                  className="input-field w-full"
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm text-text-muted mb-2">Survival Rate</label>
                <input
                  type="number"
                  value={config.survivalRate}
                  onChange={(e) => setConfig({ ...config, survivalRate: parseFloat(e.target.value) || 0.4 })}
                  className="input-field w-full"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                />
              </div>
              
              <div>
                <label className="block text-sm text-text-muted mb-2">Evolution Speed (ms)</label>
                <input
                  type="number"
                  value={config.evolutionSpeed}
                  onChange={(e) => setConfig({ ...config, evolutionSpeed: parseInt(e.target.value) || 1000 })}
                  className="input-field w-full"
                  min="100"
                  max="5000"
                  step="100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Current Generation"
            value={state.currentGeneration}
            subtitle="Total generations evolved"
            icon={Clock}
            color="cyan"
          />
          
          <StatCard
            title="Average Fitness"
            value={state.generations.length > 0 
              ? formatNumber(state.generations[state.generations.length - 1]?.averageFitness || 0) 
              : '0.00'
            }
            subtitle="Population average"
            icon={BarChart3}
            trend={fitnessTrend}
            color="neon"
          />
          
          <StatCard
            title="Best Fitness"
            value={state.bestAgentEver ? formatNumber(state.bestAgentEver.fitness) : '0.00'}
            subtitle={`Agent ${state.bestAgentEver?.id.slice(0, 8) || '---'}`}
            icon={Award}
            color="purple"
          />
          
          <StatCard
            title="Population"
            value={state.agents.length}
            subtitle={`Survival rate: ${formatPercent(config.survivalRate)}`}
            icon={Users}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Evolution Timeline */}
            <div className="chart-container">
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title">
                  <TrendingUp className="w-5 h-5 text-neon-400" />
                  Evolution Timeline
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neon-400" />
                    <span className="text-text-muted">Max</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-purple" />
                    <span className="text-text-muted">Avg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-text-muted/50" />
                    <span className="text-text-muted">Min</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[300px]">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </div>

            {/* Genealogy Tree */}
            <GenealogyTree history={state.history} bestAgent={state.bestAgentEver} />
          </div>

          {/* Right Column - Agent Details */}
          <div className="space-y-6">
            {/* Radar Chart */}
            <div className="chart-container">
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title">
                  <Target className="w-5 h-5 text-neon-400" />
                  Trait Analysis
                </h3>
                <span className="text-2xs text-text-muted">
                  {(selectedAgent || state.bestAgentEver)?.id || '---'}
                </span>
              </div>
              
              <div className="h-[280px]">
                {radarChartData.labels && radarChartData.labels.length > 0 ? (
                  <Radar data={radarChartData} options={radarChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-text-muted">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No agent selected</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trait Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(selectedAgent || state.bestAgentEver)?.traits && Object.entries((selectedAgent || state.bestAgentEver)!.traits).map(([trait, value]) => {
                  const Icon = traitIcons[trait as keyof typeof traitIcons]
                  return (
                    <div key={trait} className="flex items-center justify-between p-2 bg-bg-tertiary rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-secondary capitalize">{trait}</span>
                      </div>
                      <span className="font-mono text-sm text-neon-400">{formatPercent(value)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Agents List */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">
                  <Award className="w-5 h-5 text-neon-400" />
                  Top Agents
                </h3>
                <span className="text-text-muted text-sm">Top 10</span>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                {topAgents.map((agent, idx) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    rank={idx + 1}
                    onClick={() => setSelectedAgent(agent)}
                    isSelected={selectedAgent?.id === agent.id}
                  />
                ))}
                
                {topAgents.length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No agents yet</p>
                    <p className="text-sm mt-1">Start evolution to generate agents</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <p>🧬 ClawDNA - Colosseum AI Agent Hackathon 2026</p>
            <div className="flex items-center gap-4">
              <a 
                href="https://agents.colosseum.com/projects/clawdna-uv2mzh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-neon-400 transition-colors flex items-center gap-1"
              >
                View on Colosseum <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
