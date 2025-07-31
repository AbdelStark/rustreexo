import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Shield, TreePine, Hash, Database, CheckCircle } from 'lucide-react';

const EducationSection: React.FC = () => {
  const concepts = [
    {
      icon: <TreePine className="w-6 h-6" />,
      title: "Merkle Forest",
      description: "A collection of perfect binary trees that efficiently stores UTXO commitments",
      details: "Each UTXO becomes a leaf in the forest. Trees are combined when they reach the same height, maintaining logarithmic proof sizes."
    },
    {
      icon: <Hash className="w-6 h-6" />,
      title: "Accumulator Roots",
      description: "A small set of root hashes that represent the entire UTXO set",
      details: "Instead of storing millions of UTXOs, nodes only need to keep track of a few dozen root hashes."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Inclusion Proofs",
      description: "Cryptographic proofs that verify a UTXO exists without the full set",
      details: "Proofs contain only the sibling hashes needed to reconstruct the path to a root, typically just a few KB."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Dynamic Updates",
      description: "Efficiently add new UTXOs and remove spent ones from the accumulator",
      details: "The forest structure allows for fast insertions and deletions while maintaining the compact representation."
    }
  ];

  const benefits = [
    {
      title: "Massive Storage Savings",
      description: "Reduce UTXO set from ~5GB to just a few KB of root hashes",
      icon: <Database className="w-5 h-5 text-bitcoin-500" />
    },
    {
      title: "Fast Initial Sync",
      description: "New nodes can sync instantly with just the accumulator state",
      icon: <Zap className="w-5 h-5 text-bitcoin-500" />
    },
    {
      title: "Lightweight Validation",
      description: "Verify transactions with minimal computational overhead",
      icon: <CheckCircle className="w-5 h-5 text-bitcoin-500" />
    },
    {
      title: "Preserved Security",
      description: "Maintains Bitcoin's security model with cryptographic guarantees",
      icon: <Shield className="w-5 h-5 text-bitcoin-500" />
    }
  ];

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-bitcoin-500 mr-3" />
            <h2 className="text-4xl font-bold text-gray-50">
              Understanding Utreexo
            </h2>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Learn how Utreexo revolutionizes Bitcoin's architecture by replacing the massive UTXO set
            with a compact accumulator structure.
          </p>
        </motion.div>

        {/* Core Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {concepts.map((concept, index) => (
            <motion.div
              key={concept.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card group hover:border-bitcoin-500/30 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-bitcoin-500/10 rounded-lg flex items-center justify-center text-bitcoin-500 group-hover:bg-bitcoin-500/20 transition-colors">
                  {concept.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-50 mb-2">
                    {concept.title}
                  </h3>
                  <p className="text-gray-400 mb-3">
                    {concept.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {concept.details}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-50 text-center mb-12">
            Why Utreexo Matters for Bitcoin
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-bitcoin-500/30 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-50 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-400">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Implementation Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="card">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-bitcoin-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-50">Stump</h3>
            </div>
            <p className="text-gray-400 mb-4">
              A lightweight verifier that only stores root hashes and can verify inclusion proofs.
              Perfect for mobile wallets and resource-constrained devices.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Minimal storage requirements
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Fast proof verification
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                No proof generation capability
              </li>
            </ul>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <TreePine className="w-6 h-6 text-bitcoin-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-50">Pollard</h3>
            </div>
            <p className="text-gray-400 mb-4">
              A full accumulator that maintains the forest structure and can generate proofs.
              Used by full nodes and bridge nodes in the Utreexo network.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Full forest maintenance
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Proof generation capability
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Higher storage requirements
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationSection;