# Baseline Performance Metrics

Generated on: 2025-08-01  
Branch: performance/memory-optimizations  
Commit: Initial baseline before optimizations

## Current Performance Results

| Operation | Target Count | Throughput | Time |
|-----------|-------------|------------|------|
| MemForest Proof Generation | 1 | 3.64 Melem/s | 798.83 ns |
| MemForest Proof Generation | 10 | 3.62 Melem/s | 2.77 µs |
| MemForest Verification | 1 | 382.37 Kelem/s | 2.62 µs |
| MemForest Verification | 10 | 1.85 Melem/s | 5.41 µs |
| Pollard Roots | 10 | 446.76 Melem/s | 22.38 ns |
| Pollard Leaves | 10 | 29.20 Gelem/s | 342.53 ps |
| Proof Creation | 1 | 30.00 Melem/s | 33.34 ns |
| Proof Creation | 10 | 125.38 Melem/s | 79.76 ns |
| Proof Verification | 1 | 660.56 Kelem/s | 1.51 µs |
| Proof Verification | 10 | 1.86 Melem/s | 5.38 µs |
| Stump Modify (Add) | 10 | 3.25 Melem/s | 3.07 µs |

## Optimization Targets

Based on the optimization plan, our primary targets are:
- **MemForest operations**: Currently the slowest operations
- **Stump Modify**: Core operation that needs improvement  
- **Memory allocation patterns**: Reduce allocation overhead

## Next Steps

1. Phase 1: Memory allocation optimizations
2. Focus on vector pre-allocation and clone reduction
3. Target stump.rs modify function and proof generation paths