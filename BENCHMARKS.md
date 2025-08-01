# Rustreexo Performance Benchmarks

## Overview

The benchmark suite consists of three main categories:

1. **Stump Benchmarks** (`stump_benchmarks.rs`) - Lightweight accumulator operations
2. **Proof Benchmarks** (`proof_benchmarks.rs`) - Proof generation, verification, and serialization
3. **Accumulator Benchmarks** (`accumulator_benchmarks.rs`) - Comparative analysis of different accumulator implementations

## Quick Start

### Prerequisites

- Rust 1.70.0 or newer (see `rust-toolchain.toml`)
- Criterion 0.5 for detailed benchmarking
- At least 4GB RAM for larger benchmark datasets

### Running Benchmarks

```bash
# Run all benchmarks
cargo bench

# Run specific benchmark suite
cargo bench --bench stump_benchmarks
cargo bench --bench proof_benchmarks
cargo bench --bench accumulator_benchmarks

# Run with HTML reports (saved to target/criterion/)
cargo bench -- --output-format html
```

## Benchmark Categories

### 1. Stump Benchmarks

Tests the lightweight `Stump` accumulator implementation:

- **Add Operations**: Scaling from 10 to 10,000 elements
- **Mixed Operations**: Add then remove operations
- **Verification**: Proof verification performance
- **Serialization**: Binary serialization/deserialization
- **Memory Growth**: Memory usage patterns over time

**Key Metrics:**

- Throughput (elements/second)
- Latency (microseconds per operation)
- Memory efficiency
- Serialization overhead

### 2. Proof Benchmarks

Focuses on cryptographic proof operations:

- **Creation**: Proof generation with varying target counts
- **Verification**: Proof validation against accumulator state
- **Serialization**: Proof encoding/decoding performance
- **Subset Operations**: Proof subset extraction
- **Updates**: Proof updates for block transitions
- **Memory Efficiency**: Clone and memory usage patterns

**Key Metrics:**

- Proof size vs. target count
- Verification time complexity
- Update operation performance
- Memory allocation patterns

### 3. Accumulator Benchmarks

Comparative analysis of different accumulator implementations:

- **MemForest vs Stump**: Performance comparison
- **Proof Generation**: MemForest proof creation
- **Verification**: Cross-implementation verification
- **Pollard Operations**: Subset tracking performance
- **Serialization**: Size and speed comparisons
- **Memory Usage**: Memory footprint analysis

**Key Metrics:**

- Relative performance across implementations
- Memory vs. speed trade-offs
- Serialization efficiency
- Scalability characteristics

## Benchmark Design Principles

### Accuracy

- **Deterministic Data**: Seeded random number generation for reproducible results
- **Realistic Workloads**: Test data that mirrors real-world usage patterns
- **Statistical Significance**: Multiple iterations with statistical analysis
- **Baseline Isolation**: Pure operation measurement without setup overhead

### Performance Focus

- **Scaling Analysis**: Tests across multiple data sizes (100, 1K, 10K, 100K elements)
- **Bottleneck Identification**: Focused tests on critical code paths
- **Memory Profiling**: Allocation patterns and peak usage measurement
- **Regression Detection**: Consistent measurement for CI/CD integration

### Professional Standards

- **Criterion Integration**: Industry-standard benchmarking framework
- **HTML Reports**: Detailed analysis with graphs and statistics
- **Parameterized Tests**: Systematic variation of input parameters
- **Error Handling**: Proper handling of benchmark failures

## Contributing

### Adding New Benchmarks

1. **Identify Performance Critical Code**: Focus on hot paths
2. **Design Realistic Tests**: Mirror actual usage patterns
3. **Follow Naming Conventions**: `category_operation_parameter`
4. **Include Documentation**: Explain what is being measured
5. **Validate Accuracy**: Ensure measurements are meaningful

### Benchmark Review Checklist

- [ ] Uses deterministic test data
- [ ] Includes multiple parameter sizes
- [ ] Measures relevant metrics (time, throughput, memory)
- [ ] Follows project naming conventions
- [ ] Includes proper error handling
- [ ] Documents expected performance characteristics

## Related Documentation

- [Criterion User Guide](https://bheisler.github.io/criterion.rs/book/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
- [Rustreexo Algorithm Overview](README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

**Note**: These benchmarks are designed for development and optimization. For production performance testing, consider using dedicated benchmarking hardware and longer measurement periods.
