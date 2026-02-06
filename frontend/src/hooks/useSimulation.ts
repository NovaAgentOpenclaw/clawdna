import { useState, useCallback, useRef, useEffect } from 'react'
import type { 
  Agent, 
  AgentTraits, 
  GenerationData, 
  SimulationConfig, 
  SimulationState 
} from '../types'
import { generateId } from '../lib/utils'

// Generate random traits
const generateRandomTraits = (): AgentTraits => ({
  speed: Math.random(),
  strength: Math.random(),
  intelligence: Math.random(),
  cooperation: Math.random(),
  adaptability: Math.random(),
})

// Calculate fitness
const calculateFitness = (traits: AgentTraits): number => {
  return Object.values(traits).reduce((sum, val) => sum + val, 0)
}

// Create initial population
const createPopulation = (size: number): Agent[] => {
  return Array.from({ length: size }, () => {
    const traits = generateRandomTraits()
    return {
      id: `A-${generateId()}`,
      generation: 0,
      fitness: calculateFitness(traits),
      traits,
      age: 0,
    }
  })
}

// Tournament selection
const tournamentSelect = (agents: Agent[], tournamentSize: number): Agent => {
  const tournament = []
  for (let i = 0; i < tournamentSize; i++) {
    tournament.push(agents[Math.floor(Math.random() * agents.length)])
  }
  return tournament.reduce((best, agent) => 
    agent.fitness > best.fitness ? agent : best
  )
}

// Crossover two agents
const crossover = (parent1: Agent, parent2: Agent, mutationRate: number, generation: number): Agent => {
  const childTraits: AgentTraits = {
    speed: Math.random() < 0.5 ? parent1.traits.speed : parent2.traits.speed,
    strength: Math.random() < 0.5 ? parent1.traits.strength : parent2.traits.strength,
    intelligence: Math.random() < 0.5 ? parent1.traits.intelligence : parent2.traits.intelligence,
    cooperation: Math.random() < 0.5 ? parent1.traits.cooperation : parent2.traits.cooperation,
    adaptability: Math.random() < 0.5 ? parent1.traits.adaptability : parent2.traits.adaptability,
  }

  let mutated = false
  // Mutate
  if (Math.random() < mutationRate) {
    const traitKeys = Object.keys(childTraits) as (keyof AgentTraits)[]
    const randomTrait = traitKeys[Math.floor(Math.random() * traitKeys.length)]
    const change = (Math.random() - 0.5) * 0.4
    childTraits[randomTrait] = Math.max(0, Math.min(1, childTraits[randomTrait] + change))
    mutated = true
  }

  return {
    id: `A-${generateId()}`,
    generation,
    fitness: calculateFitness(childTraits),
    traits: childTraits,
    age: 0,
    parents: [parent1.id, parent2.id],
    mutated,
  }
}

// Natural selection
const naturalSelection = (agents: Agent[], survivalRate: number): Agent[] => {
  const sorted = [...agents].sort((a, b) => b.fitness - a.fitness)
  const survivorsCount = Math.max(2, Math.floor(sorted.length * survivalRate))
  return sorted.slice(0, survivorsCount).map(a => ({ ...a, age: a.age + 1 }))
}

export function useSimulation(config: SimulationConfig) {
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    currentGeneration: 0,
    generations: [],
    agents: [],
    bestAgentEver: null,
    history: [],
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize population
  const initialize = useCallback(() => {
    const agents = createPopulation(config.populationSize)
    const bestAgent = agents.reduce((best, agent) => 
      agent.fitness > best.fitness ? agent : best
    )
    
    setState({
      isRunning: false,
      currentGeneration: 0,
      generations: [],
      agents,
      bestAgentEver: bestAgent,
      history: [...agents],
    })
  }, [config.populationSize])

  // Evolve one generation
  const evolve = useCallback(() => {
    setState(prev => {
      if (prev.agents.length === 0) return prev

      // Selection
      const survivors = naturalSelection(prev.agents, config.survivalRate)
      
      // Create offspring
      const offspring: Agent[] = []
      const targetSize = config.populationSize
      
      while (offspring.length < targetSize - survivors.length) {
        const parent1 = tournamentSelect(survivors, config.tournamentSize)
        const parent2 = tournamentSelect(survivors, config.tournamentSize)
        const child = crossover(parent1, parent2, config.mutationRate, prev.currentGeneration + 1)
        offspring.push(child)
      }

      const newAgents = [...survivors, ...offspring]
      const bestAgent = newAgents.reduce((best, agent) => 
        agent.fitness > best.fitness ? agent : best
      )

      const generationData: GenerationData = {
        generation: prev.currentGeneration + 1,
        averageFitness: newAgents.reduce((sum, a) => sum + a.fitness, 0) / newAgents.length,
        maxFitness: bestAgent.fitness,
        minFitness: Math.min(...newAgents.map(a => a.fitness)),
        bestAgent,
        populationSize: newAgents.length,
      }

      return {
        ...prev,
        currentGeneration: prev.currentGeneration + 1,
        agents: newAgents,
        generations: [...prev.generations, generationData],
        bestAgentEver: prev.bestAgentEver && prev.bestAgentEver.fitness > bestAgent.fitness 
          ? prev.bestAgentEver 
          : bestAgent,
        history: [...prev.history, bestAgent],
      }
    })
  }, [config])

  // Start auto evolution
  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }))
    intervalRef.current = setInterval(() => {
      evolve()
    }, config.evolutionSpeed)
  }, [evolve, config.evolutionSpeed])

  // Stop auto evolution
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState(prev => ({ ...prev, isRunning: false }))
  }, [])

  // Reset simulation
  const reset = useCallback(() => {
    stop()
    initialize()
  }, [stop, initialize])

  // Step forward one generation
  const step = useCallback(() => {
    evolve()
  }, [evolve])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    state,
    start,
    stop,
    reset,
    step,
  }
}
