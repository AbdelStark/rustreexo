/**
 * Custom WASM loader to handle initialization issues
 */

let wasmModule: any = null;
let initPromise: Promise<any> | null = null;

export async function initializeWasm(): Promise<any> {
  if (wasmModule) {
    return wasmModule;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Try different import strategies
      const wasmPkg = await import('@rustreexo/wasm');
      
      // Try to initialize with explicit WASM path
      if (typeof wasmPkg.default === 'function') {
        await wasmPkg.default();
      }
      
      wasmModule = wasmPkg;
      return wasmModule;
    } catch (error) {
      console.error('Failed to load WASM module:', error);
      
      // Try alternative loading with public path
      try {
        const wasmPkg = await import('@rustreexo/wasm');
        // Try loading from public directory
        const wasmUrl = '/wasm/rustreexo_wasm_bg.wasm';
        await wasmPkg.default(wasmUrl);
        wasmModule = wasmPkg;
        return wasmModule;
      } catch (fallbackError) {
        console.error('Fallback WASM loading also failed:', fallbackError);
        throw new Error(`WASM initialization failed: ${error.message}`);
      }
    }
  })();

  return initPromise;
}

export function getWasmModule(): any {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call initializeWasm() first.');
  }
  return wasmModule;
}