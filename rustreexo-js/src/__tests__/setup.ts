// Jest setup file for WASM module testing
// This ensures the WASM module is properly initialized before tests run

import { initWasm } from '../index.js';

beforeAll(async () => {
  // Initialize the WASM module before running any tests
  await initWasm();
});