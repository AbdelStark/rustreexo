import { useState } from 'react';
import { motion } from 'framer-motion';
import { TreePine, Shield, Zap } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import AccumulatorDemo from './components/AccumulatorDemo';
import TreeVisualization from './components/TreeVisualization';
import EducationSection from './components/EducationSection';
import Footer from './components/Footer';

function App() {
  const [activeTab, setActiveTab] = useState<'stump' | 'pollard'>('stump');

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="relative">
        {/* Hero Section */}
        <Hero />
        
        {/* Education Section */}
        <EducationSection />
        
        {/* Interactive Demo Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-bitcoin-500 mr-3" />
                <h2 className="text-4xl font-bold text-gray-50">
                  Interactive Utreexo Demo
                </h2>
              </div>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Experience the power of Utreexo accumulators with our live WASM implementation.
                Try adding and removing UTXOs to see how the accumulator maintains its compact size.
              </p>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="glass-effect rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('stump')}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    activeTab === 'stump'
                      ? 'bg-bitcoin-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Stump (Verification)
                </button>
                <button
                  onClick={() => setActiveTab('pollard')}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    activeTab === 'pollard'
                      ? 'bg-bitcoin-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <TreePine className="w-4 h-4 inline mr-2" />
                  Pollard (Full Accumulator)
                </button>
              </div>
            </div>

            {/* Demo Content */}
            <AccumulatorDemo activeTab={activeTab} />
          </div>
        </section>

        {/* Tree Visualization Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-800/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center mb-6">
                <TreePine className="w-8 h-8 text-bitcoin-500 mr-3" />
                <h2 className="text-4xl font-bold text-gray-50">
                  Binary Tree Visualization
                </h2>
              </div>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Watch how Utreexo builds and maintains its Merkle forest structure.
                Each UTXO becomes a leaf, and the tree grows efficiently as new outputs are added.
              </p>
            </motion.div>

            <TreeVisualization />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;