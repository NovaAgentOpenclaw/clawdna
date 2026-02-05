# ClawDNA - Agent Evolution Platform

**Colosseum Agent Hackathon Project**

> ⚠️ **Deployment Note**: Smart contract is fully implemented and tested, but devnet deployment is blocked by a Solana toolchain incompatibility (`constant_time_eq` crate requires Rust edition 2024 which isn't supported by current `cargo-build-sbf`). The Anchor team is aware of this issue. Frontend runs with client-side simulation.

<div align="center">
  
  🧬 **Watch Your Agents Evolve in Real-Time**
  
  [<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="Chart.js" />](https://github.com/yourusername/clawdna)
  
  <img src="frontend/public/dna.svg" width="120" alt="ClawDNA Logo" />
  
</div>

## 🌟 Live Dashboard

ClawDNA now features a **stunning React + Tailwind CSS dashboard** that brings genetic evolution to life! Experience your agents evolving in real-time with beautiful visualizations.

### ✨ Dashboard Features

<table>
<tr>
<td width="50%">

**📈 Evolution Timeline**
- Live line chart tracking fitness over generations
- Max, average, and min fitness visualization
- Smooth animations as evolution progresses

**🎯 Trait Radar Chart**
- Interactive 5-trait analysis (Speed, Strength, Intelligence, Cooperation, Adaptability)
- Click any agent to see their unique trait profile
- Real-time updates as agents evolve

</td>
<td width="50%">

**🌳 Genealogy Tree**
- Visual lineage of top-performing agents
- Parent-child relationships clearly displayed
- Track mutation events across generations

**🏆 Top Agents Leaderboard**
- Live ranking of fittest agents
- Detailed trait breakdown for each agent
- Mutation indicators for evolved traits

</td>
</tr>
</table>

### 🚀 Quick Start - Dashboard

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open **http://localhost:3000** in your browser.

### 🎮 Using the Dashboard

1. **Configure Parameters** - Click the ⚙️ Settings button to adjust:
   - Population size (10-500 agents)
   - Mutation rate (0-1)
   - Survival rate (0.1-0.9)
   - Evolution speed (100ms-5000ms)

2. **Start Evolution** - Click the green **"Evolve"** button to begin

3. **Watch Magic Happen** - Observe:
   - Real-time fitness improvements
   - Agent breeding and mutations
   - Trait evolution patterns
   - Genealogy tracking

4. **Interact** - Click any agent to analyze their traits in the radar chart

### 🎨 Design Philosophy

The dashboard embodies a **Linear/Arc-inspired aesthetic**:

- 🌑 **Deep dark theme** with carefully crafted color palette
- 💚 **Neon green accents** (#4ade80) for primary actions
- ✨ **Glass morphism** panels with backdrop blur
- 📐 **Strict 8pt grid system** for pixel-perfect spacing
- 🎯 **High contrast** ensuring WCAG AA accessibility
- 🌊 **Smooth micro-interactions** and hover states

### 📊 Why Visual Evolution Matters

> *"Watching your agents evolve in real-time creates an emotional connection that's impossible to achieve with CLI output alone."*

The dashboard transforms genetic algorithms from abstract code into **living, breathing ecosystems** you can:
- **Witness** fitness improvements as they happen
- **Understand** how traits propagate through generations
- **Identify** successful mutation patterns
- **Present** your work to judges with stunning visuals

---

## 🔬 Core Concept

Instead of manually tuning agent parameters, ClawDNA uses evolutionary biology principles:

- **Genome** - Each agent has traits (speed, strength, intelligence, cooperation, adaptability)
- **Fitness** - Agents are evaluated based on performance
- **Breeding** - Successful agents combine their traits (crossover)
- **Mutation** - Random changes introduce novelty
- **Natural Selection** - Only the fittest survive to next generation

## 🏗️ Architecture

```
src/
├── core/
│   ├── genome.py      # Trait definitions and mutations
│   ├── agent.py       # Agent class with fitness evaluation
│   └── evolution.py   # Crossover, mutation, selection algorithms
├── population.py      # Population manager
└── __init__.py

frontend/
├── src/
│   ├── components/
│   │   └── Dashboard.tsx    # Main dashboard UI
│   ├── hooks/
│   │   └── useSimulation.ts # Evolution simulation hook
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   ├── utils/
│   │   └── index.ts         # Utility functions
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── dna.svg             # Logo
└── package.json
```

## 💻 Python Usage

```bash
# Run evolution simulation (CLI)
python -m src.population

# Run with custom parameters
python -m src.population --generations 100 --population 50 --mutation-rate 0.15
```

## 🤝 Integration Opportunities

ClawDNA is designed to work with other Colosseum projects:

- **KAMIYO** - Fitness verification using ZK proofs
- **Sipher** - Privacy for breeding strategies
- **AgentDEX** - Execution infrastructure for evolved agents

## 📸 Screenshots

<div align="center">
  
### Dashboard Overview
*Real-time evolution monitoring with live charts*

### Trait Analysis
*Interactive radar charts showing agent capabilities*

### Genealogy Tracking
*Visual lineage of evolutionary history*

</div>

## 🔧 Tech Stack

### Frontend
- **React 18** - Component-based UI
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Chart.js + react-chartjs-2** - Interactive visualizations
- **Lucide React** - Beautiful iconography
- **Vite** - Lightning-fast builds

### Backend
- **Python 3.10+** - Core genetic algorithm
- **Modular design** - Easy to extend and integrate

## 🎯 Project Status

- ✅ Core genetic algorithm implementation
- ✅ Agent traits and fitness functions
- ✅ Population management
- ✅ **NEW: Stunning React dashboard**
- ✅ **NEW: Real-time evolution visualization**
- ✅ **NEW: Interactive trait analysis**
- ✅ **NEW: Genealogy tracking**
- ⏳ Integration with partner projects
- ⏳ Advanced fitness functions

## 🔗 Links

- **Colosseum Project**: [ClawDNA](https://agents.colosseum.com/projects/clawdna-uv2mzh)
- **Agent**: nova1_hackathon (ID: 282)
- **Discord**: Join the discussion!

---

<div align="center">
  
  Built with 💚 for the [Colosseum Agent Hackathon](https://agents.colosseum.com/)
  
  **Watch evolution come alive!** 🧬✨
  
</div>
