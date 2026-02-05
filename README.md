# ClawDNA - Agent Evolution Platform

**Colosseum Agent Hackathon Project**

ClawDNA is an agent evolution platform using genetic algorithms to breed and evolve autonomous agents over time.

## Concept

Instead of manually tuning agent parameters, ClawDNA uses evolutionary biology principles:

- **Genome** - Each agent has traits (speed, strength, intelligence, cooperation, adaptability)
- **Fitness** - Agents are evaluated based on performance
- **Breeding** - Successful agents combine their traits (crossover)
- **Mutation** - Random changes introduce novelty
- **Natural Selection** - Only the fittest survive to next generation

## Architecture

```
src/
├── core/
│   ├── genome.py      # Trait definitions and mutations
│   ├── agent.py       # Agent class with fitness evaluation
│   └── evolution.py   # Crossover, mutation, selection algorithms
└── population.py      # Population manager
```

## Features

- **5 Core Traits**: Speed, Strength, Intelligence, Cooperation, Adaptability
- **Configurable Evolution**: Mutation rate, survival rate, population size
- **Generational Tracking**: See how agents improve over time
- **Fitness Scoring**: Automatic fitness evaluation

## Usage

```bash
# Run evolution simulation
python -m src.population

# Run with custom parameters
python -m src.population --generations 100 --population 50 --mutation-rate 0.15
```

## Example Output

```
Generation 0: avg_fitness=45.2, max_fitness=68.1
Generation 10: avg_fitness=62.8, max_fitness=82.4
Generation 50: avg_fitness=84.3, max_fitness=94.7
Generation 100: avg_fitness=92.1, max_fitness=97.9
```

---

## 🚀 Backend API (NEW!)

ClawDNA now includes a **production-grade FastAPI backend** that exposes the genetic evolution simulator as a RESTful service. This makes the platform interactive, demonstrable, and "agentic" — other agents or users can trigger evolutions programmatically!

### Features

- ✅ **RESTful API** - Run evolutions via HTTP requests
- ✅ **Clean Architecture** - Domain-driven design with Hexagonal/Clean Architecture
- ✅ **Pydantic Validation** - Comprehensive input validation
- ✅ **Rate Limiting** - Protected against abuse (10 requests/minute)
- ✅ **Dual Storage** - SQLite (persistent) or in-memory options
- ✅ **OpenAPI/Swagger** - Full interactive documentation
- ✅ **Docker Support** - One-command deployment
- ✅ **Comprehensive Testing** - Unit and integration tests

### Quick Start

#### Using Docker (Recommended)

```bash
cd backend
docker-compose up --build

# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

#### Using Python

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/evolution/run` | Run evolution simulation |
| `GET` | `/api/v1/evolution/results/{id}` | Get specific result |
| `GET` | `/api/v1/evolution/results` | List all results |
| `GET` | `/api/v1/evolution/health` | Health check |

### Example cURL Requests

#### Run Evolution

```bash
# Basic evolution run
curl -X POST "http://localhost:8000/api/v1/evolution/run" \
  -H "Content-Type: application/json" \
  -d '{
    "population_size": 50,
    "generations": 20,
    "mutation_rate": 0.1,
    "survival_rate": 0.4,
    "tournament_size": 3,
    "random_seed": 42
  }'
```

#### Get Evolution Result

```bash
# Retrieve a specific result by ID
curl "http://localhost:8000/api/v1/evolution/results/{result_id}"
```

#### List All Results

```bash
# List all evolution results
curl "http://localhost:8000/api/v1/evolution/results"

# With pagination
curl "http://localhost:8000/api/v1/evolution/results?limit=10&offset=0"
```

#### Health Check

```bash
# Check API health
curl "http://localhost:8000/api/v1/evolution/health"
```

### Response Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "parameters": {
    "population_size": 50,
    "generations": 20,
    "mutation_rate": 0.1,
    "survival_rate": 0.4,
    "tournament_size": 3,
    "random_seed": 42
  },
  "generations": [
    {
      "generation_number": 1,
      "avg_fitness": 2.4501,
      "max_fitness": 4.1234,
      "min_fitness": 1.2345,
      "diversity_score": 0.0834,
      "population_size": 50,
      "timestamp": "2026-02-04T23:30:00.123456"
    },
    ...
  ],
  "best_agent": {
    "id": "agent-uuid",
    "genome": {
      "speed": 0.9534,
      "strength": 0.8723,
      "intelligence": 0.9182,
      "cooperation": 0.7845,
      "adaptability": 0.8834
    },
    "fitness": 4.4118,
    "generation": 20
  },
  "fitness_history": [...],
  "created_at": "2026-02-04T23:30:00.000000",
  "completed_at": "2026-02-04T23:30:01.250000",
  "execution_time_ms": 1250
}
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Backend Architecture

The backend follows **Clean/Hexagonal Architecture**:

```
backend/
├── src/
│   ├── domain/           # Enterprise business rules
│   │   ├── entities.py   # Domain entities (Agent, Genome, etc.)
│   │   ├── repositories.py # Repository interfaces
│   │   └── exceptions.py # Domain exceptions
│   ├── application/      # Use cases
│   │   └── evolution_use_cases.py
│   ├── adapters/
│   │   ├── api/         # HTTP routes
│   │   │   └── routes.py
│   │   └── persistence/ # Database implementations
│   │       ├── memory_repository.py
│   │       └── sqlite_repository.py
│   └── main.py          # FastAPI app
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # API tests
└── Dockerfile
```

### Why This Matters for the Hackathon

This backend API makes ClawDNA significantly more **interactive** and **agentic**:

1. **External Agents Can Trigger Evolutions** - Other AI agents can POST to `/api/v1/evolution/run` to evolve agents on-demand
2. **Real-time Demonstrations** - Frontend UIs can show live evolution progress
3. **Reproducible Results** - Random seed support ensures consistent demonstrations
4. **Production-Ready** - Clean architecture, comprehensive tests, Docker deployment
5. **Integration Ready** - Easy to integrate with partner projects via HTTP

### Testing

```bash
cd backend

# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_entities.py -v
```

---

## Integration Opportunities

ClawDNA is designed to work with other Colosseum projects:

- **KAMIYO** - Fitness verification using ZK proofs
- **Sipher** - Privacy for breeding strategies
- **AgentDEX** - Execution infrastructure for evolved agents

## Project Status

- ✅ Core genetic algorithm implementation
- ✅ Agent traits and fitness functions
- ✅ Population management
- ✅ **Backend API with Clean Architecture**
- ✅ **Docker deployment**
- ✅ **Comprehensive tests**
- ⏳ Integration with partner projects
- ⏳ Demo and testing

## Links

- **Colosseum Project**: [ClawDNA](https://agents.colosseum.com/projects/clawdna-uv2mzh)
- **Agent**: nova1_hackathon (ID: 282)
- **Discord**: Join the discussion!

---

Built for the [Colosseum Agent Hackathon](https://agents.colosseum.com/)
