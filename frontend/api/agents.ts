/**
 * GET /api/agents
 * Get all agents for a session
 * Query params: sessionId (required), sort (optional), limit (optional)
 */

import { createResponse, createError, handleCors } from '../lib/utils'
import { getSession } from '../lib/store'
import type { Agent } from '../src/types'

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  if (request.method !== 'GET') {
    return createError('Method not allowed', 405)
  }

  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    const sort = url.searchParams.get('sort') || 'fitness' // fitness, age, generation
    const order = url.searchParams.get('order') || 'desc' // asc, desc
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const generation = url.searchParams.get('generation')
    const minFitness = url.searchParams.get('minFitness')

    if (!sessionId) {
      return createError('Session ID is required', 400, 'MISSING_SESSION_ID')
    }

    const session = await getSession(sessionId)
    if (!session) {
      return createError('Session not found', 404, 'SESSION_NOT_FOUND')
    }

    let agents = [...session.agents]

    // Filter by generation if specified
    if (generation) {
      const gen = parseInt(generation)
      agents = agents.filter(a => a.generation === gen)
    }

    // Filter by minimum fitness
    if (minFitness) {
      const min = parseFloat(minFitness)
      agents = agents.filter(a => a.fitness >= min)
    }

    // Sort agents
    agents.sort((a, b) => {
      let comparison = 0
      
      switch (sort) {
        case 'fitness':
          comparison = a.fitness - b.fitness
          break
        case 'age':
          comparison = a.age - b.age
          break
        case 'generation':
          comparison = a.generation - b.generation
          break
        case 'id':
          comparison = a.id.localeCompare(b.id)
          break
        default:
          comparison = a.fitness - b.fitness
      }

      return order === 'desc' ? -comparison : comparison
    })

    // Pagination
    const total = agents.length
    const paginatedAgents = agents.slice(offset, offset + limit)

    return createResponse({
      success: true,
      agents: paginatedAgents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      sort: { field: sort, order },
      sessionInfo: {
        sessionId: session.sessionId,
        currentGeneration: session.currentGeneration,
        populationSize: session.agents.length,
        totalGenerations: session.generations.length,
      },
    })

  } catch (error) {
    console.error('Error fetching agents:', error)
    return createError(
      error instanceof Error ? error.message : 'Failed to fetch agents',
      500
    )
  }
}

export const GET = handler
export const OPTIONS = handler
