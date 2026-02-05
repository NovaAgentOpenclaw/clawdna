"""
API routes for evolution endpoints
Adapter layer - HTTP interface adapters
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field, validator
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.domain.entities import EvolutionParameters, EvolutionResult
from src.domain.exceptions import NotFoundError, ValidationError
from src.application import RunEvolutionUseCase, GetEvolutionResultUseCase, ListEvolutionResultsUseCase
from src.adapters.persistence import InMemoryEvolutionRepository, SQLiteEvolutionRepository

# Router
router = APIRouter(prefix="/api/v1/evolution", tags=["evolution"])

# Repository factory
_repository = None

def get_repository():
    """Get or create repository singleton"""
    global _repository
    if _repository is None:
        # Use SQLite by default, can be configured via env var
        import os
        if os.getenv("CLAWDNA_USE_MEMORY_DB", "false").lower() == "true":
            _repository = InMemoryEvolutionRepository()
        else:
            _repository = SQLiteEvolutionRepository(
                os.getenv("CLAWDNA_DB_PATH", "clawdna.db")
            )
    return _repository


# Pydantic Models
class EvolutionRequest(BaseModel):
    """Request model for evolution run"""
    population_size: int = Field(
        default=20, 
        ge=2, 
        le=1000,
        description="Number of agents in the population"
    )
    generations: int = Field(
        default=10, 
        ge=1, 
        le=1000,
        description="Number of generations to evolve"
    )
    mutation_rate: float = Field(
        default=0.1, 
        ge=0.0, 
        le=1.0,
        description="Probability of mutation (0-1)"
    )
    survival_rate: float = Field(
        default=0.4, 
        gt=0.0, 
        le=1.0,
        description="Fraction of population that survives each generation"
    )
    tournament_size: int = Field(
        default=3, 
        ge=2, 
        le=100,
        description="Size of tournament for parent selection"
    )
    random_seed: Optional[int] = Field(
        default=None,
        description="Random seed for reproducibility"
    )
    
    @validator('tournament_size')
    def validate_tournament_size(cls, v, values):
        if 'population_size' in values and v > values['population_size']:
            raise ValueError('tournament_size cannot exceed population_size')
        return v


class GenomeResponse(BaseModel):
    """Response model for genome"""
    speed: float
    strength: float
    intelligence: float
    cooperation: float
    adaptability: float


class AgentResponse(BaseModel):
    """Response model for agent"""
    id: Optional[str]
    genome: Optional[GenomeResponse]
    fitness: Optional[float]
    generation: Optional[int]


class GenerationStatsResponse(BaseModel):
    """Response model for generation statistics"""
    generation_number: int
    avg_fitness: float
    max_fitness: float
    min_fitness: float
    diversity_score: float
    population_size: int
    timestamp: str


class EvolutionResponse(BaseModel):
    """Response model for evolution result"""
    id: str
    status: str
    parameters: dict
    generations: List[GenerationStatsResponse]
    best_agent: Optional[AgentResponse]
    fitness_history: List[GenerationStatsResponse]
    created_at: str
    completed_at: Optional[str]
    execution_time_ms: Optional[int]


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    details: Optional[List[str]] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: str


# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/run",
    response_model=EvolutionResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid parameters"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Run evolution simulation",
    description="Run a genetic algorithm evolution with specified parameters"
)
@limiter.limit("10/minute")
async def run_evolution(
    request: Request,
    params: EvolutionRequest,
    persist: bool = Query(default=True, description="Persist results to database")
):
    """
    Run a genetic algorithm evolution simulation.
    
    - **population_size**: Number of agents (2-1000)
    - **generations**: Number of generations to evolve (1-1000)
    - **mutation_rate**: Probability of mutation 0-1
    - **survival_rate**: Fraction surviving each generation (0-1]
    - **tournament_size**: Tournament selection size (2-100)
    - **random_seed**: Optional seed for reproducibility
    """
    try:
        # Convert to domain entity
        domain_params = EvolutionParameters(
            population_size=params.population_size,
            generations=params.generations,
            mutation_rate=params.mutation_rate,
            survival_rate=params.survival_rate,
            tournament_size=params.tournament_size,
            random_seed=params.random_seed
        )
        
        # Validate parameters
        errors = domain_params.validate()
        if errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Validation failed", "details": errors}
            )
        
        # Run evolution
        repo = get_repository() if persist else None
        use_case = RunEvolutionUseCase(repository=repo)
        result = await use_case.execute(domain_params)
        
        return result.to_dict()
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "details": e.errors}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": f"Evolution failed: {str(e)}"}
        )


@router.get(
    "/results/{result_id}",
    response_model=EvolutionResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Result not found"}
    },
    summary="Get evolution result",
    description="Retrieve a specific evolution result by ID"
)
async def get_result(result_id: str):
    """Get evolution result by ID"""
    repo = get_repository()
    use_case = GetEvolutionResultUseCase(repository=repo)
    result = await use_case.execute(result_id)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Evolution result '{result_id}' not found"}
        )
    
    return result.to_dict()


@router.get(
    "/results",
    response_model=List[EvolutionResponse],
    summary="List evolution results",
    description="List all evolution results with pagination"
)
async def list_results(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    """List evolution results"""
    repo = get_repository()
    use_case = ListEvolutionResultsUseCase(repository=repo)
    results = await use_case.execute(limit=limit, offset=offset)
    
    return [r.to_dict() for r in results]


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check API health status"
)
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
