"""
Agent base class for ClawDNA
Contains genome, fitness, and generation tracking
"""
from .genome import Genome


class Agent:
    def __init__(self, genome=None, generation=0):
        self.genome = genome if genome else Genome()
        self.fitness = 0.0
        self.generation = generation
        self.age = 0

    def calculate_fitness(self):
        """Calculate fitness based on genome traits
        Override this for specific fitness functions
        """
        # Simple fitness function: sum of all traits
        self.fitness = sum(self.genome.traits.values())
        return self.fitness

    def evolve(self, mutation_rate=0.1):
        """Mutate the agent's genome"""
        self.genome.mutate(mutation_rate)

    def __repr__(self):
        return f"Agent(fitness={self.fitness:.2f}, gen={self.generation})"
