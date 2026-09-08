// ============================================================
// Trust Service — NestJS wrapper for Trust Score Engine
// ============================================================

import { Injectable } from '@nestjs/common';
import { calculateTrustScore, TrustScoreInput, TrustScore } from '@krishisetu/shared';

@Injectable()
export class TrustService {
  calculate(input: TrustScoreInput): TrustScore {
    return calculateTrustScore(input);
  }
}
