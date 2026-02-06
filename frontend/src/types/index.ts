export interface Agent {
  id: string;
  name: string;
  generation: number;
  fitness: number;
  traits: Trait[];
  genome: Genome;
  parentIds?: [string, string];
  createdAt: Date;
  imageUrl?: string;
}

export interface Trait {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  category: 'cognitive' | 'physical' | 'social' | 'creative';
  color: string;
}

export interface Genome {
  hash: string;
  dna: DNASequence;
  mutationRate: number;
  generation: number;
}

export interface DNASequence {
  sequence: string;
  markers: Marker[];
}

export interface Marker {
  position: number;
  gene: string;
  value: number;
}

export interface BreedingPair {
  parent1: Agent;
  parent2: Agent;
  compatibility: number;
  predictedTraits: PredictedTrait[];
}

export interface PredictedTrait {
  name: string;
  minValue: number;
  maxValue: number;
  probability: number;
}

export interface EvolutionStats {
  generation: number;
  averageFitness: number;
  populationSize: number;
  topPerformer: Agent;
  mutations: number;
  timestamp: Date;
}

export interface LeaderboardEntry {
  rank: number;
  agent: Agent;
  score: number;
  achievements: string[];
}

export type TabId = 'all' | 'elite' | 'favorites' | 'recent';

export interface FilterOptions {
  generation?: number;
  minFitness?: number;
  traitCategory?: string;
  searchQuery?: string;
}
