// ============================================================
// Aggregation Service — NestJS wrapper for FPO Aggregation Engine
// ============================================================

import { Injectable } from '@nestjs/common';
import {
  calculateAggregation,
  AggregationInput,
  AggregationOpportunity,
} from '@krishisetu/shared';

@Injectable()
export class AggregationService {
  calculate(input: AggregationInput): AggregationOpportunity {
    return calculateAggregation(input);
  }
}
