/**
 * GET /api/leaderboard
 * Get top performing agents across all sessions
 */

import { createResponse, createError, handleCors } from '../lib/utils'
import { getLeaderboard, getSession } from '../lib/store'
import type { Agent } from '../src/types'

interface LeaderboardEntry {
  rank: number
  agent: Agent
  walletAddress?: string
  sessionId: string
  timestamp: number
  isCurrentSession?: boolean
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  if (request.method !== 'GET') {
    return createError('Method not allowed', 405)
  }

  try {
    const url = new URL(request.url)
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
    const sessionId = url.searchParams.get('sessionId')
    const includeCurrent = url.searchParams.get('includeCurrent') === 'true'

    // Get global leaderboard
    const leaderboardEntries = await getLeaderboard(limit)
    
    let entries: LeaderboardEntry[] = leaderboardEntries.map((entry, index) => ({
      rank: index + 1,
      agent: entry.agent,
      walletAddress: entry.walletAddress,
      sessionId: entry.sessionId,
      timestamp: entry.timestamp,
      isCurrentSession: sessionId ? entry.sessionId === sessionId : false,
    }))

    // Optionally include current session's best agent if not in top leaderboard
    if (includeCurrent && sessionId) {
      const session = await getSession(sessionId)
      if (session?.bestAgentEver) {
        const alreadyInLeaderboard = entries.some(e => e.sessionId === sessionId)
        
        if (!alreadyInLeaderboard) {
          entries.push({
            rank: entries.length + 1,
            agent: session.bestAgentEver,
            walletAddress: session.walletAddress,
            sessionId,
            timestamp: session.updatedAt,
            isCurrentSession: true,
          })
        }
      }
    }

    // Calculate stats
    const allFitness = entries.map(e => e.agent.fitness)
    const stats = {
      total: entries.length,
      averageFitness: allFitness.reduce((a, b) => a + b, 0) / allFitness.length || 0,
      highestFitness: Math.max(...allFitness) || 0,
      lowestFitness: Math.min(...allFitness) || 0,
      uniqueSessions: new Set(entries.map(e => e.sessionId)).size,
    }

    return createResponse({
      success: true,
      leaderboard: entries,
      stats,
      meta: {
        limit,
        generatedAt: Date.now(),
      },
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return createError(
      error instanceof Error ? error.message : 'Failed to fetch leaderboard',
      500
    )
  }
}

export const GET = handler
export const OPTIONS = handler
