// ============================================================
// Ranking Service — NestJS wrapper for Opportunity Ranking Engine
// ============================================================

import { Injectable } from '@nestjs/common';
import {
  rankOpportunities,
  checkBuyerEligibility,
  validateWeights,
  Opportunity,
  RankedOpportunity,
  EligibilityResult,
} from '@krishisetu/shared';
import { EligibilityInput, BuyerEligibilityData } from '@krishisetu/shared';
import { ConfigService } from './config.service';

@Injectable()
export class RankingService {
  constructor(private configService: ConfigService) {
    // Validate weights at service startup
    const config = this.configService.getRankingConfig();
    validateWeights(config.weights);
  }

  rank(opportunities: Opportunity[], lotQuantity: number): RankedOpportunity[] {
    return rankOpportunities(opportunities, lotQuantity, this.configService.getRankingConfig());
  }

  checkEligibility(lot: EligibilityInput, buyer: BuyerEligibilityData): EligibilityResult {
    return checkBuyerEligibility(lot, buyer);
  }
}
