/**
 * POST /api/wallet/connect
 * Link wallet to session
 * GET /api/wallet/balance
 * Get wallet balance
 * POST /api/wallet/mint
 * Prepare NFT minting for an agent
 */

import { 
  createResponse, 
  createError, 
  handleCors 
} from '../lib/utils'
import { 
  linkWalletToSession,
  getSession,
  addToLeaderboard 
} from '../lib/store'
import { 
  isValidWalletAddress,
  getWalletBalance,
  prepareMintTransaction,
  requestAirdrop,
  solanaNetworkInfo,
} from '../lib/solana'
import { withRateLimit } from '../lib/rateLimit'

// Connect wallet to session
async function connectWallet(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({}))
  const { sessionId, walletAddress } = body

  if (!sessionId) {
    return createError('Session ID is required', 400)
  }

  if (!walletAddress) {
    return createError('Wallet address is required', 400)
  }

  if (!isValidWalletAddress(walletAddress)) {
    return createError('Invalid wallet address', 400, 'INVALID_WALLET')
  }

  const session = await getSession(sessionId)
  if (!session) {
    return createError('Session not found', 404, 'SESSION_NOT_FOUND')
  }

  await linkWalletToSession(sessionId, walletAddress)

  return createResponse({
    success: true,
    message: 'Wallet connected successfully',
    walletAddress,
    sessionId,
    network: solanaNetworkInfo,
  })
}

// Get wallet balance
async function getBalance(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const walletAddress = url.searchParams.get('address')

  if (!walletAddress) {
    return createError('Wallet address is required', 400)
  }

  if (!isValidWalletAddress(walletAddress)) {
    return createError('Invalid wallet address', 400, 'INVALID_WALLET')
  }

  try {
    const balance = await getWalletBalance(walletAddress)

    return createResponse({
      success: true,
      walletAddress,
      balance,
      network: solanaNetworkInfo,
    })

  } catch (error) {
    return createError(
      error instanceof Error ? error.message : 'Failed to get balance',
      500
    )
  }
}

// Prepare NFT mint
async function prepareMint(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({}))
  const { sessionId, agentId } = body

  if (!sessionId || !agentId) {
    return createError('Session ID and Agent ID are required', 400)
  }

  const session = await getSession(sessionId)
  if (!session) {
    return createError('Session not found', 404, 'SESSION_NOT_FOUND')
  }

  if (!session.walletAddress) {
    return createError('No wallet connected to session', 400, 'NO_WALLET')
  }

  const agent = session.agents.find(a => a.id === agentId) || session.bestAgentEver
  if (!agent) {
    return createError('Agent not found', 404, 'AGENT_NOT_FOUND')
  }

  const mintInstructions = prepareMintTransaction(agent, session.walletAddress)

  return createResponse({
    success: true,
    ...mintInstructions,
    agent: {
      id: agent.id,
      fitness: agent.fitness,
      generation: agent.generation,
      traits: agent.traits,
    },
    walletAddress: session.walletAddress,
  })
}

// Request airdrop (devnet only)
async function airdrop(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({}))
  const { walletAddress, amount = 1 } = body

  if (!walletAddress) {
    return createError('Wallet address is required', 400)
  }

  if (!isValidWalletAddress(walletAddress)) {
    return createError('Invalid wallet address', 400, 'INVALID_WALLET')
  }

  try {
    const signature = await requestAirdrop(walletAddress, amount)

    return createResponse({
      success: true,
      message: `Airdropped ${amount} SOL`,
      signature,
      walletAddress,
      network: solanaNetworkInfo,
    })

  } catch (error) {
    return createError(
      error instanceof Error ? error.message : 'Airdrop failed',
      500
    )
  }
}

// Main handler
async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  const url = new URL(request.url)
  const action = url.searchParams.get('action') || url.pathname.split('/').pop()

  switch (action) {
    case 'connect':
      if (request.method !== 'POST') return createError('Method not allowed', 405)
      return connectWallet(request)
    
    case 'balance':
      if (request.method !== 'GET') return createError('Method not allowed', 405)
      return getBalance(request)
    
    case 'mint':
      if (request.method !== 'POST') return createError('Method not allowed', 405)
      return prepareMint(request)
    
    case 'airdrop':
      if (request.method !== 'POST') return createError('Method not allowed', 405)
      return airdrop(request)
    
    default:
      return createError('Invalid action. Use: connect, balance, mint, airdrop', 400)
  }
}

export const GET = handler
export const POST = withRateLimit(handler)
export const OPTIONS = handler
