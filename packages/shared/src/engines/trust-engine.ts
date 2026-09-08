// ============================================================
// KrishiSetu — Trust Score Engine
// Buyer reliability scoring with small-sample smoothing.
// Trust Score ≠ Verification Status. They are separate concepts.
// ============================================================

import { TrustScore, TrustComponent, VerificationLevel } from '../types';

export interface TrustScoreInput {
  completedTransactions: number;
  successfulTransactions: number;
  onTimePayments: number;
  disputes: number;
  accountAgeDays: number;
  verificationLevel: VerificationLevel;
}

// Bayesian prior: hypothetical 10 transactions, 5 successes
const PRIOR_TOTAL = 10;
const PRIOR_SUCCESSES = 5;

/**
 * Calculate trust score for a buyer.
 * Uses Bayesian smoothing to prevent new buyers from gaming the system.
 *
 * A buyer with 2/2 perfect transactions gets ~58%, not 100%.
 * A buyer with 95/100 gets ~91%.
 */
export function calculateTrustScore(input: TrustScoreInput): TrustScore {
  if (input.completedTransactions < 0) {
    throw new Error('completedTransactions cannot be negative');
  }
  if (input.disputes < 0) {
    throw new Error('disputes cannot be negative');
  }

  const components: TrustComponent[] = [];

  // --- Payment Reliability (smoothed) ---
  const paymentRate = smoothedRate(input.onTimePayments, input.completedTransactions);
  const paymentScore = Math.round(paymentRate * 100);
  components.push({
    name: 'Payment reliability',
    score: paymentScore,
    detail: `${input.onTimePayments}/${input.completedTransactions} on-time payments`,
  });

  // --- Transaction Success (smoothed) ---
  const successRate = smoothedRate(input.successfulTransactions, input.completedTransactions);
  const successScore = Math.round(successRate * 100);
  components.push({
    name: 'Transaction success',
    score: successScore,
    detail: `${input.successfulTransactions}/${input.completedTransactions} successful`,
  });

  // --- Dispute History (inverse — fewer disputes = higher score) ---
  const disputeRate = input.completedTransactions > 0
    ? input.disputes / input.completedTransactions
    : 0;
  const disputeScore = Math.round(Math.max(0, (1 - disputeRate * 5)) * 100); // 20% disputes → 0 score
  components.push({
    name: 'Dispute history',
    score: clamp(disputeScore, 0, 100),
    detail: `${input.disputes} dispute${input.disputes !== 1 ? 's' : ''} in ${input.completedTransactions} transactions`,
  });

  // --- Account Age ---
  const ageScore = Math.min(100, Math.round(input.accountAgeDays / 365 * 100));
  components.push({
    name: 'Account age',
    score: clamp(ageScore, 0, 100),
    detail: `${input.accountAgeDays} days`,
  });

  // --- Verification Bonus ---
  const verificationScore = verificationToScore(input.verificationLevel);
  components.push({
    name: 'Verification',
    score: verificationScore,
    detail: formatVerificationLevel(input.verificationLevel),
  });

  // --- Weighted Overall ---
  // Weights: payment 30%, success 25%, disputes 20%, age 10%, verification 15%
  const overall = Math.round(
    paymentScore * 0.30 +
    successScore * 0.25 +
    components[2].score * 0.20 +
    ageScore * 0.10 +
    verificationScore * 0.15
  );

  const sampleSizeWarning = input.completedTransactions < 10
    ? `Limited transaction history (${input.completedTransactions} completed)`
    : undefined;

  return {
    overall: clamp(overall, 0, 100),
    components,
    verificationLevel: input.verificationLevel,
    completedTransactions: input.completedTransactions,
    accountAgeDays: input.accountAgeDays,
    sampleSizeWarning,
  };
}

/**
 * Bayesian smoothing: (successes + prior) / (total + prior_total)
 * Prevents new buyers from having artificially high/low scores.
 */
function smoothedRate(successes: number, total: number): number {
  return (successes + PRIOR_SUCCESSES) / (total + PRIOR_TOTAL);
}

function verificationToScore(level: VerificationLevel): number {
  switch (level) {
    case VerificationLevel.PLATFORM_VERIFIED: return 100;
    case VerificationLevel.DOCUMENTS_SUBMITTED: return 70;
    case VerificationLevel.PROFILE_COMPLETE: return 40;
    default: return 20;
  }
}

function formatVerificationLevel(level: VerificationLevel): string {
  switch (level) {
    case VerificationLevel.PLATFORM_VERIFIED: return 'Platform Verified';
    case VerificationLevel.DOCUMENTS_SUBMITTED: return 'Documents Submitted';
    case VerificationLevel.PROFILE_COMPLETE: return 'Profile Complete';
    default: return 'Unknown';
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
