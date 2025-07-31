import { Stump } from '../index';

describe('Stump', () => {
  test('should create empty stump', async () => {
    const stump = await Stump.create();
    expect(stump.isEmpty()).toBe(true);
    expect(stump.getLeafCount()).toBe(0);
    expect(stump.getRoots()).toHaveLength(0);
  });

  test('should serialize to and from JSON', async () => {
    const stump = await Stump.create();
    const json = stump.toJson();
    expect(typeof json).toBe('string');
    
    const stump2 = await Stump.fromJson(json);
    expect(stump2.getLeafCount()).toBe(stump.getLeafCount());
    expect(stump2.getRoots()).toEqual(stump.getRoots());
  });

  test('should provide stats', async () => {
    const stump = await Stump.create();
    const stats = stump.getStats();
    
    expect(stats).toHaveProperty('leaves');
    expect(stats).toHaveProperty('roots');
    expect(stats).toHaveProperty('estimatedMemoryUsage');
    expect(typeof stats.leaves).toBe('number');
    expect(Array.isArray(stats.roots)).toBe(true);
    expect(typeof stats.estimatedMemoryUsage).toBe('number');
  });

  test('should handle toString', async () => {
    const stump = await Stump.create();
    const str = stump.toString();
    expect(str).toContain('Stump');
    expect(str).toContain('leaves=0');
    expect(str).toContain('roots=0');
  });

  test('should clone properly', async () => {
    const stump = await Stump.create();
    const clone = await stump.clone();
    
    expect(clone.getLeafCount()).toBe(stump.getLeafCount());
    expect(clone.getRoots()).toEqual(stump.getRoots());
    expect(clone.toString()).toBe(stump.toString());
  });

  test('should handle verification with empty proof', async () => {
    const stump = await Stump.create();
    const emptyProof = JSON.stringify({ proof: [], targets: [] });
    
    const result = await stump.verify(emptyProof, []);
    expect(result).toHaveProperty('valid');
    expect(typeof result.valid).toBe('boolean');
  });
});