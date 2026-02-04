"""
ClawDNA Web Demo
Flask app for visual evolution demo
"""
from flask import Flask, render_template, jsonify
from src.core.agent import Agent
from src.core.evolution import Evolution
import random

app = Flask(__name__)

# Global population state
population = {
    'agents': [],
    'generation': 0,
    'history': []
}


def initialize_population(size=20):
    """Initialize a new population"""
    global population
    population['agents'] = [Agent(generation=0) for _ in range(size)]
    population['generation'] = 0
    population['history'] = []
    
    # Calculate initial fitness
    for agent in population['agents']:
        agent.calculate_fitness()
    
    # Record initial state
    avg_fitness = sum(a.fitness for a in population['agents']) / len(population['agents'])
    max_fitness = max(a.fitness for a in population['agents'])
    population['history'].append({
        'generation': 0,
        'avg_fitness': avg_fitness,
        'max_fitness': max_fitness
    })


def evolve_generation():
    """Evolve the population by one generation"""
    global population
    
    # Evaluate current generation
    for agent in population['agents']:
        agent.calculate_fitness()
    
    # Select survivors (40% survival rate)
    survivors = Evolution.natural_selection(population['agents'], survival_rate=0.4)
    
    # Create offspring
    offspring = []
    size = len(population['agents'])
    while len(offspring) < size - len(survivors):
        parent1 = Evolution.select(survivors)
        parent2 = Evolution.select(survivors)
        child = Evolution.crossover(parent1, parent2, mutation_rate=0.1)
        offspring.append(child)
    
    # New population
    population['agents'] = survivors + offspring
    population['generation'] += 1
    
    # Calculate fitness for new generation
    for agent in population['agents']:
        agent.calculate_fitness()
    
    # Record state
    avg_fitness = sum(a.fitness for a in population['agents']) / len(population['agents'])
    max_fitness = max(a.fitness for a in population['agents'])
    population['history'].append({
        'generation': population['generation'],
        'avg_fitness': avg_fitness,
        'max_fitness': max_fitness
    })


@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')


@app.route('/api/init')
def api_init():
    """Initialize population"""
    initialize_population(size=20)
    return jsonify({
        'success': True,
        'generation': population['generation'],
        'population_size': len(population['agents'])
    })


@app.route('/api/evolve')
def api_evolve():
    """Evolve one generation"""
    if not population['agents']:
        initialize_population()
    
    evolve_generation()
    
    return jsonify({
        'success': True,
        'generation': population['generation'],
        'history': population['history']
    })


@app.route('/api/status')
def api_status():
    """Get current status"""
    if not population['agents']:
        return jsonify({
            'initialized': False,
            'generation': 0,
            'history': []
        })
    
    # Get best agent
    best_agent = max(population['agents'], key=lambda a: a.fitness)
    
    return jsonify({
        'initialized': True,
        'generation': population['generation'],
        'population_size': len(population['agents']),
        'history': population['history'],
        'best_agent': {
            'generation': best_agent.generation,
            'fitness': best_agent.fitness,
            'traits': best_agent.genome.traits
        }
    })


@app.route('/api/agents')
def api_agents():
    """Get all agents in current population"""
    if not population['agents']:
        return jsonify({'agents': []})
    
    agents_data = []
    for i, agent in enumerate(population['agents']):
        agents_data.append({
            'id': i,
            'generation': agent.generation,
            'fitness': agent.fitness,
            'traits': agent.genome.traits
        })
    
    return jsonify({'agents': agents_data})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
