"""
Population manager for ClawDNA
Manages a population of agents
"""
import random
from src.core.agent import Agent
from src.core.evolution import Evolution


class Population:
    def __init__(self, size=10, mutation_rate=0.1):
        self.size = size
        self.mutation_rate = mutation_rate
        self.agents = [Agent(generation=0) for _ in range(size)]
        self.generation = 0

    def evaluate(self):
        """Calculate fitness for all agents"""
        for agent in self.agents:
            agent.calculate_fitness()

    def evolve(self, offspring_count=None):
        """Evolve the population through breeding and selection"""
        self.evaluate()

        if offspring_count is None:
            offspring_count = self.size

        # Select survivors
        survivors = Evolution.natural_selection(self.agents, survival_rate=0.4)

        # Create offspring
        offspring = []
        while len(offspring) < offspring_count:
            parent1 = Evolution.select(survivors)
            parent2 = Evolution.select(survivors)
            child = Evolution.crossover(parent1, parent2, self.mutation_rate)
            offspring.append(child)

        # New population: survivors + offspring
        self.agents = survivors + offspring[:self.size - len(survivors)]
        self.generation += 1

    def get_best_agent(self):
        """Get the agent with highest fitness"""
        self.evaluate()
        return max(self.agents, key=lambda a: a.fitness)

    def get_average_fitness(self):
        """Get average fitness of population"""
        self.evaluate()
        total_fitness = sum(a.fitness for a in self.agents)
        return total_fitness / len(self.agents)

    def __repr__(self):
        return f"Population(size={len(self.agents)}, gen={self.generation})"


def main():
    """Run evolution simulation"""
    print("🧬 ClawDNA - Agent Evolution Simulation")
    print("=" * 50)
    
    # Create population
    pop = Population(size=20, mutation_rate=0.1)
    print(f"\nStarting population: {pop}")
    print(f"Initial avg fitness: {pop.get_average_fitness():.2f}")
    
    # Run evolution for 10 generations
    print("\n🔄 Running evolution...")
    for gen in range(10):
        pop.evolve()
        best = pop.get_best_agent()
        avg = pop.get_average_fitness()
        print(f"Gen {gen+1:2d}: avg_fitness={avg:5.2f}, max_fitness={best.fitness:5.2f}")
    
    # Show final results
    print("\n✅ Evolution complete!")
    best_agent = pop.get_best_agent()
    print(f"\nBest agent:")
    print(f"  Generation: {best_agent.generation}")
    print(f"  Fitness: {best_agent.fitness:.2f}")
    print(f"  Genome: {best_agent.genome}")


if __name__ == "__main__":
    main()
