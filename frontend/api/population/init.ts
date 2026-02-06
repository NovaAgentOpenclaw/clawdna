/**
 * POST /api/population/init
 * Initialize a new population of agents
 * Creates a new session and returns initial population
 */

import { createPopulation, validateConfig, createResponse, createError, handleCors, generateId } from '../../lib/utils'
import { createSession } from '../../lib/store'
import { withRateLimit } from '../../lib/rateLimit'
import type { SimulationConfig, Agent } from '../../src/types'

async function handler(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return createError('Method not allowed', 405)
  }

  try {
    const body = await request.json().catch(() => ({}))
    
    // Validate and sanitize config
    const rawConfig: Partial<SimulationConfig> = body.config || {}
    const config = validateConfig(rawConfig)
    
    // Create initial population
    const agents = createPopulation(config.populationSize)
    
    // Create session
    const session = await createSession(agents, config)
    
    // Find best agent
    const bestAgent = agents.reduce((best, agent) => 
      agent.fitness > best.fitness ? agent : best
    )

    return createResponse({
      success: true,
      sessionId: session.sessionId,
      agents,
      bestAgent,
      generation: 0,
      config,
      populationSize: agents.length,
    }, 201)

  } catch (error) {
    console.error('Error initializing population:', error)
    return createError(
      error instanceof Error ? error.message : 'Failed to initialize population',
      500
    )
  }
}

// Apply rate limiting
export const POST = withRateLimit(handler)
export const OPTIONS = handler
