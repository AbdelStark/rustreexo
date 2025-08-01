# Rustreexo Performance Benchmarks

This document describes the comprehensive performance benchmarking suite for the Rustreexo project. These benchmarks are designed for accurate measurement, performance regression detection, and optimization guidance.

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

# Run simple compatibility benchmark
cargo bench --bench simple_benchmark
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

## Interpreting Results

### Understanding Output

```
stump_modify_add_only/add_elements/1000
                        time:   [95.234 µs 96.108 µs 97.122 µs]
                        thrpt:  [10.297 Melem/s 10.405 Melem/s 10.500 Melem/s]
```

- **time**: Operation latency (lower is better)
- **thrpt**: Throughput in mega-elements per second (higher is better)
- **Confidence intervals**: Statistical significance bounds

### Performance Targets

Based on Bitcoin UTXO set characteristics:

- **Stump operations**: < 100µs for 1000 elements
- **Proof verification**: < 10ms for complex proofs
- **Memory usage**: Linear scaling with acceptable constants
- **Serialization**: < 1MB/s overhead for large datasets

## CI/CD Integration

### GitHub Actions Setup

```yaml
name: Performance Benchmarks
on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
    - name: Run benchmarks
      run: cargo bench
    - name: Upload benchmark results
      uses: actions/upload-artifact@v3
      with:
        name: benchmark-results
        path: target/criterion/
```

### Performance Regression Detection

```bash
# Save baseline
cargo bench -- --save-baseline main

# Compare against baseline
cargo bench -- --baseline main

# Generate comparison report
criterion-compare main current
```

## Local Development Workflow

### Quick Performance Check

```bash
# Fast compatibility check
cargo bench --bench simple_benchmark

# Full accuracy measurement
cargo bench --quiet | tee benchmark-results.txt
```

### Profiling Integration

```bash
# Generate flame graphs (requires cargo-flamegraph)
cargo flamegraph --bench stump_benchmarks

# Memory profiling (requires valgrind)
cargo bench --bench stump_benchmarks --features dhat-heap
```

### Optimization Workflow

1. **Baseline**: Run benchmarks before changes
2. **Implement**: Make performance improvements
3. **Measure**: Run benchmarks after changes
4. **Analyze**: Compare results and identify gains
5. **Validate**: Ensure correctness with existing tests

## Advanced Usage

### Custom Benchmark Parameters

Modify benchmark parameters in the source files:

```rust
// Increase test sizes for stress testing
for size in [1000, 5000, 10000, 50000].iter() {
    // ... benchmark code
}

// Adjust iteration counts for precision
group.sample_size(1000);
group.measurement_time(Duration::from_secs(60));
```

### Cross-Platform Testing

The benchmarks are designed to run consistently across:

- **Linux** (Ubuntu 20.04+, with glibc 2.31+)
- **macOS** (10.15+, both Intel and Apple Silicon)
- **Windows** (Windows 10+, with MSVC toolchain)

### Memory Profiling

For detailed memory analysis:

```bash
# Enable allocator tracking
export CARGO_PROFILE_BENCH_DEBUG=true
cargo bench --bench stump_benchmarks --features track-allocations

# Use system profiler
cargo bench --bench stump_benchmarks | perf record -g --
perf report
```

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

## Troubleshooting

### Common Issues

**High Variance in Results**
- Ensure system is idle during benchmarking
- Disable CPU frequency scaling
- Close unnecessary background processes
- Use `taskset` to pin to specific CPU cores

**Out of Memory Errors**
- Reduce benchmark parameter sizes
- Increase system swap space
- Run benchmarks individually rather than as a suite

**Compilation Errors**
- Update Rust toolchain: `rustup update`
- Clean build cache: `cargo clean`
- Check dependency compatibility in `Cargo.toml`

### Environment Optimization

For most accurate results:

```bash
# Disable CPU frequency scaling
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Set process priority
nice -n -20 cargo bench

# Pin to specific CPU cores
taskset -c 0-3 cargo bench
```

## Related Documentation

- [Criterion User Guide](https://bheisler.github.io/criterion.rs/book/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
- [Rustreexo Algorithm Overview](README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

**Note**: These benchmarks are designed for development and optimization. For production performance testing, consider using dedicated benchmarking hardware and longer measurement periods.