import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Hash, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { Stump, Pollard, utils } from '@rustreexo/js';

interface AccumulatorDemoProps {
  activeTab: 'stump' | 'pollard';
}

interface AccumulatorState {
  leaves: number;
  roots: string[];
  isLoading: boolean;
  error: string | null;
}

const AccumulatorDemo: React.FC<AccumulatorDemoProps> = ({ activeTab }) => {
  const [stumpState, setStumpState] = useState<AccumulatorState>({
    leaves: 0,
    roots: [],
    isLoading: false,
    error: null,
  });
  
  const [pollardState, setPollardState] = useState<AccumulatorState>({
    leaves: 0,
    roots: [],
    isLoading: false,
    error: null,
  });

  const [stump, setStump] = useState<Stump | null>(null);
  const [pollard, setPollard] = useState<Pollard | null>(null);
  const [newHashInput, setNewHashInput] = useState('');
  const [proofData, setProofData] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{valid: boolean; error?: string} | null>(null);

  // Initialize accumulators
  useEffect(() => {
    const initAccumulators = async () => {
      try {
        console.log('🚀 [WASM] Initializing accumulators...');
        
        // The WASM module will be automatically initialized by the SDK
        console.log('🔧 [WASM] Creating Stump instance...');
        const stumpInstance = await Stump.create();
        console.log('✅ [WASM] Stump.create() -> Success', {
          leaves: stumpInstance.getLeafCount(),
          roots: stumpInstance.getRoots()
        });
        
        console.log('🔧 [WASM] Creating Pollard instance...');
        const pollardInstance = await Pollard.create();
        console.log('✅ [WASM] Pollard.create() -> Success', {
          leaves: pollardInstance.getLeafCount(),
          roots: pollardInstance.getRoots()
        });
        
        setStump(stumpInstance);
        setPollard(pollardInstance);
        
        // Initialize states
        const stumpState = {
          leaves: stumpInstance.getLeafCount(),
          roots: stumpInstance.getRoots(),
          isLoading: false,
          error: null
        };
        
        const pollardState = {
          leaves: pollardInstance.getLeafCount(),
          roots: pollardInstance.getRoots(),
          isLoading: false,
          error: null
        };
        
        console.log('📊 [WASM] Initial state:', { stumpState, pollardState });
        
        setStumpState(stumpState);
        setPollardState(pollardState);
      } catch (error) {
        console.error('❌ [WASM] Failed to initialize accumulators:', error);
        console.error('❌ [WASM] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        setStumpState(prev => ({ ...prev, error: `Initialization failed: ${error}` }));
        setPollardState(prev => ({ ...prev, error: `Initialization failed: ${error}` }));
      }
    };

    initAccumulators();
  }, []);

  const generateRandomHash = () => {
    console.log('🎲 [WASM] Generating random hash...');
    const randomHash = utils.randomHash();
    console.log('✅ [WASM] utils.randomHash() -> Success:', randomHash);
    setNewHashInput(randomHash);
  };

  const addToAccumulator = async () => {
    if (!newHashInput.trim() || !utils.isValidHash(newHashInput)) {
      alert('Please enter a valid 64-character hex hash');
      return;
    }

    const setState = activeTab === 'stump' ? setStumpState : setPollardState;
    const accumulator = activeTab === 'stump' ? stump : pollard;

    if (!accumulator) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`🔧 [WASM] Adding element to ${activeTab}:`, { hash: newHashInput });
      
      if (activeTab === 'stump' && stump) {
        // For Stump, we need a proof to add elements. For demo purposes, use empty proof
        const emptyProof = JSON.stringify({ proof: [], targets: [] });
        console.log('🔧 [WASM] Calling stump.modify() with:', {
          proof: emptyProof,
          addHashes: [newHashInput],
          deleteHashes: []
        });
        
        await stump.modify(emptyProof, [newHashInput], []);
        
        const newState = {
          leaves: stump.getLeafCount(),
          roots: stump.getRoots(),
          isLoading: false,
          error: null
        };
        
        console.log('✅ [WASM] stump.modify() -> Success. New state:', newState);
        setStumpState(newState);
      } else if (activeTab === 'pollard' && pollard) {
        // Pollard can add elements directly
        const additions = [{ hash: newHashInput, remember: true }];
        console.log('🔧 [WASM] Calling pollard.addElements() with:', additions);
        
        await pollard.addElements(additions);
        
        const newState = {
          leaves: pollard.getLeafCount(),
          roots: pollard.getRoots(),
          isLoading: false,
          error: null
        };
        
        console.log('✅ [WASM] pollard.addElements() -> Success. New state:', newState);
        setPollardState(newState);
      }

      setNewHashInput('');
    } catch (error) {
      console.error(`❌ [WASM] Failed to add element to ${activeTab}:`, error);
      console.error('❌ [WASM] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        input: newHashInput
      });
      
      if (activeTab === 'stump') {
        setStumpState(prev => ({ ...prev, isLoading: false, error: `Failed to add: ${error}` }));
      } else {
        setPollardState(prev => ({ ...prev, isLoading: false, error: `Failed to add: ${error}` }));
      }
    }
  };

  const resetAccumulator = async () => {
    console.log(`🔄 [WASM] Resetting ${activeTab} accumulator...`);
    
    if (activeTab === 'stump') {
      setStumpState(prev => ({ ...prev, isLoading: true, error: null }));
    } else {
      setPollardState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      if (activeTab === 'stump') {
        console.log('🔧 [WASM] Creating new Stump instance...');
        const newStump = await Stump.create();
        
        const newState = {
          leaves: newStump.getLeafCount(),
          roots: newStump.getRoots(),
          isLoading: false,
          error: null
        };
        
        console.log('✅ [WASM] Stump.create() -> Success. New state:', newState);
        setStump(newStump);
        setStumpState(newState);
      } else {
        console.log('🔧 [WASM] Creating new Pollard instance...');
        const newPollard = await Pollard.create();
        
        const newState = {
          leaves: newPollard.getLeafCount(),
          roots: newPollard.getRoots(),
          isLoading: false,
          error: null
        };
        
        console.log('✅ [WASM] Pollard.create() -> Success. New state:', newState);
        setPollard(newPollard);
        setPollardState(newState);
      }
      
      console.log('🗑️ [WASM] Clearing proof data and verification results');
      setProofData('');
      setVerificationResult(null);
    } catch (error) {
      console.error(`❌ [WASM] Failed to reset ${activeTab}:`, error);
      console.error('❌ [WASM] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (activeTab === 'stump') {
        setStumpState(prev => ({ ...prev, isLoading: false, error: `Failed to reset: ${error}` }));
      } else {
        setPollardState(prev => ({ ...prev, isLoading: false, error: `Failed to reset: ${error}` }));
      }
    }
  };

  const generateProof = async () => {
    console.log('🔍 [WASM] Generating proof...');
    
    if (activeTab !== 'pollard' || !pollard) {
      console.warn('⚠️ [WASM] Proof generation only available for Pollard accumulator');
      alert('Proof generation is only available for Pollard accumulator');
      return;
    }

    const roots = pollard.getRoots();
    console.log('🔧 [WASM] Current Pollard roots:', roots);
    
    if (roots.length === 0) {
      console.warn('⚠️ [WASM] No elements in accumulator for proof generation');
      alert('No elements in the accumulator to generate proof for');
      return;
    }

    setPollardState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Generate proof for a specific hash or all roots
      let targetHash: string;
      let proof: string;
      
      if (newHashInput.trim() && utils.isValidHash(newHashInput)) {
        // Generate proof for the specified hash
        targetHash = newHashInput;
        console.log('🔧 [WASM] Calling pollard.generateProof() for specified hash:', targetHash);
        proof = await pollard.generateProof(targetHash);
      } else {
        // Generate proof for the first root as an example
        targetHash = roots[0];
        console.log('🔧 [WASM] Calling pollard.generateProof() for first root:', targetHash);
        proof = await pollard.generateProof(targetHash);
      }
      
      console.log('✅ [WASM] pollard.generateProof() -> Success:', {
        targetHash,
        proofLength: proof.length,
        proofPreview: proof.substring(0, 100) + (proof.length > 100 ? '...' : '')
      });
      
      setProofData(proof);
      setPollardState(prev => ({ ...prev, isLoading: false }));
      
      alert(`Proof generated for hash: ${targetHash.substring(0, 8)}...${targetHash.substring(56)}`);
    } catch (error) {
      console.error('❌ [WASM] Proof generation failed:', error);
      console.error('❌ [WASM] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        targetHash: newHashInput.trim() || 'first root',
        rootsAvailable: pollard?.getRoots().length || 0
      });
      
      setPollardState(prev => ({ ...prev, isLoading: false, error: `Proof generation failed: ${error}` }));
      setProofData(`Error: ${error}`);
    }
  };

  const verifyProof = async () => {
    console.log('✅ [WASM] Verifying proof...');
    
    if (!proofData.trim()) {
      console.warn('⚠️ [WASM] No proof data provided for verification');
      alert('Please provide proof data to verify');
      return;
    }

    const accumulator = activeTab === 'stump' ? stump : pollard;
    if (!accumulator) {
      console.error('❌ [WASM] No accumulator instance available for verification');
      return;
    }
    
    console.log('🔧 [WASM] Using accumulator:', activeTab);
    console.log('🔧 [WASM] Proof data length:', proofData.length);

    try {
      // Try to extract target hashes from proof data or use input hash
      let targetHashes: string[] = [];
      
      console.log('🔧 [WASM] Parsing proof data...');
      try {
        const parsedProof = JSON.parse(proofData);
        targetHashes = parsedProof.targets || [];
        console.log('✅ [WASM] Parsed proof structure:', {
          hasTargets: !!parsedProof.targets,
          targetsCount: targetHashes.length,
          hasProofField: !!parsedProof.proof,
          proofType: typeof parsedProof.proof
        });
      } catch (parseError) {
        console.warn('⚠️ [WASM] Failed to parse proof data as JSON:', parseError);
      }
      
      // If no targets in proof and we have an input hash, use that
      if (targetHashes.length === 0 && newHashInput.trim() && utils.isValidHash(newHashInput)) {
        targetHashes = [newHashInput];
        console.log('🔧 [WASM] Using input hash as target:', newHashInput);
      }
      
      // If still no targets, try to use one of the roots
      if (targetHashes.length === 0) {
        const roots = accumulator.getRoots();
        console.log('🔧 [WASM] Current accumulator roots:', roots);
        
        if (roots.length > 0) {
          targetHashes = [roots[0]];
          console.log('🔧 [WASM] Using first root as target:', roots[0]);
        } else {
          console.error('❌ [WASM] No target hashes available for verification');
          setVerificationResult({ valid: false, error: 'No target hashes available for verification' });
          return;
        }
      }
      
      console.log('🔧 [WASM] Calling accumulator.verify() with:', {
        proofDataLength: proofData.length,
        targetHashes,
        accumulatorType: activeTab
      });

      const result = await accumulator.verify(proofData, targetHashes);
      
      console.log('✅ [WASM] accumulator.verify() -> Result:', result);
      setVerificationResult(result);
    } catch (error) {
      console.error('❌ [WASM] Proof verification failed:', error);
      console.error('❌ [WASM] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        proofDataLength: proofData.length,
        inputHash: newHashInput,
        accumulatorType: activeTab
      });
      
      setVerificationResult({ valid: false, error: `Verification failed: ${error}` });
    }
  };

  const copyToClipboard = (text: string) => {
    console.log('📋 [WASM] Copying to clipboard:', { 
      textLength: text.length, 
      preview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
    });
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ [WASM] Successfully copied to clipboard');
    }).catch((error) => {
      console.error('❌ [WASM] Failed to copy to clipboard:', error);
    });
  };

  const currentState = activeTab === 'stump' ? stumpState : pollardState;
  
  // Log tab changes for debugging
  useEffect(() => {
    console.log(`🔄 [WASM] Switched to ${activeTab} tab`, {
      state: currentState,
      hasAccumulator: activeTab === 'stump' ? !!stump : !!pollard
    });
  }, [activeTab]);
  
  // Log input validation
  useEffect(() => {
    if (newHashInput.trim()) {
      const isValid = utils.isValidHash(newHashInput);
      console.log('🔍 [WASM] Hash input validation:', {
        input: newHashInput,
        isValid,
        length: newHashInput.length
      });
    }
  }, [newHashInput]);
  
  // Log proof data changes
  useEffect(() => {
    if (proofData.trim()) {
      console.log('📄 [WASM] Proof data updated:', {
        length: proofData.length,
        preview: proofData.substring(0, 100) + (proofData.length > 100 ? '...' : ''),
        isValidJSON: (() => {
          try {
            JSON.parse(proofData);
            return true;
          } catch {
            return false;
          }
        })()
      });
    }
  }, [proofData]);
  
  // Log verification results
  useEffect(() => {
    if (verificationResult) {
      console.log('✅ [WASM] Verification result updated:', verificationResult);
    }
  }, [verificationResult]);

  return (
    <div className="space-y-8">
      {/* Accumulator State Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-50">
            {activeTab === 'stump' ? 'Stump' : 'Pollard'} State
          </h3>
          <button
            onClick={resetAccumulator}
            disabled={currentState.isLoading}
            className="btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${currentState.isLoading ? 'animate-spin' : ''}`} />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Leaf Count</div>
              <div className="text-2xl font-mono text-bitcoin-400">{currentState.leaves}</div>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Root Count</div>
              <div className="text-2xl font-mono text-bitcoin-400">{currentState.roots.length}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-400 mb-2">Root Hashes</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {currentState.roots.length > 0 ? (
                currentState.roots.map((root, index) => (
                  <div key={index} className="hash-display group cursor-pointer" onClick={() => copyToClipboard(root)}>
                    <div className="flex items-center justify-between">
                      <span className="truncate">{root}</span>
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm italic">No roots (empty accumulator)</div>
              )}
            </div>
          </div>
        </div>

        {currentState.error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {currentState.error}
          </div>
        )}
      </motion.div>

      {/* Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Operation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          <h4 className="text-xl font-semibold text-gray-50 mb-4">Add Elements</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Hash (32 bytes hex)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newHashInput}
                  onChange={(e) => setNewHashInput(e.target.value)}
                  placeholder="Enter 64-character hex hash..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 text-sm font-mono focus:outline-none focus:border-bitcoin-500"
                />
                <button
                  onClick={generateRandomHash}
                  className="btn-secondary whitespace-nowrap"
                >
                  <Hash className="w-4 h-4 mr-1" />
                  Random
                </button>
              </div>
              {newHashInput && !utils.isValidHash(newHashInput) && (
                <div className="text-red-400 text-xs mt-1">Invalid hash format</div>
              )}
            </div>

            <button
              onClick={addToAccumulator}
              disabled={currentState.isLoading || !newHashInput.trim() || !utils.isValidHash(newHashInput)}
              className="btn-primary w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to {activeTab === 'stump' ? 'Stump' : 'Pollard'}
            </button>
          </div>
        </motion.div>

        {/* Proof Operations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <h4 className="text-xl font-semibold text-gray-50 mb-4">Proof Operations</h4>
          
          <div className="space-y-4">
            {activeTab === 'pollard' && (
              <div className="space-y-2">
                <button
                  onClick={generateProof}
                  disabled={pollardState.isLoading || pollardState.leaves === 0}
                  className="btn-outline w-full"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Generate Proof
                </button>
                <div className="text-xs text-gray-500">
                  {newHashInput.trim() && utils.isValidHash(newHashInput) 
                    ? `Will generate proof for: ${newHashInput.substring(0, 8)}...`
                    : `Will generate proof for first element in accumulator`
                  }
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Proof Data (JSON)</label>
              <textarea
                value={proofData}
                onChange={(e) => setProofData(e.target.value)}
                placeholder="Paste proof data here or generate one..."
                className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 text-xs font-mono resize-none focus:outline-none focus:border-bitcoin-500"
              />
            </div>

            <button
              onClick={verifyProof}
              disabled={!proofData.trim()}
              className="btn-primary w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Proof
            </button>

            <AnimatePresence>
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg border ${
                    verificationResult.valid
                      ? 'bg-green-900/20 border-green-500/30 text-green-400'
                      : 'bg-red-900/20 border-red-500/30 text-red-400'
                  }`}
                >
                  <div className="flex items-center">
                    {verificationResult.valid ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    <span className="text-sm">
                      {verificationResult.valid ? 'Proof is valid!' : `Invalid proof: ${verificationResult.error}`}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccumulatorDemo;