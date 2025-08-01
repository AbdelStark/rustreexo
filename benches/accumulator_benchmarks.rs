use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use rustreexo::accumulator::{
    mem_forest::MemForest, node_hash::BitcoinNodeHash, pollard::Pollard, proof::Proof, stump::Stump,
};

fn generate_test_hashes(count: usize, seed: u64) -> Vec<BitcoinNodeHash> {
    let mut rng = StdRng::seed_from_u64(seed);
    (0..count)
        .map(|_| {
            let mut bytes = [0u8; 32];
            rng.fill(&mut bytes);
            BitcoinNodeHash::new(bytes)
        })
        .collect()
}

fn memforest_vs_stump_modify(c: &mut Criterion) {
    let mut group = c.benchmark_group("accumulator_modify_comparison");

    for size in [10, 100].iter() {
        let hashes = generate_test_hashes(*size, 42);

        group.throughput(Throughput::Elements(*size as u64));

        // MemForest benchmark
        group.bench_with_input(BenchmarkId::new("memforest_add", size), size, |b, _| {
            b.iter(|| {
                let mut forest = MemForest::new();
                let result = forest.modify(black_box(&hashes), black_box(&[]));
                black_box(result.unwrap());
                black_box(forest)
            });
        });

        // Stump benchmark
        group.bench_with_input(BenchmarkId::new("stump_add", size), size, |b, _| {
            b.iter(|| {
                let stump = Stump::new();
                let result = stump.modify(
                    black_box(&hashes),
                    black_box(&[]),
                    black_box(&Proof::default()),
                );
                black_box(result.unwrap())
            });
        });
    }
    group.finish();
}

fn memforest_proof_generation(c: &mut Criterion) {
    let mut group = c.benchmark_group("memforest_proof_generation");

    let accumulator_size = 1000;
    let hashes = generate_test_hashes(accumulator_size, 42);
    let mut forest = MemForest::new();
    forest.modify(&hashes, &[]).unwrap();

    for target_count in [1, 10].iter() {
        let targets = &hashes[..*target_count];

        group.throughput(Throughput::Elements(*target_count as u64));
        group.bench_with_input(
            BenchmarkId::new("generate_proof", target_count),
            target_count,
            |b, _| {
                b.iter(|| {
                    let result = forest.prove(black_box(targets));
                    black_box(result.unwrap())
                });
            },
        );
    }
    group.finish();
}

fn memforest_verification(c: &mut Criterion) {
    let mut group = c.benchmark_group("memforest_verification");

    let accumulator_size = 1000;
    let hashes = generate_test_hashes(accumulator_size, 42);
    let mut forest = MemForest::new();
    forest.modify(&hashes, &[]).unwrap();

    for target_count in [1, 10].iter() {
        let targets = &hashes[..*target_count];
        let proof = forest.prove(targets).unwrap();

        group.throughput(Throughput::Elements(*target_count as u64));
        group.bench_with_input(
            BenchmarkId::new("verify_proof", target_count),
            target_count,
            |b, _| {
                b.iter(|| {
                    let result = forest.verify(black_box(&proof), black_box(targets));
                    black_box(result.unwrap())
                });
            },
        );
    }
    group.finish();
}

fn pollard_operations(c: &mut Criterion) {
    let mut group = c.benchmark_group("pollard_operations");

    let base_size = 1000;
    let hashes = generate_test_hashes(base_size, 42);
    let roots = vec![hashes[0]]; // Simplified root structure
    let pollard = Pollard::from_roots(roots, base_size as u64);

    for batch_size in [10].iter() {
        let _del_hashes = &hashes[..*batch_size / 2];

        group.throughput(Throughput::Elements(*batch_size as u64));
        group.bench_with_input(
            BenchmarkId::new("pollard_roots", batch_size),
            batch_size,
            |b, _| {
                b.iter(|| {
                    let roots = pollard.roots();
                    black_box(roots.len())
                });
            },
        );

        group.bench_with_input(
            BenchmarkId::new("pollard_leaves", batch_size),
            batch_size,
            |b, _| {
                b.iter(|| {
                    let leaves = pollard.leaves();
                    black_box(leaves)
                });
            },
        );
    }
    group.finish();
}

fn pollard_basic_operations(c: &mut Criterion) {
    let mut group = c.benchmark_group("pollard_basic_operations");

    let base_size = 1000;
    let hashes = generate_test_hashes(base_size, 42);
    let pollard = Pollard::from_roots(hashes[..10].to_vec(), base_size as u64);

    group.bench_function("pollard_creation", |b| {
        b.iter(|| {
            let roots = hashes[..5].to_vec();
            let test_pollard = Pollard::from_roots(black_box(roots), black_box(1000));
            black_box(test_pollard)
        });
    });

    group.bench_function("pollard_roots_access", |b| {
        b.iter(|| {
            let roots = pollard.roots();
            black_box(roots)
        });
    });

    group.finish();
}


fn accumulator_memory_comparison(c: &mut Criterion) {
    let mut group = c.benchmark_group("accumulator_memory_usage");

    for size in [10].iter() {
        let hashes = generate_test_hashes(*size, 42);

        group.throughput(Throughput::Elements(*size as u64));

        // MemForest memory usage (creation and population)
        group.bench_with_input(
            BenchmarkId::new("memforest_creation", size),
            size,
            |b, _| {
                b.iter(|| {
                    let mut forest = MemForest::new();
                    let result = forest.modify(black_box(&hashes), black_box(&[]));
                    black_box(result.unwrap());
                    // Simulate some operations to measure sustained memory usage
                    let roots = forest.get_roots();
                    black_box(roots.len());
                    black_box(forest)
                });
            },
        );

        // Stump memory usage
        group.bench_with_input(BenchmarkId::new("stump_creation", size), size, |b, _| {
            b.iter(|| {
                let stump = Stump::new();
                let result = stump.modify(
                    black_box(&hashes),
                    black_box(&[]),
                    black_box(&Proof::default()),
                );
                let (stump, _) = black_box(result.unwrap());
                // Access fields to measure memory impact
                black_box(stump.leaves);
                black_box(&stump.roots);
                black_box(stump)
            });
        });

        // Pollard memory usage
        group.bench_with_input(BenchmarkId::new("pollard_creation", size), size, |b, _| {
            b.iter(|| {
                let roots = hashes[..(*size / 100).max(1)].to_vec(); // Reasonable root count
                let pollard = Pollard::from_roots(black_box(roots), black_box(*size as u64));
                // Access methods to measure memory impact
                black_box(pollard.leaves());
                let roots = pollard.roots();
                black_box(roots.len());
                black_box(pollard)
            });
        });
    }
    group.finish();
}

criterion_group!(
    benches,
    memforest_vs_stump_modify,
    memforest_proof_generation,
    memforest_verification,
    pollard_operations,
    pollard_basic_operations,
    accumulator_memory_comparison
);
criterion_main!(benches);
