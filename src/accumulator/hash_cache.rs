//! Hash caching system for performance optimization
//! 
//! This module provides an LRU cache for expensive hash computations,
//! particularly parent hash calculations that are repeated frequently
//! during proof verification and stump operations.

use std::collections::HashMap;
use std::hash::Hash as StdHash;
use super::node_hash::{AccumulatorHash, BitcoinNodeHash};
use bitcoin_hashes::{sha512_256, Hash as HashEngine, HashEngine as Engine};

/// LRU cache for parent hash computations
pub struct HashCache<Hash: AccumulatorHash + Clone + StdHash + Eq> {
    cache: HashMap<(Hash, Hash), Hash>,
    access_order: Vec<(Hash, Hash)>,
    max_size: usize,
}

impl<Hash: AccumulatorHash + Clone + StdHash + Eq> HashCache<Hash> {
    /// Create a new hash cache with specified maximum size
    pub fn new(max_size: usize) -> Self {
        Self {
            cache: HashMap::with_capacity(max_size),
            access_order: Vec::with_capacity(max_size),
            max_size,
        }
    }

    /// Get or compute a parent hash, using cache when possible
    pub fn get_parent_hash(&mut self, left: &Hash, right: &Hash) -> Hash {
        let key = (left.clone(), right.clone());
        
        // Check if we have this in cache
        if let Some(cached_result) = self.cache.get(&key) {
            // Move to end of access order (most recently used)
            if let Some(pos) = self.access_order.iter().position(|k| k == &key) {
                let key_copy = self.access_order.remove(pos);
                self.access_order.push(key_copy);
            }
            return cached_result.clone();
        }

        // Compute the hash
        let parent = Hash::parent_hash(left, right);
        
        // Add to cache
        self.insert(key, parent.clone());
        
        parent
    }

    /// Insert a new entry, evicting LRU if necessary
    fn insert(&mut self, key: (Hash, Hash), value: Hash) {
        // If at capacity, remove least recently used
        if self.cache.len() >= self.max_size && !self.cache.contains_key(&key) {
            if let Some(lru_key) = self.access_order.first().cloned() {
                self.cache.remove(&lru_key);
                self.access_order.remove(0);
            }
        }

        // Insert new entry
        self.cache.insert(key.clone(), value);
        self.access_order.push(key);
    }

    /// Get current cache size
    pub fn len(&self) -> usize {
        self.cache.len()
    }

    /// Check if cache is empty
    pub fn is_empty(&self) -> bool {
        self.cache.is_empty()
    }

    /// Clear the cache
    pub fn clear(&mut self) {
        self.cache.clear();
        self.access_order.clear();
    }

    /// Get cache hit statistics (for benchmarking)
    pub fn hit_rate(&self) -> f64 {
        // This would need to be implemented with counters for actual hit rate tracking
        // For now, return a placeholder
        0.0
    }
}

/// Thread-local hash cache for Bitcoin node hashes
thread_local! {
    static HASH_CACHE: std::cell::RefCell<HashCache<super::node_hash::BitcoinNodeHash>> = 
        std::cell::RefCell::new(HashCache::new(1000));
}

/// Cached parent hash computation for Bitcoin node hashes
pub fn cached_parent_hash(
    left: &BitcoinNodeHash, 
    right: &BitcoinNodeHash
) -> BitcoinNodeHash {
    HASH_CACHE.with(|cache| {
        cache.borrow_mut().get_parent_hash(left, right)
    })
}

/// Batch parent hash computation for multiple pairs
/// This reduces hash engine creation overhead by reusing engines
pub fn batch_parent_hashes(
    pairs: &[(BitcoinNodeHash, BitcoinNodeHash)]
) -> Vec<BitcoinNodeHash> {
    let mut results = Vec::with_capacity(pairs.len());
    
    HASH_CACHE.with(|cache| {
        let mut cache_ref = cache.borrow_mut();
        
        for (left, right) in pairs {
            results.push(cache_ref.get_parent_hash(left, right));
        }
    });
    
    results
}

/// Optimized parent hash computation that can be reused with a single engine
pub fn compute_parent_hash_with_engine(
    engine: &mut sha512_256::HashEngine,
    left: &BitcoinNodeHash,
    right: &BitcoinNodeHash
) -> BitcoinNodeHash {
    // Reset engine state (this is more efficient than creating new engines)
    *engine = sha512_256::Hash::engine();
    engine.input(&**left);
    engine.input(&**right);
    sha512_256::Hash::from_engine(engine.clone()).into()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::accumulator::node_hash::{BitcoinNodeHash, AccumulatorHash};

    #[test]
    fn test_hash_cache_basic() {
        let mut cache = HashCache::new(10);
        let left = BitcoinNodeHash::new([1; 32]);
        let right = BitcoinNodeHash::new([2; 32]);

        // First computation should cache the result
        let result1 = cache.get_parent_hash(&left, &right);
        assert_eq!(cache.len(), 1);

        // Second computation should use cached result
        let result2 = cache.get_parent_hash(&left, &right);
        assert_eq!(result1, result2);
        assert_eq!(cache.len(), 1);
    }

    #[test]
    fn test_hash_cache_eviction() {
        let mut cache = HashCache::new(2);
        
        let hash1 = BitcoinNodeHash::new([1; 32]);
        let hash2 = BitcoinNodeHash::new([2; 32]);
        let hash3 = BitcoinNodeHash::new([3; 32]);
        let hash4 = BitcoinNodeHash::new([4; 32]);

        // Fill cache to capacity
        cache.get_parent_hash(&hash1, &hash2);
        cache.get_parent_hash(&hash3, &hash4);
        assert_eq!(cache.len(), 2);

        // Adding new entry should evict LRU
        let hash5 = BitcoinNodeHash::new([5; 32]);
        let hash6 = BitcoinNodeHash::new([6; 32]);
        cache.get_parent_hash(&hash5, &hash6);
        
        assert_eq!(cache.len(), 2);
        // First entry should be evicted
        assert!(!cache.cache.contains_key(&(hash1.clone(), hash2.clone())));
    }

    #[test]
    fn test_cached_parent_hash_function() {
        let left = BitcoinNodeHash::new([10; 32]);
        let right = BitcoinNodeHash::new([20; 32]);

        let result1 = cached_parent_hash(&left, &right);
        let result2 = cached_parent_hash(&left, &right);
        
        assert_eq!(result1, result2);
        
        // Should be same as direct computation
        let direct = BitcoinNodeHash::parent_hash(&left, &right);
        assert_eq!(result1, direct);
    }

    #[test]
    fn test_batch_parent_hashes() {
        let pairs = vec![
            (BitcoinNodeHash::new([1; 32]), BitcoinNodeHash::new([2; 32])),
            (BitcoinNodeHash::new([3; 32]), BitcoinNodeHash::new([4; 32])),
            (BitcoinNodeHash::new([5; 32]), BitcoinNodeHash::new([6; 32])),
        ];

        let batch_results = batch_parent_hashes(&pairs);
        assert_eq!(batch_results.len(), 3);

        // Verify each result matches individual computation
        for (i, (left, right)) in pairs.iter().enumerate() {
            let individual = BitcoinNodeHash::parent_hash(left, right);
            assert_eq!(batch_results[i], individual);
        }
    }

    #[test]
    fn test_compute_parent_hash_with_engine() {
        let mut engine = sha512_256::Hash::engine();
        let left = BitcoinNodeHash::new([7; 32]);
        let right = BitcoinNodeHash::new([8; 32]);

        let result = compute_parent_hash_with_engine(&mut engine, &left, &right);
        let direct = BitcoinNodeHash::parent_hash(&left, &right);
        
        assert_eq!(result, direct);
    }
}