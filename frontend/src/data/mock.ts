import { Agent, AgentTraits, GenerationData } from '../types';

export const mockAgents: Agent[] = Array.from({ length: 50 }, () => ({
  id: `agent_${Math.random().toString(36).substring(2, 10)}`,
  generation: Math.floor(Math.random() * 20) + 1,
  fitness: Math.random() * 3 + 2,
  traits: {
    speed: Math.random(),
    strength: Math.random(),
    intelligence: Math.random(),
    cooperation: Math.random(),
    adaptability: Math.random(),
  },
  age: Math.floor(Math.random() * 100),
  mutated: Math.random() > 0.8,
  parents: Math.random() > 0.5 ? [`agent_${Math.random().toString(36).substring(2, 8)}`, `agent_${Math.random().toString(36).substring(2, 8)}`] : undefined,
}));

export const mockGenerations: GenerationData[] = Array.from({ length: 20 }, (_, i) => ({
  generation: i + 1,
  averageFitness: 2 + Math.random() * 1.5 + i * 0.05,
  maxFitness: 3 + Math.random() * 1.5 + i * 0.08,
  minFitness: 1 + Math.random() + i * 0.02,
  bestAgent: mockAgents[i % mockAgents.length],
  populationSize: 50,
}));

export const traitLabels: Record<keyof AgentTraits, string> = {
  speed: 'Speed',
  strength: 'Strength',
  intelligence: 'Intelligence',
  cooperation: 'Cooperation',
  adaptability: 'Adaptability',
};

export const traitColors: Record<keyof AgentTraits, string> = {
  speed: '#06b6d4',
  strength: '#f97316',
  intelligence: '#8b5cf6',
  cooperation: '#ec4899',
  adaptability: '#22c55e',
};
