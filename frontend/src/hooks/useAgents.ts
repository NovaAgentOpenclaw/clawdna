import { useState, useEffect, useCallback } from "react";
import type { Agent } from "@/types";

const MOCK_AGENTS: Agent[] = [
  {
    id: "agent-001",
    name: "Alpha Prime",
    generation: 42,
    fitness: 987,
    traits: [
      { id: "t1", name: "Intelligence", value: 95, maxValue: 100, category: "cognitive", color: "#00F0FF" },
      { id: "t2", name: "Speed", value: 88, maxValue: 100, category: "physical", color: "#00FF88" },
      { id: "t3", name: "Charisma", value: 72, maxValue: 100, category: "social", color: "#A855F7" },
      { id: "t4", name: "Creativity", value: 91, maxValue: 100, category: "creative", color: "#FFD700" },
    ],
    genome: {
      hash: "0x7f3a9e2b1c5d8f4e6a0b",
      dna: { sequence: "ATCGATCGATCGATCGATCGATCGATCGATCG", markers: [] },
      mutationRate: 0.02,
      generation: 42,
    },
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "agent-002",
    name: "Beta Nova",
    generation: 41,
    fitness: 923,
    traits: [
      { id: "t1", name: "Intelligence", value: 89, maxValue: 100, category: "cognitive", color: "#00F0FF" },
      { id: "t2", name: "Speed", value: 95, maxValue: 100, category: "physical", color: "#00FF88" },
      { id: "t3", name: "Charisma", value: 85, maxValue: 100, category: "social", color: "#A855F7" },
      { id: "t4", name: "Creativity", value: 76, maxValue: 100, category: "creative", color: "#FFD700" },
    ],
    genome: {
      hash: "0x8e4b0f3c2d6a9e5b7c1d",
      dna: { sequence: "CGATCGATCGATCGATCGATCGATCGATCGAT", markers: [] },
      mutationRate: 0.015,
      generation: 41,
    },
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "agent-003",
    name: "Gamma Core",
    generation: 43,
    fitness: 956,
    traits: [
      { id: "t1", name: "Intelligence", value: 92, maxValue: 100, category: "cognitive", color: "#00F0FF" },
      { id: "t2", name: "Speed", value: 82, maxValue: 100, category: "physical", color: "#00FF88" },
      { id: "t3", name: "Charisma", value: 91, maxValue: 100, category: "social", color: "#A855F7" },
      { id: "t4", name: "Creativity", value: 88, maxValue: 100, category: "creative", color: "#FFD700" },
    ],
    genome: {
      hash: "0x9f5c1g4d3e7b0f6a8c2e",
      dna: { sequence: "GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA", markers: [] },
      mutationRate: 0.025,
      generation: 43,
    },
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "agent-004",
    name: "Delta Pulse",
    generation: 40,
    fitness: 891,
    traits: [
      { id: "t1", name: "Intelligence", value: 85, maxValue: 100, category: "cognitive", color: "#00F0FF" },
      { id: "t2", name: "Speed", value: 91, maxValue: 100, category: "physical", color: "#00FF88" },
      { id: "t3", name: "Charisma", value: 78, maxValue: 100, category: "social", color: "#A855F7" },
      { id: "t4", name: "Creativity", value: 84, maxValue: 100, category: "creative", color: "#FFD700" },
    ],
    genome: {
      hash: "0xa6d2h5i4f8c1g7b9d3f",
      dna: { sequence: "TAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC", markers: [] },
      mutationRate: 0.018,
      generation: 40,
    },
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "agent-005",
    name: "Echo Spark",
    generation: 44,
    fitness: 972,
    traits: [
      { id: "t1", name: "Intelligence", value: 94, maxValue: 100, category: "cognitive", color: "#00F0FF" },
      { id: "t2", name: "Speed", value: 87, maxValue: 100, category: "physical", color: "#00FF88" },
      { id: "t3", name: "Charisma", value: 89, maxValue: 100, category: "social", color: "#A855F7" },
      { id: "t4", name: "Creativity", value: 93, maxValue: 100, category: "creative", color: "#FFD700" },
    ],
    genome: {
      hash: "0xb7e3i6j5g9d2h8c0e4g",
      dna: { sequence: "ATGCATGCATGCATGCATGCATGCATGCATGC", markers: [] },
      mutationRate: 0.022,
      generation: 44,
    },
    createdAt: new Date("2024-01-17"),
  },
  {
    id: "agent-006",
    name: "Flux Node",
    generation: 39,
    fitness: 856,
    traits: [
      { id: "t1", name: "Intelligence", value: 82, maxValue: 100, category: "cognitive", color: "#00F0FF" },
      { id: "t2", name: "Speed", value: 86, maxValue: 100, category: "physical", color: "#00FF88" },
      { id: "t3", name: "Charisma", value: 75, maxValue: 100, category: "social", color: "#A855F7" },
      { id: "t4", name: "Creativity", value: 81, maxValue: 100, category: "creative", color: "#FFD700" },
    ],
    genome: {
      hash: "0xc8f4j7k6h0e3i9d1f5h",
      dna: { sequence: "GCATGCATGCATGCATGCATGCATGCATGCAT", markers: [] },
      mutationRate: 0.012,
      generation: 39,
    },
    createdAt: new Date("2024-01-12"),
  },
];

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAgents(MOCK_AGENTS);
      } catch (err) {
        setError("Failed to load agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const refreshAgents = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
  }, []);

  return { agents, loading, error, refreshAgents };
}

export function useAgent(id: string | null) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchAgent = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const found = MOCK_AGENTS.find((a) => a.id === id);
        setAgent(found || null);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  return { agent, loading };
}
