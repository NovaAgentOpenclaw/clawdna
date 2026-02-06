/**
 * GET /api/health
 * Health check endpoint
 */

import { createResponse, createError, handleCors } from '../lib/utils'
import { checkStorageHealth } from '../lib/store'

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  if (request.method !== 'GET') {
    return createError('Method not allowed', 405)
  }

  try {
    const storage = await checkStorageHealth()

    return createResponse({
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      services: {
        storage,
      },
      environment: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown',
    })

  } catch (error) {
    return createResponse({
      status: 'unhealthy',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503)
  }
}

export const GET = handler
export const OPTIONS = handler
