/**
 * ClawDNA API Service
 * Client-side service for interacting with backend API
 */

import type { Agent, SimulationConfig, GenerationData } from '../types'

const API_BASE = '/api'

// Default headers for API requests
const defaultHeaders = {
  'Content-Type': 'application/json',
}

// Helper to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Request failed',
      response.status,
      data.code
    )
  }

  return data as T
}

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ==================== Population API ====================

export interface InitPopulationResponse {
  success: boolean
  sessionId: string
  agents: Agent[]
  bestAgent: Agent
  generation: number
  config: SimulationConfig
  populationSize: number
}

export async function initPopulation(
  config?: Partial<SimulationConfig>
): Promise<InitPopulationResponse> {
  return apiRequest<InitPopulationResponse>('/population/init', {
    method: 'POST',
    body: JSON.stringify({ config }),
  })
}

// ==================== Evolution API ====================

export interface EvolveResponse {
  success: boolean
  generation: number
  agents: Agent[]
  bestAgent: Agent | null
  generationData: GenerationData[]
  stats: {
    averageFitness: number
    maxFitness: number
    minFitness: number
  }
}

export async function evolve(
  sessionId: string,
  generations: number = 1
): Promise<EvolveResponse> {
  return apiRequest<EvolveResponse>('/evolve', {
    method: 'POST',
    body: JSON.stringify({ sessionId, generations }),
  })
}

// ==================== Agents API ====================

export interface GetAgentsResponse {
  success: boolean
  agents: Agent[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  sort: {
    field: string
    order: string
  }
  sessionInfo: {
    sessionId: string
    currentGeneration: number
    populationSize: number
    totalGenerations: number
  }
}

export interface GetAgentsOptions {
  sort?: 'fitness' | 'age' | 'generation' | 'id'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
  generation?: number
  minFitness?: number
}

export async function getAgents(
  sessionId: string,
  options: GetAgentsOptions = {}
): Promise<GetAgentsResponse> {
  const params = new URLSearchParams({ sessionId })
  
  if (options.sort) params.set('sort', options.sort)
  if (options.order) params.set('order', options.order)
  if (options.limit) params.set('limit', String(options.limit))
  if (options.offset) params.set('offset', String(options.offset))
  if (options.generation) params.set('generation', String(options.generation))
  if (options.minFitness) params.set('minFitness', String(options.minFitness))

  return apiRequest<GetAgentsResponse>(`/agents?${params.toString()}`)
}

// ==================== Breed API ====================

export interface BreedResponse {
  success: boolean
  child: Agent & { name?: string }
  parents: {
    parent1: { id: string; fitness: number; traits: Record<string, number> }
    parent2: { id: string; fitness: number; traits: Record<string, number> }
  }
  genetics: {
    inheritedFrom: string
    mutationOccurred: boolean
    fitnessImprovement: boolean
  }
  populationSize: number
  addedToPopulation: boolean
}

export interface BreedOptions {
  sessionId: string
  parent1Id: string
  parent2Id: string
  mutationRate?: number
  customName?: string
  autoAdd?: boolean
}

export async function breedAgents(options: BreedOptions): Promise<BreedResponse> {
  return apiRequest<BreedResponse>('/breed', {
    method: 'POST',
    body: JSON.stringify(options),
  })
}

// ==================== Leaderboard API ====================

export interface LeaderboardEntry {
  rank: number
  agent: Agent
  walletAddress?: string
  sessionId: string
  timestamp: number
  isCurrentSession?: boolean
}

export interface GetLeaderboardResponse {
  success: boolean
  leaderboard: LeaderboardEntry[]
  stats: {
    total: number
    averageFitness: number
    highestFitness: number
    lowestFitness: number
    uniqueSessions: number
  }
  meta: {
    limit: number
    generatedAt: number
  }
}

export async function getLeaderboard(
  limit: number = 20,
  sessionId?: string,
  includeCurrent: boolean = false
): Promise<GetLeaderboardResponse> {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (sessionId) params.set('sessionId', sessionId)
  if (includeCurrent) params.set('includeCurrent', 'true')

  return apiRequest<GetLeaderboardResponse>(`/leaderboard?${params.toString()}`)
}

// ==================== Session API ====================

export interface SessionInfo {
  sessionId: string
  currentGeneration: number
  populationSize: number
  generationsCount: number
  config: SimulationConfig
  bestAgentEver: Agent | null
  walletAddress?: string
  createdAt: number
  updatedAt: number
}

export interface GetSessionResponse {
  success: boolean
  session: SessionInfo
}

export async function getSession(sessionId: string): Promise<GetSessionResponse> {
  return apiRequest<GetSessionResponse>(`/session?sessionId=${sessionId}`)
}

export async function deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/session', {
    method: 'DELETE',
    body: JSON.stringify({ sessionId }),
  })
}

// ==================== Wallet API ====================

export interface ConnectWalletResponse {
  success: boolean
  message: string
  walletAddress: string
  sessionId: string
  network: {
    network: string
    rpcUrl: string
    explorerUrl: string
  }
}

export async function connectWallet(
  sessionId: string,
  walletAddress: string
): Promise<ConnectWalletResponse> {
  return apiRequest<ConnectWalletResponse>('/wallet?action=connect', {
    method: 'POST',
    body: JSON.stringify({ sessionId, walletAddress }),
  })
}

export interface WalletBalanceResponse {
  success: boolean
  walletAddress: string
  balance: number
  network: {
    network: string
    rpcUrl: string
    explorerUrl: string
  }
}

export async function getWalletBalance(address: string): Promise<WalletBalanceResponse> {
  return apiRequest<WalletBalanceResponse>(`/wallet?action=balance&address=${address}`)
}

export interface PrepareMintResponse {
  success: boolean
  message: string
  metadata: {
    name: string
    symbol: string
    description: string
    image: string
    attributes: { trait_type: string; value: string | number }[]
    properties: {
      files: { uri: string; type: string }[]
      category: string
      creators?: { address: string; share: number }[]
    }
  }
  network: string
  agent: {
    id: string
    fitness: number
    generation: number
    traits: Record<string, number>
  }
  walletAddress: string
}

export async function prepareMint(
  sessionId: string,
  agentId: string
): Promise<PrepareMintResponse> {
  return apiRequest<PrepareMintResponse>('/wallet?action=mint', {
    method: 'POST',
    body: JSON.stringify({ sessionId, agentId }),
  })
}

export interface AirdropResponse {
  success: boolean
  message: string
  signature: string
  walletAddress: string
  network: {
    network: string
    rpcUrl: string
    explorerUrl: string
  }
}

export async function requestAirdrop(
  walletAddress: string,
  amount: number = 1
): Promise<AirdropResponse> {
  return apiRequest<AirdropResponse>('/wallet?action=airdrop', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, amount }),
  })
}

// ==================== Health API ====================

export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: number
  version: string
  services: {
    storage: {
      healthy: boolean
      type: string
    }
  }
  environment: string
  region: string
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health')
}
