/**
 * Test for the Reference Demo fix - verifying that Stump.modify() properly updates internal state
 * This test replicates the exact scenario that was failing in the reference demo
 */

import { Stump, Pollard } from '../index';

describe('Reference Demo Fix', () => {
  it('should properly verify proofs after stump modification', async () => {
    // Exact same elements from the Rust reference example
    const elements = [
      "b151a956139bb821d4effa34ea95c17560e0135d1e4661fc23cedc3af49dac42",
      "d3bd63d53c5a70050a28612a2f4b2019f40951a653ae70736d93745efb1124fa"
    ];

    // Step 1: Create Pollard and add elements
    const pollard = await Pollard.create();
    const additions = elements.map(hash => ({ hash, remember: true }));
    await pollard.addElements(additions);

    // Step 2: Generate proof for first element
    const proof = await pollard.generateProof(elements[0]!);
    expect(proof).toBeTruthy();
    expect(proof.length).toBeGreaterThan(0);

    // Step 3: Create Stump and add elements
    const stump = await Stump.create();
    
    // Add elements to Stump using empty proof (equivalent to Proof::default())
    const emptyProof = JSON.stringify({ targets: [], hashes: [] });
    await stump.modify(emptyProof, elements, []);

    // Verify stump state after modification
    expect(stump.getLeafCount()).toBe(2);
    expect(stump.getRoots().length).toBeGreaterThan(0);

    // Step 4: Verify the proof - THIS WAS FAILING BEFORE THE FIX
    const verificationResult = await stump.verify(proof, [elements[0]!]);
    
    // This should now pass with the fix
    expect(verificationResult.valid).toBe(true);
    expect(verificationResult.error).toBeUndefined();
  });

  it('should handle multiple modifications correctly', async () => {
    const elements = [
      "b151a956139bb821d4effa34ea95c17560e0135d1e4661fc23cedc3af49dac42",
      "d3bd63d53c5a70050a28612a2f4b2019f40951a653ae70736d93745efb1124fa"
    ];
    const newUtxo = "cac74661f4944e6e1fed35df40da951c6e151e7b0c8d65c3ee37d6dfd3bc3ef7";

    // Create Pollard and add initial elements
    const pollard = await Pollard.create();
    const additions = elements.map(hash => ({ hash, remember: true }));
    await pollard.addElements(additions);

    // Generate proof for first element
    const proof = await pollard.generateProof(elements[0]!);

    // Create Stump and add initial elements
    const stump = await Stump.create();
    const emptyProof = JSON.stringify({ targets: [], hashes: [] });
    await stump.modify(emptyProof, elements, []);

    // Verify initial proof works
    const initialVerification = await stump.verify(proof, [elements[0]!]);
    expect(initialVerification.valid).toBe(true);

    // Modify both accumulator and stump - remove first element, add new one
    const newAdditions = [{ hash: newUtxo, remember: true }];
    await pollard.modify(emptyProof, newAdditions, [elements[0]!]);
    await stump.modify(emptyProof, [newUtxo], [elements[0]!]);

    // Generate proof for new element
    const newProof = await pollard.generateProof(newUtxo);

    // Verify the new proof
    const newVerification = await stump.verify(newProof, [newUtxo]);
    expect(newVerification.valid).toBe(true);
  });
});