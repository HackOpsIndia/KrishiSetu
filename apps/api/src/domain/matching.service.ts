// ============================================================
// Matching Service — NestJS wrapper for Buyer Matching Engine
// ============================================================

import { Injectable } from '@nestjs/common';
import {
  calculateMatchScore,
  checkMatchEligibility,
  MatchLotInput,
  MatchBuyerDemandInput,
  MatchResult,
  MatchEligibilityResult,
} from '@krishisetu/shared';

@Injectable()
export class MatchingService {
  checkEligibility(lot: MatchLotInput, demand: MatchBuyerDemandInput): MatchEligibilityResult {
    return checkMatchEligibility(lot, demand);
  }

  calculateScore(lot: MatchLotInput, demand: MatchBuyerDemandInput): MatchResult {
    return calculateMatchScore(lot, demand);
  }
}
