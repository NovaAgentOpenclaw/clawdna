"""
Genome class for ClawDNA
Handles traits and genetic encoding
"""
import random


class Genome:
    def __init__(self, traits=None):
        if traits is None:
            self.traits = self._random_traits()
        else:
            self.traits = traits.copy()

    def _random_traits(self):
        """Generate random traits for a new genome"""
        return {
            'speed': random.uniform(0, 1),
            'strength': random.uniform(0, 1),
            'intelligence': random.uniform(0, 1),
            'cooperation': random.uniform(0, 1),
            'adaptability': random.uniform(0, 1)
        }

    def mutate(self, mutation_rate=0.1):
        """Randomly mutate traits"""
        for trait in self.traits:
            if random.random() < mutation_rate:
                change = random.uniform(-0.2, 0.2)
                self.traits[trait] = max(0, min(1, self.traits[trait] + change))

    def __repr__(self):
        return f"Genome(traits={self.traits})"
