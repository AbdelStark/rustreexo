/**
 * Rustreexo JavaScript/TypeScript SDK
 * 
 * A WebAssembly-powered library for working with Utreexo accumulators in web applications.
 * Utreexo is a novel accumulator that allows for succinct UTXO set representation.
 * 
 * @example
 * ```typescript
 * import { Stump, Pollard, Hash } from '@rustreexo/js';
 * 
 * // Create a lightweight Stump for proof verification
 * const stump = await Stump.create();
 * 
 * // Or create a full Pollard for proof generation
 * const pollard = await Pollard.create();
 * 
 * // Work with hashes
 * const hash = await Hash.fromHex('0123456789abcdef...');
 * ```
 */

// Re-export all types
export * from './types.js';

// Re-export main classes
export { Hash } from './hash.js';
export { Stump } from './stump.js';
export { Pollard } from './pollard.js';

// Re-export WASM utilities for advanced usage
export { default as init, version } from '@rustreexo/wasm';

/**
 * Initialize the WASM module. This is called automatically when using the high-level API,
 * but can be called manually for more control over initialization timing.
 * 
 * @example
 * ```typescript
 * import { initWasm } from '@rustreexo/js';
 * 
 * // Initialize WASM before using any other functions
 * await initWasm();
 * ```
 */
export async function initWasm(): Promise<void> {
  const wasmInit = await import('@rustreexo/wasm');
  await wasmInit.default();
}

/**
 * Get the version of the Rustreexo library
 */
export async function getVersion(): Promise<string> {
  const wasmModule = await import('@rustreexo/wasm');
  await wasmModule.default();
  return wasmModule.version();
}

/**
 * Utility functions for common operations
 */
export const utils = {
  /**
   * Validate if a string is a valid 32-byte hash in hex format
   */
  isValidHash(hash: string): boolean {
    if (typeof hash !== 'string') {
      return false;
    }
    // Remove '0x' prefix if present
    const cleanHex = hash.replace(/^0x/, '');
    // Must be exactly 64 hex characters
    return /^[0-9a-fA-F]{64}$/.test(cleanHex);
  },

  /**
   * Convert hex string to Uint8Array
   */
  hexToBytes(hex: string): Uint8Array {
    if (!utils.isValidHash(hex)) {
      throw new Error(`Invalid hash format: ${hex}`);
    }
    const cleanHex = hex.replace(/^0x/, '');
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    return bytes;
  },

  /**
   * Convert Uint8Array to hex string
   */
  bytesToHex(bytes: Uint8Array): string {
    if (bytes.length !== 32) {
      throw new Error(`Hash must be exactly 32 bytes, got ${bytes.length}`);
    }
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Generate a random 32-byte hash for testing purposes
   * Note: This is NOT cryptographically secure and should only be used for testing
   */
  randomHash(): string {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return utils.bytesToHex(bytes);
  }
};