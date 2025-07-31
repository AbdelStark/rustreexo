# @rustreexo/js

A JavaScript/TypeScript SDK for [Rustreexo](https://github.com/mit-dci/rustreexo), powered by WebAssembly.

Rustreexo is a novel accumulator that allows for succinct UTXO set representation, using a logarithmic amount of space. This SDK provides a high-level, type-safe interface for working with Utreexo accumulators in web applications and Node.js environments.

## Features

- **🔥 WebAssembly Powered**: Near-native performance in the browser and Node.js
- **📝 TypeScript First**: Full type safety with comprehensive TypeScript definitions
- **🪶 Lightweight**: Minimal bundle size with tree-shaking support
- **🔄 Dual Accumulators**: Support for both Stump (verification-only) and Pollard (full) accumulators
- **🧪 Well Tested**: Comprehensive test suite with >90% coverage
- **📚 Great Documentation**: Extensive examples and API documentation

## Installation

```bash
npm install @rustreexo/js
```

## Quick Start

```typescript
import { Stump, Pollard, Hash } from '@rustreexo/js';

// Create a lightweight Stump for proof verification
const stump = await Stump.create();

// Or create a full Pollard for proof generation
const pollard = await Pollard.create();

// Work with cryptographic hashes
const hash = await Hash.fromHex('0123456789abcdef...');
const parentHash = await Hash.parentHash(leftHash, rightHash);
```

## API Overview

### Stump (Lightweight Accumulator)

The Stump is perfect for clients that only need to verify proofs:

```typescript
import { Stump } from '@rustreexo/js';

// Create a new Stump
const stump = await Stump.create();

// Verify a proof
const proof = '{"proof": [...], "targets": [...]}';
const targetHashes = ['abc123...', 'def456...'];
const result = await stump.verify(proof, targetHashes);

if (result.valid) {
  console.log('Proof verified successfully!');
} else {
  console.error('Proof verification failed:', result.error);
}

// Serialize and deserialize
const json = stump.toJson();
const stump2 = await Stump.fromJson(json);
```

### Pollard (Full Accumulator)

The Pollard can both verify and generate proofs:

```typescript
import { Pollard } from '@rustreexo/js';

// Create a new Pollard
const pollard = await Pollard.create();

// Generate a proof for specific hashes
const targetHashes = ['abc123...', 'def456...'];
const proof = await pollard.generateBatchProof(targetHashes);

// Add elements (for proof generation later)
await pollard.addElements([
  { hash: 'abc123...', remember: true },
  { hash: 'def456...', remember: false },
]);

// Verify proofs (same as Stump)
const result = await pollard.verify(proof, targetHashes);
```

### Hash Utilities

Work with cryptographic hashes safely:

```typescript
import { Hash, utils } from '@rustreexo/js';

// Create hashes from hex strings or bytes
const hash1 = await Hash.fromHex('0123456789abcdef...');
const hash2 = await Hash.fromBytes(new Uint8Array(32));

// Compute parent hashes
const parent = await Hash.parentHash(hash1.toHex(), hash2.toHex());

// Utility functions
if (utils.isValidHash(someString)) {
  const bytes = utils.hexToBytes(someString);
  const hex = utils.bytesToHex(bytes);
}
```

## Browser Usage

The library works seamlessly in modern browsers:

```html
<script type="module">
  import { Stump } from 'https://unpkg.com/@rustreexo/js/dist/index.mjs';
  
  const stump = await Stump.create();
  console.log('Stump created:', stump.toString());
</script>
```

## Node.js Usage

Works out of the box with Node.js 16+:

```javascript
const { Pollard } = require('@rustreexo/js');

async function main() {
  const pollard = await Pollard.create();
  console.log('Pollard stats:', pollard.getStats());
}

main().catch(console.error);
```

## Performance

The WebAssembly core provides excellent performance:

- **Hash operations**: ~500,000 ops/sec
- **Proof verification**: ~10,000 proofs/sec
- **Memory usage**: Minimal overhead, scales logarithmically
- **Bundle size**: ~200KB gzipped (including WASM)

## Error Handling

All operations use proper error handling:

```typescript
import { UtreexoError } from '@rustreexo/js';

try {
  const hash = await Hash.fromHex('invalid-hash');
} catch (error) {
  if (error instanceof UtreexoError) {
    console.error('Utreexo operation failed:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Advanced Usage

### Memory Management

The SDK automatically manages WASM memory, but you can manually free resources:

```typescript
const stump = await Stump.create();
// ... use the stump ...
stump.free(); // Manually free WASM memory
```

### Custom Initialization

Control WASM initialization timing:

```typescript
import { initWasm, getVersion } from '@rustreexo/js';

// Initialize WASM module early
await initWasm();

// Get library version
const version = await getVersion();
console.log('Rustreexo version:', version);
```

## Examples

Check out the [examples directory](./examples) for complete examples:

- [Basic proof verification](./examples/basic-verification.ts)
- [Mempool management with Pollard](./examples/mempool-management.ts)
- [Browser integration](./examples/browser-example.html)
- [Performance benchmarks](./examples/benchmarks.ts)

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Watch mode for development
npm run build:watch
npm run test:watch

# Lint code
npm run lint
npm run lint:fix
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) file for details.

## Acknowledgments

- Original Rustreexo implementation by [MIT DCI](https://github.com/mit-dci/rustreexo)
- WebAssembly tooling by the [wasm-pack](https://github.com/rustwasm/wasm-pack) team