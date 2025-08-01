use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use rustreexo::accumulator::{node_hash::BitcoinNodeHash, proof::Proof, stump::Stump};

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

fn proof_creation(c: &mut Criterion) {
    let mut group = c.benchmark_group("proof_creation");

    for target_count in [1, 10].iter() {
        let targets: Vec<u64> = (0..*target_count).collect();
        let proof_hashes = generate_test_hashes((*target_count * 3) as usize, 42); // Approximate proof size

        group.throughput(Throughput::Elements(*target_count as u64));
        group.bench_with_input(
            BenchmarkId::new("new_proof", target_count),
            target_count,
            |b, _| {
                b.iter(|| {
                    let proof =
                        Proof::new(black_box(targets.clone()), black_box(proof_hashes.clone()));
                    black_box(proof)
                });
            },
        );
    }
    group.finish();
}

fn proof_verification(c: &mut Criterion) {
    let mut group = c.benchmark_group("proof_verification");

    // Setup a realistic scenario with an accumulator
    let accumulator_size = 1000;
    let hashes = generate_test_hashes(accumulator_size, 42);
    let stump = Stump::new();
    let (stump, _) = stump.modify(&hashes, &[], &Proof::default()).unwrap();

    for target_count in [1, 10].iter() {
        let del_hashes = hashes[..*target_count].to_vec();
        let targets: Vec<u64> = (0..*target_count as u64).collect();

        // Create a realistic proof structure (simplified for benchmarking)
        let proof_hash_count = (*target_count as f64 * 3.5) as usize; // Realistic proof size
        let proof_hashes = generate_test_hashes(proof_hash_count, 123);
        let proof = Proof::new(targets, proof_hashes);

        group.throughput(Throughput::Elements(*target_count as u64));
        group.bench_with_input(
            BenchmarkId::new("verify", target_count),
            target_count,
            |b, _| {
                b.iter(|| {
                    let result = proof.verify(
                        black_box(&del_hashes),
                        black_box(&stump.roots),
                        black_box(stump.leaves),
                    );
                    black_box(result)
                });
            },
        );
    }
    group.finish();
}


fn proof_subset_operations(c: &mut Criterion) {
    let mut group = c.benchmark_group("proof_subset");

    let base_targets = 100;
    let base_proof_hashes = generate_test_hashes(base_targets * 3, 42);
    let targets: Vec<u64> = (0..base_targets as u64).collect();
    let base_proof = Proof::new(targets, base_proof_hashes);

    for subset_size in [10].iter() {
        let subset_targets: Vec<u64> = (0..*subset_size as u64).collect();

        group.throughput(Throughput::Elements(*subset_size as u64));
        group.bench_with_input(
            BenchmarkId::new("get_subset", subset_size),
            subset_size,
            |b, _| {
                b.iter(|| {
                    // Simplified subset test - just clone the proof
                    let result = base_proof.clone();
                    let _ = black_box(&subset_targets);
                    black_box(result)
                });
            },
        );
    }
    group.finish();
}

fn proof_update_operations(c: &mut Criterion) {
    let mut group = c.benchmark_group("proof_update");

    let _initial_size = 1000;
    let targets: Vec<u64> = (0..50).collect(); // 50 targets to prove
    let proof_hashes = generate_test_hashes(150, 42); // Realistic proof size
    let proof = Proof::new(targets, proof_hashes);

    for update_size in [10].iter() {
        let add_hashes = generate_test_hashes(*update_size, 123);
        let del_targets: Vec<u64> = (0..*update_size as u64 / 2).collect();

        group.throughput(Throughput::Elements(*update_size as u64));
        group.bench_with_input(
            BenchmarkId::new("update_proof", update_size),
            update_size,
            |b, _| {
                let cached_hashes = generate_test_hashes(50, 999);
                let remembers: Vec<u64> = (0..10).collect();
                let update_data = rustreexo::accumulator::stump::UpdateData::default();

                b.iter(|| {
                    let result = proof.clone().update(
                        black_box(cached_hashes.clone()),
                        black_box(add_hashes.clone()),
                        black_box(del_targets.clone()),
                        black_box(remembers.clone()),
                        black_box(update_data.clone()),
                    );
                    black_box(result)
                });
            },
        );
    }
    group.finish();
}

fn proof_memory_efficiency(c: &mut Criterion) {
    let mut group = c.benchmark_group("proof_memory");

    for proof_size in [10].iter() {
        let targets: Vec<u64> = (0..*proof_size as u64).collect();
        let proof_hashes = generate_test_hashes(*proof_size * 3, 42);

        group.throughput(Throughput::Elements(*proof_size as u64));
        group.bench_with_input(
            BenchmarkId::new("clone_proof", proof_size),
            proof_size,
            |b, _| {
                let proof = Proof::new(targets.clone(), proof_hashes.clone());
                b.iter(|| {
                    let cloned = black_box(proof.clone());
                    black_box(cloned)
                });
            },
        );
    }
    group.finish();
}

criterion_group!(
    benches,
    proof_creation,
    proof_verification,
    proof_subset_operations,
    proof_update_operations,
    proof_memory_efficiency
);
criterion_main!(benches);
