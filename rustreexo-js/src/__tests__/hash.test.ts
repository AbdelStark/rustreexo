import { Hash, utils } from '../index.js';

describe('Hash', () => {
  const testHashHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  
  test('should create hash from hex string', async () => {
    const hash = await Hash.fromHex(testHashHex);
    expect(hash.toHex()).toBe(testHashHex);
  });

  test('should create hash from bytes', async () => {
    const bytes = utils.hexToBytes(testHashHex);
    const hash = await Hash.fromBytes(bytes);
    expect(hash.toHex()).toBe(testHashHex);
  });

  test('should convert to bytes correctly', async () => {
    const hash = await Hash.fromHex(testHashHex);
    const bytes = hash.toBytes();
    expect(bytes).toHaveLength(32);
    expect(utils.bytesToHex(bytes)).toBe(testHashHex);
  });

  test('should compute parent hash', async () => {
    const leftHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const rightHash = '0101010101010101010101010101010101010101010101010101010101010101';
    
    const parentHash = await Hash.parentHash(leftHash, rightHash);
    expect(parentHash.toHex()).toHaveLength(64);
    expect(utils.isValidHash(parentHash.toHex())).toBe(true);
  });

  test('should validate hash format', () => {
    expect(utils.isValidHash(testHashHex)).toBe(true);
    expect(utils.isValidHash('0x' + testHashHex)).toBe(true);
    expect(utils.isValidHash('invalid')).toBe(false);
    expect(utils.isValidHash('123')).toBe(false);
    expect(utils.isValidHash('')).toBe(false);
  });

  test('should handle equality comparison', async () => {
    const hash1 = await Hash.fromHex(testHashHex);
    const hash2 = await Hash.fromHex(testHashHex);
    const hash3 = await Hash.fromHex('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    
    expect(hash1.equals(hash2)).toBe(true);
    expect(hash1.equals(hash3)).toBe(false);
  });

  test('should handle toString', async () => {
    const hash = await Hash.fromHex(testHashHex);
    expect(hash.toString()).toBe(testHashHex);
  });
});