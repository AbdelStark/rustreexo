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
        const stumpInstance = await Stump.create();
        const pollardInstance = await Pollard.create();
        
        setStump(stumpInstance);
        setPollard(pollardInstance);
        
        // Initialize states
        setStumpState({
          leaves: stumpInstance.getLeafCount(),
          roots: stumpInstance.getRoots(),
          isLoading: false,
          error: null
        });
        
        setPollardState({
          leaves: pollardInstance.getLeafCount(),
          roots: pollardInstance.getRoots(),
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to initialize accumulators:', error);
        setStumpState(prev => ({ ...prev, error: `Initialization failed: ${error}` }));
        setPollardState(prev => ({ ...prev, error: `Initialization failed: ${error}` }));
      }
    };

    initAccumulators();
  }, []);

  const generateRandomHash = () => {
    const randomHash = utils.randomHash();
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
      // For this demo, we'll simulate adding by creating a new accumulator with more elements
      // In a real implementation, you'd call accumulator.add([newHashInput])
      
      // Generate some demo data
      const demoHashes = [newHashInput, utils.randomHash(), utils.randomHash()];
      
      if (activeTab === 'stump') {
        // Stump doesn't support adding directly, so we'll create with initial data
        const newStump = await Stump.create({ roots: demoHashes.slice(0, 2), leaves: demoHashes.length });
        setStump(newStump);
        setStumpState({
          leaves: newStump.getLeafCount(),
          roots: newStump.getRoots(),
          isLoading: false,
          error: null
        });
      } else {
        // Pollard can be updated
        const newPollard = await Pollard.create({ roots: demoHashes, leaves: demoHashes.length });
        setPollard(newPollard);
        setPollardState({
          leaves: newPollard.getLeafCount(),
          roots: newPollard.getRoots(),
          isLoading: false,
          error: null
        });
      }

      setNewHashInput('');
    } catch (error) {
      if (activeTab === 'stump') {
        setStumpState(prev => ({ ...prev, isLoading: false, error: `Failed to add: ${error}` }));
      } else {
        setPollardState(prev => ({ ...prev, isLoading: false, error: `Failed to add: ${error}` }));
      }
    }
  };

  const resetAccumulator = async () => {
    if (activeTab === 'stump') {
      setStumpState(prev => ({ ...prev, isLoading: true, error: null }));
    } else {
      setPollardState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      if (activeTab === 'stump') {
        const newStump = await Stump.create();
        setStump(newStump);
        setStumpState({
          leaves: newStump.getLeafCount(),
          roots: newStump.getRoots(),
          isLoading: false,
          error: null
        });
      } else {
        const newPollard = await Pollard.create();
        setPollard(newPollard);
        setPollardState({
          leaves: newPollard.getLeafCount(),
          roots: newPollard.getRoots(),
          isLoading: false,
          error: null
        });
      }
      
      setProofData('');
      setVerificationResult(null);
    } catch (error) {
      if (activeTab === 'stump') {
        setStumpState(prev => ({ ...prev, isLoading: false, error: `Failed to reset: ${error}` }));
      } else {
        setPollardState(prev => ({ ...prev, isLoading: false, error: `Failed to reset: ${error}` }));
      }
    }
  };

  const generateProof = async () => {
    if (activeTab !== 'pollard' || !pollard || !newHashInput.trim()) {
      alert('Proof generation is only available for Pollard with a valid target hash');
      return;
    }

    try {
      const proof = await pollard.generateBatchProof([newHashInput]);
      setProofData(proof);
    } catch (error) {
      console.error('Failed to generate proof:', error);
      setProofData(`Error: ${error}`);
    }
  };

  const verifyProof = async () => {
    if (!proofData.trim() || !newHashInput.trim()) {
      alert('Please provide both proof data and target hash');
      return;
    }

    const accumulator = activeTab === 'stump' ? stump : pollard;
    if (!accumulator) return;

    try {
      const result = await accumulator.verify(proofData, [newHashInput]);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ valid: false, error: `Verification failed: ${error}` });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const currentState = activeTab === 'stump' ? stumpState : pollardState;

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
            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Leaf Count</div>
              <div className="text-2xl font-mono text-bitcoin-400">{currentState.leaves}</div>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg">
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
                  className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 text-sm font-mono focus:outline-none focus:border-bitcoin-500"
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
              <button
                onClick={generateProof}
                disabled={!newHashInput.trim() || !utils.isValidHash(newHashInput)}
                className="btn-outline w-full"
              >
                Generate Proof
              </button>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Proof Data (JSON)</label>
              <textarea
                value={proofData}
                onChange={(e) => setProofData(e.target.value)}
                placeholder="Paste proof data here or generate one..."
                className="w-full h-24 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 text-xs font-mono resize-none focus:outline-none focus:border-bitcoin-500"
              />
            </div>

            <button
              onClick={verifyProof}
              disabled={!proofData.trim() || !newHashInput.trim()}
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