import { utils } from '../index.js';

describe('utils', () => {
  const testHashHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  test('should validate hash format correctly', () => {
    expect(utils.isValidHash(testHashHex)).toBe(true);
    expect(utils.isValidHash('0x' + testHashHex)).toBe(true);
    expect(utils.isValidHash('ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789')).toBe(true);
    
    // Invalid cases
    expect(utils.isValidHash('invalid')).toBe(false);
    expect(utils.isValidHash('123')).toBe(false);
    expect(utils.isValidHash('')).toBe(false);
    expect(utils.isValidHash('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0')).toBe(false); // too long
    expect(utils.isValidHash('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde')).toBe(false); // too short
    expect(utils.isValidHash('0123456789abcdefg123456789abcdef0123456789abcdef0123456789abcdef')).toBe(false); // invalid char
  });

  test('should convert hex to bytes correctly', () => {
    const bytes = utils.hexToBytes(testHashHex);
    expect(bytes).toHaveLength(32);
    expect(bytes[0]).toBe(0x01);
    expect(bytes[1]).toBe(0x23);
    expect(bytes[2]).toBe(0x45);
    expect(bytes[3]).toBe(0x67);
  });

  test('should convert bytes to hex correctly', () => {
    const bytes = new Uint8Array([
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef
    ]);
    
    const hex = utils.bytesToHex(bytes);
    expect(hex).toBe(testHashHex);
  });

  test('should handle hex with 0x prefix', () => {
    const hexWithPrefix = '0x' + testHashHex;
    const bytes = utils.hexToBytes(hexWithPrefix);
    expect(bytes).toHaveLength(32);
    expect(utils.bytesToHex(bytes)).toBe(testHashHex);
  });

  test('should generate random hash', () => {
    const hash1 = utils.randomHash();
    const hash2 = utils.randomHash();
    
    expect(utils.isValidHash(hash1)).toBe(true);
    expect(utils.isValidHash(hash2)).toBe(true);
    expect(hash1).not.toBe(hash2); // Very unlikely to be the same
    expect(hash1).toHaveLength(64);
    expect(hash2).toHaveLength(64);
  });

  test('should throw on invalid hex input', () => {
    expect(() => utils.hexToBytes('invalid')).toThrow();
    expect(() => utils.hexToBytes('123')).toThrow();
    expect(() => utils.hexToBytes('')).toThrow();
  });

  test('should throw on invalid bytes input', () => {
    expect(() => utils.bytesToHex(new Uint8Array(31))).toThrow(); // too short
    expect(() => utils.bytesToHex(new Uint8Array(33))).toThrow(); // too long
  });
});