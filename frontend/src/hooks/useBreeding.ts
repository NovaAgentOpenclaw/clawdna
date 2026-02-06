"use client";

import { useState, useCallback } from "react";
import type { Agent } from "@/types";

export function useBreeding() {
  const [parent1, setParent1] = useState<Agent | null>(null);
  const [parent2, setParent2] = useState<Agent | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [result, setResult] = useState<Agent | null>(null);

  const selectParent = useCallback((agent: Agent, slot: 1 | 2) => {
    if (slot === 1) {
      setParent1(agent);
    } else {
      setParent2(agent);
    }
  }, []);

  const clearParent = useCallback((slot: 1 | 2) => {
    if (slot === 1) {
      setParent1(null);
    } else {
      setParent2(null);
    }
  }, []);

  const canBreed = parent1 && parent2 && parent1.id !== parent2.id;

  const breed = useCallback(async () => {
    if (!canBreed) return;

    setIsBreeding(true);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const child: Agent = {
      id: `agent-${Date.now()}`,
      name: `Child of ${parent1.name} & ${parent2.name}`,
      generation: Math.max(parent1.generation, parent2.generation) + 1,
      fitness: Math.round((parent1.fitness + parent2.fitness) / 2 * (0.9 + Math.random() * 0.2)),
      traits: parent1.traits.map((trait) => {
        const parent2Trait = parent2.traits.find((t) => t.name === trait.name);
        const baseValue = parent2Trait
          ? (trait.value + parent2Trait.value) / 2
          : trait.value;
        const mutation = (Math.random() - 0.5) * 10;
        return {
          ...trait,
          value: Math.min(100, Math.max(0, Math.round(baseValue + mutation))),
        };
      }),
      genome: {
        hash: `0x${Array.from({ length: 20 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")}`,
        dna: { sequence: "ATCG".repeat(8), markers: [] },
        mutationRate: (parent1.genome.mutationRate + parent2.genome.mutationRate) / 2,
        generation: Math.max(parent1.generation, parent2.generation) + 1,
      },
      parentIds: [parent1.id, parent2.id],
      createdAt: new Date(),
    };

    setResult(child);
    setIsBreeding(false);
  }, [canBreed, parent1, parent2]);

  const reset = useCallback(() => {
    setParent1(null);
    setParent2(null);
    setResult(null);
  }, []);

  return {
    parent1,
    parent2,
    canBreed,
    isBreeding,
    result,
    selectParent,
    clearParent,
    breed,
    reset,
  };
}
