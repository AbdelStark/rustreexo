import init, { WasmStump } from '@rustreexo/wasm';
import { HashString, StumpOptions, VerificationResult, AccumulatorStats, UtreexoError, ProofData } from './types.js';

/**
 * Stump is a lightweight implementation of the Utreexo accumulator that only stores roots.
 * It's designed for clients that need to verify proofs but don't need to generate them.
 * 
 * The Stump maintains the accumulator's roots and can verify proofs against them,
 * while using minimal memory compared to full accumulator implementations.
 */
export class Stump {
  private static initialized = false;
  private wasmStump: WasmStump;

  private constructor(wasmStump: WasmStump) {
    this.wasmStump = wasmStump;
  }

  /**
   * Ensure WASM module is initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!Stump.initialized) {
      await init();
      Stump.initialized = true;
    }
  }

  /**
   * Create a new empty Stump accumulator
   */
  static async create(_options: StumpOptions = {}): Promise<Stump> {
    await Stump.ensureInitialized();

    try {
      const wasmStump = new WasmStump();
      return new Stump(wasmStump);
    } catch (error) {
      throw new UtreexoError(`Failed to create Stump: ${error}`);
    }
  }

  /**
   * Create a Stump from serialized JSON data
   */
  static async fromJson(jsonData: string): Promise<Stump> {
    await Stump.ensureInitialized();

    try {
      const wasmStump = WasmStump.from_json(jsonData);
      return new Stump(wasmStump);
    } catch (error) {
      throw new UtreexoError(`Failed to create Stump from JSON: ${error}`);
    }
  }

  /**
   * Serialize the Stump to JSON
   */
  toJson(): string {
    try {
      return this.wasmStump.to_json();
    } catch (error) {
      throw new UtreexoError(`Failed to serialize Stump: ${error}`);
    }
  }

  /**
   * Get the number of leaves in the accumulator
   */
  getLeafCount(): number {
    return Number(this.wasmStump.num_leaves());
  }

  /**
   * Get the current root hashes
   */
  getRoots(): HashString[] {
    try {
      return this.wasmStump.roots() as HashString[];
    } catch (error) {
      throw new UtreexoError(`Failed to get roots: ${error}`);
    }
  }

  /**
   * Verify a proof against the current accumulator state
   * 
   * @param proof - The proof data (JSON string or ProofData object)
   * @param targetHashes - Array of hash strings to verify
   * @returns Promise resolving to verification result
   */
  async verify(proof: string | ProofData, targetHashes: HashString[]): Promise<VerificationResult> {
    try {
      const proofJson = typeof proof === 'string' ? proof : JSON.stringify(proof);
      const valid = this.wasmStump.verify(proofJson, targetHashes);
      
      if (valid) {
        return { valid };
      } else {
        return { valid, error: 'Proof verification failed' };
      }
    } catch (error) {
      return {
        valid: false,
        error: `Verification error: ${error}`
      };
    }
  }

  /**
   * Modify the accumulator by adding and deleting elements
   * 
   * @param proof - The proof for the modifications (JSON string or ProofData object)
   * @param addHashes - Array of hash strings to add
   * @param deleteHashes - Array of hash strings to delete
   */
  async modify(
    proof: string | ProofData,
    addHashes: HashString[],
    deleteHashes: HashString[]
  ): Promise<void> {
    try {
      const proofJson = typeof proof === 'string' ? proof : JSON.stringify(proof);
      this.wasmStump.modify(proofJson, addHashes, deleteHashes);
    } catch (error) {
      // Better error handling to preserve error details
      let errorMessage = 'Failed to modify Stump';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      } else if (error && typeof error === 'object') {
        errorMessage += `: ${JSON.stringify(error)}`;
      } else {
        errorMessage += `: ${error}`;
      }
      
      console.error('Raw WASM error in stump.modify():', error);
      throw new UtreexoError(errorMessage);
    }
  }

  /**
   * Get statistics about the current accumulator state
   */
  getStats(): AccumulatorStats {
    return {
      leaves: this.getLeafCount(),
      roots: this.getRoots(),
      estimatedMemoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage in bytes (rough calculation)
   */
  private estimateMemoryUsage(): number {
    const roots = this.getRoots();
    // Each root is 32 bytes, plus some overhead
    return roots.length * 32 + 64; // 64 bytes overhead estimate
  }

  /**
   * Create a copy of this Stump
   */
  async clone(): Promise<Stump> {
    const jsonData = this.toJson();
    return Stump.fromJson(jsonData);
  }

  /**
   * Check if the accumulator is empty
   */
  isEmpty(): boolean {
    return this.getLeafCount() === 0;
  }

  /**
   * Get a string representation of the Stump state
   */
  toString(): string {
    const stats = this.getStats();
    return `Stump(leaves=${stats.leaves}, roots=${stats.roots.length})`;
  }

  /**
   * Clean up WASM resources
   */
  free(): void {
    this.wasmStump.free();
  }
}