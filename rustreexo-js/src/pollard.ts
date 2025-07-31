import init, { WasmPollard } from '@rustreexo/wasm';
import { 
  HashString, 
  PollardOptions, 
  PollardAddition, 
  VerificationResult, 
  AccumulatorStats, 
  UtreexoError, 
  ProofData 
} from './types.js';

/**
 * Pollard is a full implementation of the Utreexo accumulator that can both verify and generate proofs.
 * It maintains a subset of the full tree in memory, making it suitable for applications like mempool
 * management where you need to cache unconfirmed transactions and generate proofs for them.
 * 
 * The Pollard is more memory-intensive than Stump but provides the ability to generate proofs
 * for any cached elements.
 */
export class Pollard {
  private static initialized = false;
  private wasmPollard: WasmPollard;

  private constructor(wasmPollard: WasmPollard) {
    this.wasmPollard = wasmPollard;
  }

  /**
   * Ensure WASM module is initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!Pollard.initialized) {
      await init();
      Pollard.initialized = true;
    }
  }

  /**
   * Create a new empty Pollard accumulator
   */
  static async create(options: PollardOptions = {}): Promise<Pollard> {
    await Pollard.ensureInitialized();

    try {
      let wasmPollard: WasmPollard;

      if (options.roots && options.leaves !== undefined) {
        wasmPollard = WasmPollard.from_roots(options.roots, BigInt(options.leaves));
      } else {
        wasmPollard = new WasmPollard();
      }

      return new Pollard(wasmPollard);
    } catch (error) {
      throw new UtreexoError(`Failed to create Pollard: ${error}`);
    }
  }

  /**
   * Create a Pollard from existing roots and leaf count
   */
  static async fromRoots(roots: HashString[], leaves: number): Promise<Pollard> {
    return Pollard.create({ roots, leaves });
  }

  /**
   * Get the number of leaves in the accumulator
   */
  getLeafCount(): number {
    return Number(this.wasmPollard.num_leaves());
  }

  /**
   * Get the current root hashes
   */
  getRoots(): HashString[] {
    try {
      return this.wasmPollard.roots() as HashString[];
    } catch (error) {
      throw new UtreexoError(`Failed to get roots: ${error}`);
    }
  }

  /**
   * Generate a batch proof for multiple target hashes
   * 
   * @param targetHashes - Array of hash strings to generate proof for
   * @returns Promise resolving to proof data as JSON string
   */
  async generateBatchProof(targetHashes: HashString[]): Promise<string> {
    try {
      return this.wasmPollard.batch_proof(targetHashes);
    } catch (error) {
      throw new UtreexoError(`Failed to generate batch proof: ${error}`);
    }
  }

  /**
   * Generate a proof for a single target hash
   * 
   * @param targetHash - Hash string to generate proof for
   * @returns Promise resolving to proof data as JSON string
   */
  async generateProof(targetHash: HashString): Promise<string> {
    try {
      return this.wasmPollard.prove_single(targetHash);
    } catch (error) {
      throw new UtreexoError(`Failed to generate proof: ${error}`);
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
      const valid = this.wasmPollard.verify(proofJson, targetHashes);
      
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
   * @param additions - Array of elements to add with their remember flags
   * @param deleteHashes - Array of hash strings to delete
   */
  async modify(
    proof: string | ProofData,
    additions: PollardAddition[],
    deleteHashes: HashString[]
  ): Promise<void> {
    try {
      const proofJson = typeof proof === 'string' ? proof : JSON.stringify(proof);
      const additionsJson = JSON.stringify(additions);
      this.wasmPollard.modify(proofJson, additionsJson, deleteHashes);
    } catch (error) {
      throw new UtreexoError(`Failed to modify Pollard: ${error}`);
    }
  }

  /**
   * Add elements to be remembered for proof generation
   * 
   * @param additions - Array of elements to add
   */
  async addElements(additions: PollardAddition[]): Promise<void> {
    // For additions without deletions, we need an empty proof
    const emptyProof = JSON.stringify({ proof: [], targets: [] });
    await this.modify(emptyProof, additions, []);
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
   * This is a very rough estimate as the actual memory usage depends on
   * the tree structure and number of cached nodes
   */
  private estimateMemoryUsage(): number {
    const leaves = this.getLeafCount();
    const roots = this.getRoots();
    
    // Very rough estimate: assume we cache about 10% of nodes on average
    // Each node is roughly 32 bytes for hash + some overhead
    const estimatedCachedNodes = Math.max(1, Math.floor(leaves * 0.1));
    const nodeMemory = estimatedCachedNodes * 64; // 32 bytes hash + 32 bytes overhead
    const rootMemory = roots.length * 32;
    
    return nodeMemory + rootMemory + 128; // 128 bytes base overhead
  }

  /**
   * Check if the accumulator is empty
   */
  isEmpty(): boolean {
    return this.getLeafCount() === 0;
  }

  /**
   * Get a string representation of the Pollard state
   */
  toString(): string {
    const stats = this.getStats();
    return `Pollard(leaves=${stats.leaves}, roots=${stats.roots.length}, ~${Math.round((stats.estimatedMemoryUsage || 0) / 1024)}KB)`;
  }

  /**
   * Clean up WASM resources
   */
  free(): void {
    this.wasmPollard.free();
  }
}