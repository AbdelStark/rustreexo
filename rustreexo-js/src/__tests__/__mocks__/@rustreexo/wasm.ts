// Mock implementation of the WASM module for testing

export class Hash {
  constructor(private hex: string) {}

  static from_bytes(bytes: Uint8Array): Hash {
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return new Hash(hex);
  }

  to_hex(): string {
    return this.hex;
  }

  to_bytes(): Uint8Array {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(this.hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  static parent_hash(left: Hash, right: Hash): Hash {
    // Mock implementation - just XOR the bytes for testing
    const leftBytes = left.to_bytes();
    const rightBytes = right.to_bytes();
    const resultBytes = new Uint8Array(32);
    
    for (let i = 0; i < 32; i++) {
      resultBytes[i] = leftBytes[i]! ^ rightBytes[i]!;
    }
    
    return Hash.from_bytes(resultBytes);
  }

  free(): void {
    // Mock - no cleanup needed
  }
}

export class WasmStump {
  private leaves = 0;
  private _roots: string[] = [];

  constructor() {}

  static from_json(json: string): WasmStump {
    const data = JSON.parse(json);
    const stump = new WasmStump();
    stump.leaves = data.leaves || 0;
    stump._roots = data.roots || [];
    return stump;
  }

  to_json(): string {
    return JSON.stringify({
      leaves: this.leaves,
      roots: this._roots
    });
  }

  num_leaves(): bigint {
    return BigInt(this.leaves);
  }

  roots(): any[] {
    return this._roots;
  }

  verify(_proof: string, _hashes: any[]): boolean {
    // Mock - always return true for testing
    return true;
  }

  modify(_proof: string, addHashes: string[], delHashes: string[]): void {
    // Mock implementation that simulates adding and removing elements
    this.leaves = this.leaves + addHashes.length - delHashes.length;
    
    // Simple mock: just add new hashes to roots for testing
    if (addHashes.length > 0) {
      this._roots.push(...addHashes);
    }
    
    // Remove deleted hashes from roots
    if (delHashes.length > 0) {
      this._roots = this._roots.filter(root => !delHashes.includes(root));
    }
  }

  free(): void {
    // Mock - no cleanup needed
  }
}

export class WasmPollard {
  private leaves = 0;
  private _roots: string[] = [];

  constructor() {}

  static from_roots(roots: any[], leaves: bigint): WasmPollard {
    const pollard = new WasmPollard();
    pollard._roots = roots;
    pollard.leaves = Number(leaves);
    return pollard;
  }

  num_leaves(): bigint {
    return BigInt(this.leaves);
  }

  roots(): any[] {
    return this._roots;
  }

  batch_proof(_targets: any[]): string {
    // Mock proof with correct format
    return JSON.stringify({ targets: [], hashes: [] });
  }

  prove_single(_hash: string): string {
    // Mock proof with correct format
    return JSON.stringify({ targets: [], hashes: [] });
  }

  verify(_proof: string, _hashes: any[]): boolean {
    // Mock - always return true for testing
    return true;
  }

  modify(_proof: string, additions: string, delHashes: string[]): void {
    // Mock implementation that simulates adding and removing elements
    const additionsParsed = JSON.parse(additions);
    this.leaves = this.leaves + additionsParsed.length - delHashes.length;
    
    // Simple mock: add new hashes to roots for testing
    if (additionsParsed.length > 0) {
      const newHashes = additionsParsed.map((item: any) => item.hash);
      this._roots.push(...newHashes);
    }
    
    // Remove deleted hashes from roots
    if (delHashes.length > 0) {
      this._roots = this._roots.filter(root => !delHashes.includes(root));
    }
  }

  free(): void {
    // Mock - no cleanup needed
  }
}

export class UtreexoError {
  constructor(public message: string) {}

  free(): void {
    // Mock - no cleanup needed
  }
}

export function version(): string {
  return '0.4.0-mock';
}

export function wasm_main(): void {
  // Mock - no-op
}

export default async function init(): Promise<void> {
  // Mock initialization - no-op
  return Promise.resolve();
}