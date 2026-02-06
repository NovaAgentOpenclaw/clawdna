"use client";

import { useState, useEffect, useCallback } from "react";

interface EvolutionState {
  generation: number;
  isEvolving: boolean;
  progress: number;
  stats: {
    populationSize: number;
    averageFitness: number;
    mutations: number;
    survivors: number;
  };
}

const INITIAL_STATE: EvolutionState = {
  generation: 44,
  isEvolving: false,
  progress: 0,
  stats: {
    populationSize: 256,
    averageFitness: 892,
    mutations: 12,
    survivors: 128,
  },
};

export function useEvolution() {
  const [state, setState] = useState<EvolutionState>(INITIAL_STATE);

  const evolve = useCallback(async () => {
    if (state.isEvolving) return;

    setState((prev) => ({ ...prev, isEvolving: true, progress: 0 }));

    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setState((prev) => ({
        ...prev,
        progress: (i / steps) * 100,
        stats: {
          ...prev.stats,
          mutations: prev.stats.mutations + Math.floor(Math.random() * 2),
        },
      }));
    }

    setState((prev) => ({
      generation: prev.generation + 1,
      isEvolving: false,
      progress: 100,
      stats: {
        populationSize: prev.stats.populationSize + Math.floor(Math.random() * 20 - 5),
        averageFitness: Math.min(1000, prev.stats.averageFitness + Math.floor(Math.random() * 30)),
        mutations: prev.stats.mutations,
        survivors: Math.floor(prev.stats.populationSize * 0.5),
      },
    }));
  }, [state.isEvolving]);

  return {
    ...state,
    evolve,
  };
}
