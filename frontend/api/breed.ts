/**
 * POST /api/breed
 * Breed two agents to create offspring
 */

import { 
  crossover, 
  createResponse, 
  createError, 
  handleCors,
  generateId,
  calculateFitness 
} from '../lib/utils'
import { getSession, updateSession, addToLeaderboard } from '../lib/store'
import { withRateLimit } from '../lib/rateLimit'
import type { Agent, AgentTraits } from '../src/types'

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  if (request.method !== 'POST') {
    return createError('Method not allowed', 405)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { 
      sessionId, 
      parent1Id, 
      parent2Id,
      mutationRate,
      customName,
      autoAdd = false 
    } = body

    if (!sessionId) {
      return createError('Session ID is required', 400, 'MISSING_SESSION_ID')
    }

    if (!parent1Id || !parent2Id) {
      return createError('Both parent IDs are required', 400, 'MISSING_PARENT_IDS')
    }

    const session = await getSession(sessionId)
    if (!session) {
      return createError('Session not found', 404, 'SESSION_NOT_FOUND')
    }

    // Find parents
    const parent1 = session.agents.find(a => a.id === parent1Id)
    const parent2 = session.agents.find(a => a.id === parent2Id)

    if (!parent1) {
      return createError(`Parent 1 (${parent1Id}) not found`, 404, 'PARENT_NOT_FOUND')
    }

    if (!parent2) {
      return createError(`Parent 2 (${parent2Id}) not found`, 404, 'PARENT_NOT_FOUND')
    }

    // Use provided mutation rate or session default
    const effectiveMutationRate = mutationRate ?? session.config.mutationRate
    
    // Create child
    const child = crossover(
      parent1,
      parent2,
      effectiveMutationRate,
      session.currentGeneration + 1
    )

    // Optionally add to population
    let updatedAgents = session.agents
    if (autoAdd) {
      updatedAgents = [...session.agents, child]
      
      // Update session with new agent
      await updateSession(sessionId, {
        agents: updatedAgents,
      })
    }

    // Check if child is exceptional for leaderboard
    if (child.fitness > 0.9) {
      await addToLeaderboard({
        agent: child,
        walletAddress: session.walletAddress,
        timestamp: Date.now(),
        sessionId,
      })
    }

    return createResponse({
      success: true,
      child: {
        ...child,
        name: customName || child.id,
      },
      parents: {
        parent1: {
          id: parent1.id,
          fitness: parent1.fitness,
          traits: parent1.traits,
        },
        parent2: {
          id: parent2.id,
          fitness: parent2.fitness,
          traits: parent2.traits,
        },
      },
      genetics: {
        inheritedFrom: child.traits.speed === parent1.traits.speed ? 'parent1' : 'parent2',
        mutationOccurred: child.mutated || false,
        fitnessImprovement: child.fitness > Math.max(parent1.fitness, parent2.fitness),
      },
      populationSize: updatedAgents.length,
      addedToPopulation: autoAdd,
    }, 201)

  } catch (error) {
    console.error('Error breeding agents:', error)
    return createError(
      error instanceof Error ? error.message : 'Failed to breed agents',
      500
    )
  }
}

export const POST = withRateLimit(handler)
export const OPTIONS = handler
