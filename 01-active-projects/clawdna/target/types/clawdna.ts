/**
 * ClawDNA Program TypeScript Types
 * 
 * This file contains TypeScript type definitions for the ClawDNA Anchor program.
 * Generated from IDL - Do not modify manually.
 */

import { BN } from "bn.js";
import { PublicKey } from "@solana/web3.js";

// ============================================================================
// ACCOUNT TYPES
// ============================================================================

export interface GlobalState {
  owner: PublicKey;
  treasury: PublicKey;
  breedingFeeLamports: BN;
  royaltyBps: number;
  paused: boolean;
  totalAgents: BN;
  bump: number;
}

export interface AgentData {
  mint: PublicKey;
  genome: number[]; // [u8; 8]
  generation: number;
  parents: PublicKey[]; // [Pubkey; 2]
  createdAt: BN;
  name: string;
  bump: number;
}

// ============================================================================
// INSTRUCTION ARGS
// ============================================================================

export interface InitializeArgs {
  breedingFeeLamports: BN;
  royaltyBps: number;
}

export interface MintGenesisArgs {
  name: string;
  genome: number[]; // [u8; 8]
  uri: string;
}

export interface MergeAgentsArgs {
  name: string;
  uri: string;
}

export interface UpdateBreedingFeeArgs {
  newFee: BN;
}

export interface UpdateRoyaltyArgs {
  newRoyaltyBps: number;
}

export interface UpdateTreasuryArgs {
  newTreasury: PublicKey;
}

export interface WithdrawTreasuryArgs {
  amount: BN;
}

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ClawDnaError {
  ProgramPaused = "ProgramPaused",
  Unauthorized = "Unauthorized",
  InvalidTreasury = "InvalidTreasury",
  InsufficientFee = "InsufficientFee",
  InvalidGenome = "InvalidGenome",
  SameParent = "SameParent",
  InvalidParent = "InvalidParent",
  GenerationOverflow = "GenerationOverflow",
  InvalidMetadata = "InvalidMetadata",
  MathOverflow = "MathOverflow",
  InvalidBump = "InvalidBump",
  FeeTransferFailed = "FeeTransferFailed",
  WithdrawalFailed = "WithdrawalFailed",
  AlreadyInitialized = "AlreadyInitialized",
  NotInitialized = "NotInitialized",
  InvalidCreator = "InvalidCreator",
  MetadataCreationFailed = "MetadataCreationFailed",
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TRAIT_COUNT = 8;
export const MAX_TRAIT_VALUE = 100;
export const MUTATION_RANGE = 5;
export const DEFAULT_ROYALTY_BPS = 500;

export const PROGRAM_SEED = "clawdna";
export const GLOBAL_STATE_SEED = "global_state";
export const AGENT_DATA_SEED = "agent_data";

// ============================================================================
// PROGRAM ID
// ============================================================================

export const CLAWDNA_PROGRAM_ID = new PublicKey(
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface GenomeScore {
  total: number;
  average: number;
  highestTrait: { index: number; value: number };
  lowestTrait: { index: number; value: number };
}

export interface BreedingResult {
  childGenome: number[];
  generation: number;
  parent1Genome: number[];
  parent2Genome: number[];
  mutations: number[];
}
