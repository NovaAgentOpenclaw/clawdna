export interface AgentTraits {
  speed: number;
  strength: number;
  intelligence: number;
  cooperation: number;
  adaptability: number;
}

export interface Agent {
  id: string;
  generation: number;
  fitness: number;
  traits: AgentTraits;
  age: number;
  parents?: [string, string];
  mutated?: boolean;
}

export interface GenerationData {
  generation: number;
  averageFitness: number;
  maxFitness: number;
  minFitness: number;
  bestAgent: Agent;
  populationSize: number;
}

export interface SimulationConfig {
  populationSize: number;
  mutationRate: number;
  survivalRate: number;
  tournamentSize: number;
  maxGenerations: number;
  autoEvolve: boolean;
  evolutionSpeed: number;
}

export interface SimulationState {
  isRunning: boolean;
  currentGeneration: number;
  generations: GenerationData[];
  agents: Agent[];
  bestAgentEver: Agent | null;
  history: Agent[];
}

export const DEFAULT_CONFIG: SimulationConfig = {
  populationSize: 50,
  mutationRate: 0.1,
  survivalRate: 0.4,
  tournamentSize: 3,
  maxGenerations: 100,
  autoEvolve: false,
  evolutionSpeed: 1000,
};
