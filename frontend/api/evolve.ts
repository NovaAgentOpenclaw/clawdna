/**
 * POST /api/evolve
 * Run one evolution step on the current population
 */

import { 
  naturalSelection, 
  tournamentSelect, 
  crossover,
  createResponse, 
  createError, 
  handleCors,
  calculateFitness 
} from '../lib/utils'
import { getSession, updateSession, addToLeaderboard } from '../lib/store'
import { withRateLimit } from '../lib/rateLimit'
import type { Agent, GenerationData } from '../src/types'

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  if (request.method !== 'POST') {
    return createError('Method not allowed', 405)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { sessionId, generations = 1 } = body

    if (!sessionId) {
      return createError('Session ID is required', 400, 'MISSING_SESSION_ID')
    }

    if (generations < 1 || generations > 100) {
      return createError('Generations must be between 1 and 100', 400)
    }

    // Get session
    const session = await getSession(sessionId)
    if (!session) {
      return createError('Session not found', 404, 'SESSION_NOT_FOUND')
    }

    if (session.agents.length === 0) {
      return createError('No population initialized', 400, 'NO_POPULATION')
    }

    let currentAgents = [...session.agents]
    let currentGeneration = session.currentGeneration
    let newGenerationsData: GenerationData[] = []
    let bestAgentOverall = session.bestAgentEver

    // Run evolution for specified generations
    for (let g = 0; g < generations; g++) {
      // Selection
      const survivors = naturalSelection(currentAgents, session.config.survivalRate)
      
      // Create offspring
      const offspring: Agent[] = []
      const targetSize = session.config.populationSize
      
      while (offspring.length < targetSize - survivors.length) {
        const parent1 = tournamentSelect(survivors, session.config.tournamentSize)
        const parent2 = tournamentSelect(survivors, session.config.tournamentSize)
        const child = crossover(
          parent1, 
          parent2, 
          session.config.mutationRate, 
          currentGeneration + 1
        )
        offspring.push(child)
      }

      currentAgents = [...survivors, ...offspring]
      currentGeneration++

      const bestAgent = currentAgents.reduce((best, agent) => 
        agent.fitness > best.fitness ? agent : best
      )

      const generationData: GenerationData = {
        generation: currentGeneration,
        averageFitness: currentAgents.reduce((sum, a) => sum + a.fitness, 0) / currentAgents.length,
        maxFitness: bestAgent.fitness,
        minFitness: Math.min(...currentAgents.map(a => a.fitness)),
        bestAgent,
        populationSize: currentAgents.length,
      }

      newGenerationsData.push(generationData)

      // Update best agent ever
      if (!bestAgentOverall || bestAgent.fitness > bestAgentOverall.fitness) {
        bestAgentOverall = bestAgent
      }
    }

    // Update session
    const updatedSession = await updateSession(sessionId, {
      agents: currentAgents,
      currentGeneration,
      generations: [...session.generations, ...newGenerationsData],
      bestAgentEver: bestAgentOverall,
    })

    if (!updatedSession) {
      return createError('Failed to update session', 500)
    }

    // Add best agent to leaderboard if it's exceptional
    if (bestAgentOverall && bestAgentOverall.fitness > 0.9) {
      await addToLeaderboard({
        agent: bestAgentOverall,
        walletAddress: session.walletAddress,
        timestamp: Date.now(),
        sessionId,
      })
    }

    return createResponse({
      success: true,
      generation: currentGeneration,
      agents: currentAgents,
      bestAgent: bestAgentOverall,
      generationData: newGenerationsData,
      stats: {
        averageFitness: newGenerationsData[newGenerationsData.length - 1].averageFitness,
        maxFitness: newGenerationsData[newGenerationsData.length - 1].maxFitness,
        minFitness: newGenerationsData[newGenerationsData.length - 1].minFitness,
      },
    })

  } catch (error) {
    console.error('Error evolving population:', error)
    return createError(
      error instanceof Error ? error.message : 'Failed to evolve population',
      500
    )
  }
}

export const POST = withRateLimit(handler)
export const OPTIONS = handler
