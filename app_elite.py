"""
ClawDNA ELITE Frontend - Superior Version
Advanced multi-agent visualization with subagents, breeding, and real-time evolution
"""
from flask import Flask, render_template, jsonify
from flask_cors import CORS
import random
from src.core.agent import Agent
from src.core.evolution import Evolution
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Subagent avatars (8 unique styles)
AVATAR_STYLES = [
    {'bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'emoji': '🧬', 'name': 'Evolver'},
    {'bg': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'emoji': '🦊', 'name': 'Dolphin'},
    {'bg': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'emoji': '🚀', 'name': 'Rocket'},
    {'bg': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'emoji': '🎯', 'name': 'Sniper'},
    {'bg': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 'emoji': '⚡', 'name': 'Bolt'},
    {'bg': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', 'emoji': '🌊', 'name': 'Wave'},
    {'bg': 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)', 'emoji': '💎', 'name': 'Diamond'},
    {'bg': 'linear-gradient(135deg, #fa8231 0%, #f6d365 100%)', 'emoji': '🔮', 'name': 'Crystal'},
]

# Global state
state = {
    'subagents': [],
    'generation': 0,
    'history': {'avg_fitness': [], 'max_fitness': []},
    'breeding_queue': [],
    'best_agents': []
}


def initialize_subagents(count=8):
    """Initialize 8 subagents with unique styles"""
    global state
    state['subagents'] = []
    
    for i in range(count):
        agent = Agent(generation=0)
        agent.calculate_fitness()
        
        style_idx = i % len(AVATAR_STYLES)
        subagent = {
            'id': i,
            'agent': agent,
            'style': AVATAR_STYLES[style_idx],
            'last_evolved': datetime.now().strftime('%H:%M:%S'),
            'total_breedings': 0,
            'offspring_count': 0
        }
        state['subagents'].append(subagent)
    
    # Record initial stats
    avg_fitness = sum(a['agent'].fitness for a in state['subagents']) / len(state['subagents'])
    max_fitness = max(a['agent'].fitness for a in state['subagents'])
    state['history']['avg_fitness'].append(avg_fitness)
    state['history']['max_fitness'].append(max_fitness)


def evolve_population():
    """Evolve entire population with breeding"""
    global state
    
    # Select parents based on fitness (top 50% can breed)
    sorted_agents = sorted(state['subagents'], key=lambda x: x['agent'].fitness, reverse=True)
    breedable = sorted_agents[:int(len(sorted_agents) * 0.5)]
    
    # Create offspring
    offspring_count = len(state['subagents'])
    offspring = []
    
    for _ in range(offspring_count):
        if len(breedable) < 2:
            break
        
        # Random selection from breedable pool
        parent1 = random.choice(breedable)
        parent2 = random.choice([a for a in breedable if a['id'] != parent1['id']])
        
        # Crossover
        child_agent = Evolution.crossover(parent1['agent'], parent2['agent'], mutation_rate=0.15)
        
        # Mutate
        child_agent.genome.mutate(mutation_rate=0.15)
        child_agent.calculate_fitness()
        
        # Assign style (blend of parents or random)
        if random.random() < 0.5:
            # Inherit style from better parent
            child_style = parent1['style'] if parent1['agent'].fitness > parent2['agent'].fitness else parent2['style']
        else:
            # Random new style
            child_style = AVATAR_STYLES[random.randint(0, len(AVATAR_STYLES) - 1)]
        
        child = {
            'id': len(state['subagents']) + len(offspring),
            'agent': child_agent,
            'style': child_style,
            'last_evolved': datetime.now().strftime('%H:%M:%S'),
            'total_breedings': 0,
            'offspring_count': 0
        }
        offspring.append(child)
    
    # Natural selection: keep top 40%
    all_agents = state['subagents'] + offspring
    sorted_all = sorted(all_agents, key=lambda x: x['agent'].fitness, reverse=True)
    survivors_count = max(1, int(len(all_agents) * 0.4))
    state['subagents'] = sorted_all[:survivors_count]
    
    # Update generation and history
    state['generation'] += 1
    avg_fitness = sum(a['agent'].fitness for a in state['subagents']) / len(state['subagents'])
    max_fitness = max(a['agent'].fitness for a in state['subagents'])
    state['history']['avg_fitness'].append(avg_fitness)
    state['history']['max_fitness'].append(max_fitness)
    
    # Track best agents
    state['best_agents'].append({
        'generation': state['generation'],
        'best_fitness': max_fitness,
        'best_agent_id': max(range(len(state['subagents'])), key=lambda i: state['subagents'][i]['agent'].fitness),
        'timestamp': datetime.now().strftime('%H:%M:%S')
    })
    
    # Keep only last 20 best agents
    if len(state['best_agents']) > 20:
        state['best_agents'] = state['best_agents'][-20:]


def breed_specific_agents(agent1_id, agent2_id):
    """Manually breed two specific agents"""
    global state
    
    if agent1_id == agent2_id:
        return {'error': 'Cannot breed same agent'}
    
    agent1 = next((a for a in state['subagents'] if a['id'] == agent1_id), None)
    agent2 = next((a for a in state['subagents'] if a['id'] == agent2_id), None)
    
    if not agent1 or not agent2:
        return {'error': 'Agent not found'}
    
    # Create offspring
    child_agent = Evolution.crossover(agent1['agent'], agent2['agent'], mutation_rate=0.15)
    child_agent.genome.mutate(mutation_rate=0.15)
    child_agent.calculate_fitness()
    
    # Style blend
    child_style = agent1['style'] if agent1['agent'].fitness > agent2['agent'].fitness else agent2['style']
    
    child = {
        'id': len(state['subagents']),
        'agent': child_agent,
        'style': child_style,
        'last_evolved': datetime.now().strftime('%H:%M:%S'),
        'total_breedings': 0,
        'offspring_count': 0
    }
    
    # Add to queue
    state['breeding_queue'].append(child)
    
    # Update parent stats
    agent1['total_breedings'] += 1
    agent2['total_breedings'] += 1
    agent1['offspring_count'] += 1
    agent2['offspring_count'] += 1
    
    return {'success': True, 'child_id': child['id'], 'child_fitness': child_agent.fitness}


@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')


@app.route('/api/init')
def api_init():
    """Initialize subagents"""
    initialize_subagents(count=8)
    return jsonify({
        'success': True,
        'subagents_count': len(state['subagents']),
        'generation': state['generation']
    })


@app.route('/api/status')
def api_status():
    """Get complete status"""
    return jsonify({
        'subagents': [{
            'id': s['id'],
            'style': s['style'],
            'generation': s['agent'].generation,
            'fitness': s['agent'].fitness,
            'traits': s['agent'].genome.traits,
            'last_evolved': s['last_evolved'],
            'total_breedings': s['total_breedings'],
            'offspring_count': s['offspring_count']
        } for s in state['subagents']],
        'generation': state['generation'],
        'history': state['history'],
        'breeding_queue_size': len(state['breeding_queue']),
        'best_agents': state['best_agents'][-10:] if state['best_agents'] else []
    })


@app.route('/api/evolve')
def api_evolve():
    """Evolve entire population"""
    if not state['subagents']:
        initialize_subagents()
    
    evolve_population()
    
    return jsonify({
        'success': True,
        'generation': state['generation'],
        'avg_fitness': state['history']['avg_fitness'][-1],
        'max_fitness': state['history']['max_fitness'][-1],
        'subagents': [{
            'id': s['id'],
            'style': s['style'],
            'fitness': s['agent'].fitness
        } for s in state['subagents']],
        'best_agent': {
            'id': max(range(len(state['subagents'])), key=lambda i: state['subagents'][i]['agent'].fitness),
            'style': state['subagents'][max(range(len(state['subagents'])), key=lambda i: state['subagents'][i]['agent'].fitness)]['style'],
            'fitness': max(s['agent'].fitness for s in state['subagents'])
        }
    })


@app.route('/api/breed', methods=['POST'])
def api_breed():
    """Manually breed two agents"""
    try:
        data = json.loads(request.data)
        agent1_id = data.get('agent1_id')
        agent2_id = data.get('agent2_id')
        
        result = breed_specific_agents(agent1_id, agent2_id)
        
        return jsonify(result)
    except:
        return jsonify({'error': 'Invalid request'}), 400


@app.route('/api/auto-evolve', methods=['POST'])
def api_auto_evolve():
    """Auto evolve for N generations"""
    try:
        data = json.loads(request.data)
        generations = data.get('generations', 10)
        
        for _ in range(generations):
            evolve_population()
        
        return jsonify({
            'success': True,
            'generations_completed': generations,
            'final_generation': state['generation'],
            'final_avg_fitness': state['history']['avg_fitness'][-1],
            'final_max_fitness': state['history']['max_fitness'][-1]
        })
    except:
        return jsonify({'error': 'Invalid request'}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
