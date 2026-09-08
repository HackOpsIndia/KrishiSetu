// ============================================================
// Logistics Service — NestJS wrapper for Logistics Cost Engine
// ============================================================

import { Injectable } from '@nestjs/common';
import {
  calculateLogisticsCost,
  haversineDistance,
  haversineToRoadDistance,
  LogisticsCostResult,
} from '@krishisetu/shared';
import { ConfigService } from './config.service';

@Injectable()
export class LogisticsService {
  constructor(private configService: ConfigService) {}

  calculate(distanceKm: number, quantity: number, buyerPickup = false): LogisticsCostResult {
    return calculateLogisticsCost(
      distanceKm,
      quantity,
      this.configService.getLogisticsConfig(),
      buyerPickup,
    );
  }

  estimateRoadDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const haversine = haversineDistance(lat1, lon1, lat2, lon2);
    return haversineToRoadDistance(haversine, this.configService.getRoadFactor());
  }
}
