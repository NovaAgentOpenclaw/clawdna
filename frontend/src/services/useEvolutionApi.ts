/**
 * React Hook for ClawDNA Backend API
 * Provides state management and methods for evolution backend
 */

import { useState, useCallback, useRef } from 'react'
import type { Agent, SimulationConfig, GenerationData } from '../types'
import * as api from './api'

interface UseEvolutionBackendOptions {
  onError?: (error: api.ApiError) => void
  autoSave?: boolean
}

interface UseEvolutionBackendReturn {
  // State
  sessionId: string | null
  agents: Agent[]
  generations: GenerationData[]
  currentGeneration: number
  bestAgentEver: Agent | null
  config: SimulationConfig | null
  isLoading: boolean
  error: api.ApiError | null
  isWalletConnected: boolean
  walletAddress: string | null

  // Actions
  initialize: (config?: Partial<SimulationConfig>) => Promise<void>
  evolve: (generations?: number) => Promise<void>
  getAgents: (options?: api.GetAgentsOptions) => Promise<api.GetAgentsResponse>
  breed: (parent1Id: string, parent2Id: string, options?: Omit<api.BreedOptions, 'sessionId' | 'parent1Id' | 'parent2Id'>) => Promise<api.BreedResponse>
  loadSession: (sessionId: string) => Promise<void>
  connectWallet: (walletAddress: string) => Promise<void>
  prepareMint: (agentId: string) => Promise<api.PrepareMintResponse>
  
  // Utilities
  clearError: () => void
  reset: () => void
}

export function useEvolutionBackend(
  options: UseEvolutionBackendOptions = {}
): UseEvolutionBackendReturn {
  const { onError, autoSave = true } = options

  // State
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [generations, setGenerations] = useState<GenerationData[]>([])
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [bestAgentEver, setBestAgentEver] = useState<Agent | null>(null)
  const [config, setConfig] = useState<SimulationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<api.ApiError | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId

  const handleError = useCallback((err: unknown) => {
    const apiError = err instanceof api.ApiError 
      ? err 
      : new api.ApiError(err instanceof Error ? err.message : 'Unknown error', 500)
    
    setError(apiError)
    onError?.(apiError)
    throw apiError
  }, [onError])

  // Initialize new population
  const initialize = useCallback(async (customConfig?: Partial<SimulationConfig>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.initPopulation(customConfig)
      
      setSessionId(response.sessionId)
      setAgents(response.agents)
      setCurrentGeneration(response.generation)
      setBestAgentEver(response.bestAgent)
      setConfig(response.config)
      setGenerations([])

      // Save session ID to localStorage
      if (autoSave) {
        localStorage.setItem('clawdna_session_id', response.sessionId)
      }

    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }, [autoSave, handleError])

  // Evolve population
  const evolve = useCallback(async (generations: number = 1) => {
    if (!sessionIdRef.current) {
      handleError(new api.ApiError('No active session', 400, 'NO_SESSION'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.evolve(sessionIdRef.current, generations)
      
      setAgents(response.agents)
      setCurrentGeneration(response.generation)
      setBestAgentEver(response.bestAgent)
      setGenerations(prev => [...prev, ...response.generationData])

    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Get agents with filtering/pagination
  const getAgents = useCallback(async (options: api.GetAgentsOptions = {}) => {
    if (!sessionIdRef.current) {
      handleError(new api.ApiError('No active session', 400, 'NO_SESSION'))
      throw new Error('No active session')
    }

    return await api.getAgents(sessionIdRef.current, options)
  }, [handleError])

  // Breed two agents
  const breed = useCallback(async (
    parent1Id: string,
    parent2Id: string,
    breedOptions: Omit<api.BreedOptions, 'sessionId' | 'parent1Id' | 'parent2Id'> = {}
  ) => {
    if (!sessionIdRef.current) {
      handleError(new api.ApiError('No active session', 400, 'NO_SESSION'))
      throw new Error('No active session')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.breedAgents({
        sessionId: sessionIdRef.current,
        parent1Id,
        parent2Id,
        ...breedOptions,
      })

      // Update agents if auto-added
      if (response.addedToPopulation) {
        setAgents(prev => [...prev, response.child])
      }

      return response

    } catch (err) {
      handleError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Load existing session
  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const sessionResponse = await api.getSession(id)
      const { session } = sessionResponse

      // Load agents
      const agentsResponse = await api.getAgents(id, { limit: 200 })

      setSessionId(session.sessionId)
      setAgents(agentsResponse.agents)
      setCurrentGeneration(session.currentGeneration)
      setBestAgentEver(session.bestAgentEver)
      setConfig(session.config)
      setWalletAddress(session.walletAddress || null)

      // Note: Full generation history isn't returned in session endpoint
      // You may want to add a separate endpoint for full history

    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Connect wallet
  const connectWallet = useCallback(async (address: string) => {
    if (!sessionIdRef.current) {
      handleError(new api.ApiError('No active session', 400, 'NO_SESSION'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.connectWallet(sessionIdRef.current, address)
      setWalletAddress(address)
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Prepare NFT mint
  const prepareMint = useCallback(async (agentId: string) => {
    if (!sessionIdRef.current) {
      handleError(new api.ApiError('No active session', 400, 'NO_SESSION'))
      throw new Error('No active session')
    }

    return await api.prepareMint(sessionIdRef.current, agentId)
  }, [handleError])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setSessionId(null)
    setAgents([])
    setGenerations([])
    setCurrentGeneration(0)
    setBestAgentEver(null)
    setConfig(null)
    setError(null)
    setWalletAddress(null)
    localStorage.removeItem('clawdna_session_id')
  }, [])

  return {
    // State
    sessionId,
    agents,
    generations,
    currentGeneration,
    bestAgentEver,
    config,
    isLoading,
    error,
    isWalletConnected: !!walletAddress,
    walletAddress,

    // Actions
    initialize,
    evolve,
    getAgents,
    breed,
    loadSession,
    connectWallet,
    prepareMint,

    // Utilities
    clearError,
    reset,
  }
}

// Hook for leaderboard
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<api.LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<api.ApiError | null>(null)

  const fetchLeaderboard = useCallback(async (
    limit: number = 20,
    sessionId?: string,
    includeCurrent: boolean = false
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.getLeaderboard(limit, sessionId, includeCurrent)
      setLeaderboard(response.leaderboard)
      return response
    } catch (err) {
      const apiError = err instanceof api.ApiError 
        ? err 
        : new api.ApiError(err instanceof Error ? err.message : 'Unknown error', 500)
      setError(apiError)
      throw apiError
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    leaderboard,
    isLoading,
    error,
    fetchLeaderboard,
  }
}

// Hook for health check
export function useHealthCheck() {
  const [health, setHealth] = useState<api.HealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const check = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.checkHealth()
      setHealth(response)
      return response
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { health, isLoading, check }
}
