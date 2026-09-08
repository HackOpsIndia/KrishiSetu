// ============================================================
// Impact Service — NestJS wrapper for Impact Engine
// ============================================================

import { Injectable } from '@nestjs/common';
import { calculateImpact, ImpactInput, ImpactMetrics } from '@krishisetu/shared';

@Injectable()
export class ImpactService {
  calculate(input: ImpactInput): ImpactMetrics {
    return calculateImpact(input);
  }
}
