// ============================================================
// Trust Score Engine Tests
// Validates Bayesian smoothing, component scoring, and edge cases.
// ============================================================

import { calculateTrustScore, TrustScoreInput } from '../trust-engine';
import { VerificationLevel } from '../../types';

describe('Trust Score Engine', () => {
  test('well-established buyer gets high score', () => {
    const result = calculateTrustScore({
      completedTransactions: 42,
      successfulTransactions: 40,
      onTimePayments: 40,
      disputes: 1,
      accountAgeDays: 380,
      verificationLevel: VerificationLevel.PLATFORM_VERIFIED,
    });

    expect(result.overall).toBeGreaterThan(75);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.verificationLevel).toBe(VerificationLevel.PLATFORM_VERIFIED);
    expect(result.sampleSizeWarning).toBeUndefined();
  });

  test('new buyer with perfect record does NOT get 100%', () => {
    const result = calculateTrustScore({
      completedTransactions: 2,
      successfulTransactions: 2,
      onTimePayments: 2,
      disputes: 0,
      accountAgeDays: 30,
      verificationLevel: VerificationLevel.PROFILE_COMPLETE,
    });

    // Bayesian smoothing should prevent artificially high scores
    expect(result.overall).toBeLessThan(70);
    expect(result.sampleSizeWarning).toBeTruthy();
    expect(result.sampleSizeWarning).toMatch(/limited/i);
  });

  test('buyer with many disputes gets low score', () => {
    const result = calculateTrustScore({
      completedTransactions: 20,
      successfulTransactions: 12,
      onTimePayments: 10,
      disputes: 8,
      accountAgeDays: 200,
      verificationLevel: VerificationLevel.DOCUMENTS_SUBMITTED,
    });

    expect(result.overall).toBeLessThan(60);
  });

  test('zero transactions gives sample size warning', () => {
    const result = calculateTrustScore({
      completedTransactions: 0,
      successfulTransactions: 0,
      onTimePayments: 0,
      disputes: 0,
      accountAgeDays: 10,
      verificationLevel: VerificationLevel.PROFILE_COMPLETE,
    });

    expect(result.sampleSizeWarning).toBeTruthy();
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  test('verification level affects score', () => {
    const base: TrustScoreInput = {
      completedTransactions: 20,
      successfulTransactions: 19,
      onTimePayments: 18,
      disputes: 0,
      accountAgeDays: 300,
      verificationLevel: VerificationLevel.PROFILE_COMPLETE,
    };

    const lowVerification = calculateTrustScore({ ...base, verificationLevel: VerificationLevel.PROFILE_COMPLETE });
    const highVerification = calculateTrustScore({ ...base, verificationLevel: VerificationLevel.PLATFORM_VERIFIED });

    expect(highVerification.overall).toBeGreaterThan(lowVerification.overall);
  });

  test('components are returned', () => {
    const result = calculateTrustScore({
      completedTransactions: 15,
      successfulTransactions: 14,
      onTimePayments: 13,
      disputes: 1,
      accountAgeDays: 200,
      verificationLevel: VerificationLevel.DOCUMENTS_SUBMITTED,
    });

    expect(result.components.length).toBeGreaterThanOrEqual(4);
    const names = result.components.map(c => c.name);
    expect(names).toContain('Payment reliability');
    expect(names).toContain('Transaction success');
    expect(names).toContain('Account age');
    expect(names).toContain('Verification');

    for (const comp of result.components) {
      expect(comp.score).toBeGreaterThanOrEqual(0);
      expect(comp.score).toBeLessThanOrEqual(100);
    }
  });

  test('rejects negative completedTransactions', () => {
    expect(() => calculateTrustScore({
      completedTransactions: -1,
      successfulTransactions: 0,
      onTimePayments: 0,
      disputes: 0,
      accountAgeDays: 10,
      verificationLevel: VerificationLevel.PROFILE_COMPLETE,
    })).toThrow();
  });

  test('rejects negative disputes', () => {
    expect(() => calculateTrustScore({
      completedTransactions: 10,
      successfulTransactions: 10,
      onTimePayments: 10,
      disputes: -1,
      accountAgeDays: 10,
      verificationLevel: VerificationLevel.PROFILE_COMPLETE,
    })).toThrow();
  });

  test('trust score is between 0 and 100', () => {
    // Extreme edge case
    const result = calculateTrustScore({
      completedTransactions: 1000,
      successfulTransactions: 999,
      onTimePayments: 998,
      disputes: 0,
      accountAgeDays: 2000,
      verificationLevel: VerificationLevel.PLATFORM_VERIFIED,
    });

    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });
});
