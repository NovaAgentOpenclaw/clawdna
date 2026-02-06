/**
 * GET /api/session
 * Get session details
 * DELETE /api/session
 * Delete a session
 */

import { createResponse, createError, handleCors } from '../lib/utils'
import { getSession, deleteSession } from '../lib/store'

async function getHandler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    const walletAddress = url.searchParams.get('walletAddress')

    if (!sessionId && !walletAddress) {
      return createError('Session ID or wallet address is required', 400)
    }

    let session
    if (sessionId) {
      session = await getSession(sessionId)
    } else if (walletAddress) {
      const { getSessionByWallet } = await import('../lib/store')
      session = await getSessionByWallet(walletAddress)
    }

    if (!session) {
      return createError('Session not found', 404, 'SESSION_NOT_FOUND')
    }

    return createResponse({
      success: true,
      session: {
        sessionId: session.sessionId,
        currentGeneration: session.currentGeneration,
        populationSize: session.agents.length,
        generationsCount: session.generations.length,
        config: session.config,
        bestAgentEver: session.bestAgentEver,
        walletAddress: session.walletAddress,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    })

  } catch (error) {
    console.error('Error getting session:', error)
    return createError(
      error instanceof Error ? error.message : 'Failed to get session',
      500
    )
  }
}

async function deleteHandler(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}))
    const { sessionId } = body

    if (!sessionId) {
      return createError('Session ID is required', 400)
    }

    const success = await deleteSession(sessionId)

    if (!success) {
      return createError('Session not found', 404, 'SESSION_NOT_FOUND')
    }

    return createResponse({
      success: true,
      message: 'Session deleted successfully',
      sessionId,
    })

  } catch (error) {
    console.error('Error deleting session:', error)
    return createError(
      error instanceof Error ? error.message : 'Failed to delete session',
      500
    )
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  if (request.method === 'GET') {
    return getHandler(request)
  }

  if (request.method === 'DELETE') {
    return deleteHandler(request)
  }

  return createError('Method not allowed', 405)
}

export const GET = handler
export const DELETE = handler
export const OPTIONS = handler
