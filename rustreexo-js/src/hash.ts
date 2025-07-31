import init, { Hash as WasmHash } from '@rustreexo/wasm';
import { HashString, HashUtils, UtreexoError } from './types.js';

/**
 * Hash utility class providing cryptographic hash operations for Rustreexo
 */
export class Hash implements HashUtils {
  private static initialized = false;
  private wasmHash: WasmHash;

  private constructor(wasmHash: WasmHash) {
    this.wasmHash = wasmHash;
  }

  /**
   * Ensure WASM module is initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!Hash.initialized) {
      await init();
      Hash.initialized = true;
    }
  }

  /**
   * Create a Hash from a hex string
   */
  static async fromHex(hex: HashString): Promise<Hash> {
    await Hash.ensureInitialized();
    
    if (!Hash.prototype.isValidHash(hex)) {
      throw new UtreexoError(`Invalid hash format: ${hex}`);
    }

    try {
      const wasmHash = new WasmHash(hex);
      return new Hash(wasmHash);
    } catch (error) {
      throw new UtreexoError(`Failed to create hash: ${error}`);
    }
  }

  /**
   * Create a Hash from bytes
   */
  static async fromBytes(bytes: Uint8Array): Promise<Hash> {
    await Hash.ensureInitialized();
    
    if (bytes.length !== 32) {
      throw new UtreexoError(`Hash must be exactly 32 bytes, got ${bytes.length}`);
    }

    try {
      const wasmHash = WasmHash.from_bytes(bytes);
      return new Hash(wasmHash);
    } catch (error) {
      throw new UtreexoError(`Failed to create hash from bytes: ${error}`);
    }
  }

  /**
   * Compute the parent hash of two child hashes
   */
  static async parentHash(left: HashString, right: HashString): Promise<Hash> {
    await Hash.ensureInitialized();

    const leftHash = await Hash.fromHex(left);
    const rightHash = await Hash.fromHex(right);

    try {
      const parentWasmHash = WasmHash.parent_hash(leftHash.wasmHash, rightHash.wasmHash);
      return new Hash(parentWasmHash);
    } catch (error) {
      throw new UtreexoError(`Failed to compute parent hash: ${error}`);
    }
  }

  /**
   * Get the hex string representation of this hash
   */
  toHex(): HashString {
    return this.wasmHash.to_hex();
  }

  /**
   * Get the bytes representation of this hash
   */
  toBytes(): Uint8Array {
    return this.wasmHash.to_bytes();
  }

  /**
   * Convert hex string to bytes
   */
  hexToBytes(hex: HashString): Uint8Array {
    if (!this.isValidHash(hex)) {
      throw new UtreexoError(`Invalid hash format: ${hex}`);
    }

    // Remove '0x' prefix if present
    const cleanHex = hex.replace(/^0x/, '');
    
    if (cleanHex.length !== 64) {
      throw new UtreexoError(`Hash must be 64 hex characters, got ${cleanHex.length}`);
    }

    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  /**
   * Convert bytes to hex string
   */
  bytesToHex(bytes: Uint8Array): HashString {
    if (bytes.length !== 32) {
      throw new UtreexoError(`Hash must be exactly 32 bytes, got ${bytes.length}`);
    }

    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Validate if a string is a valid hash
   */
  isValidHash(hash: string): boolean {
    if (typeof hash !== 'string') {
      return false;
    }

    // Remove '0x' prefix if present
    const cleanHex = hash.replace(/^0x/, '');
    
    // Must be exactly 64 hex characters
    if (cleanHex.length !== 64) {
      return false;
    }

    // Must contain only hex characters
    return /^[0-9a-fA-F]{64}$/.test(cleanHex);
  }

  /**
   * Compute parent hash from two child hashes (static utility)
   */
  parentHash(left: HashString, right: HashString): HashString {
    // This is a sync wrapper - for async operations use the static method
    throw new UtreexoError('Use Hash.parentHash() static method for computing parent hashes');
  }

  /**
   * Clean up WASM resources
   */
  free(): void {
    this.wasmHash.free();
  }

  /**
   * String representation
   */
  toString(): string {
    return this.toHex();
  }

  /**
   * Equality comparison
   */
  equals(other: Hash): boolean {
    return this.toHex() === other.toHex();
  }
}