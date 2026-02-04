"""
Evolution module for ClawDNA
Handles breeding, mutation, and selection
"""
import random
from .agent import Agent
from .genome import Genome


class Evolution:
    @staticmethod
    def crossover(agent1, agent2, mutation_rate=0.1):
        """Breed two agents to create offspring"""
        child_genome = Evolution._crossover_genomes(
            agent1.genome,
            agent2.genome
        )
        child_genome.mutate(mutation_rate)

        child = Agent(
            genome=child_genome,
            generation=max(agent1.generation, agent2.generation) + 1
        )
        return child

    @staticmethod
    def _crossover_genomes(genome1, genome2):
        """Crossover two genomes (single-point)"""
        child_traits = {}
        for trait in genome1.traits:
            # Randomly select from either parent
            if random.random() < 0.5:
                child_traits[trait] = genome1.traits[trait]
            else:
                child_traits[trait] = genome2.traits[trait]
        return Genome(child_traits)

    @staticmethod
    def mutate(agent, mutation_rate=0.1):
        """Mutate an agent's genome"""
        agent.genome.mutate(mutation_rate)

    @staticmethod
    def select(population, tournament_size=3):
        """Tournament selection - pick the fittest from a random subset"""
        tournament = random.sample(population, min(tournament_size, len(population)))
        return max(tournament, key=lambda a: a.fitness)

    @staticmethod
    def natural_selection(population, survival_rate=0.5):
        """Select survivors based on fitness ranking"""
        sorted_pop = sorted(population, key=lambda a: a.fitness, reverse=True)
        survivors_count = max(1, int(len(population) * survival_rate))
        return sorted_pop[:survivors_count]
