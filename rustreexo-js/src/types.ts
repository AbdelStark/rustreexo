/**
 * Types for the Rustreexo JavaScript SDK
 */

/**
 * A 32-byte hash value represented as a hex string
 */
export type HashString = string;

/**
 * Configuration for Pollard additions
 */
export interface PollardAddition {
  /** The hash to add as a hex string */
  hash: HashString;
  /** Whether to remember this node for future proof generation */
  remember: boolean;
}

/**
 * Utreexo proof data structure
 */
export interface ProofData {
  /** Array of proof hashes */
  proof: HashString[];
  /** Target positions for the proof */
  targets: number[];
}

/**
 * Options for creating a Stump accumulator
 */
export interface StumpOptions {
  /** Initial root hashes */
  roots?: HashString[];
  /** Number of leaves in the accumulator */
  leaves?: number;
}

/**
 * Options for creating a Pollard accumulator
 */
export interface PollardOptions {
  /** Initial root hashes */
  roots?: HashString[];
  /** Number of leaves in the accumulator */
  leaves?: number;
}

/**
 * Result of a verification operation
 */
export interface VerificationResult {
  /** Whether the verification was successful */
  valid: boolean;
  /** Optional error message if verification failed */
  error?: string;
}

/**
 * Statistics about an accumulator
 */
export interface AccumulatorStats {
  /** Number of leaves in the accumulator */
  leaves: number;
  /** Current root hashes */
  roots: HashString[];
  /** Memory usage (estimated, in bytes) */
  estimatedMemoryUsage?: number;
}

/**
 * Error thrown by Rustreexo operations
 */
export class UtreexoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UtreexoError';
  }
}

/**
 * Hash utility class for working with 32-byte hashes
 */
export interface HashUtils {
  /** Convert hex string to bytes */
  hexToBytes(hex: HashString): Uint8Array;
  /** Convert bytes to hex string */
  bytesToHex(bytes: Uint8Array): HashString;
  /** Validate if a string is a valid hash */
  isValidHash(hash: string): boolean;
  /** Compute parent hash from two child hashes */
  parentHash(left: HashString, right: HashString): HashString;
}