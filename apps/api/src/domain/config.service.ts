// ============================================================
// Config Service — Platform configuration provider
// Loads NRP/ranking config from DB or uses demo defaults.
// ============================================================

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NRPConfig,
  RankingWeights,
} from '@krishisetu/shared';
import {
  DEMO_NRP_CONFIG,
  DEMO_RANKING_WEIGHTS,
  DEMO_DEFAULT_MARKET_RELIABILITY,
  DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY,
  DEMO_ROAD_FACTOR,
  DEMAND_STRENGTH_CONFIG,
  LOGISTICS_SCORE_CONFIG,
} from '@krishisetu/shared';
import { RankingConfig } from '@krishisetu/shared';
import { LogisticsConfig } from '@krishisetu/shared';

@Injectable()
export class ConfigService implements OnModuleInit {
  private nrpConfig: NRPConfig = DEMO_NRP_CONFIG;
  private rankingConfig: RankingConfig;
  private logisticsConfig: LogisticsConfig;

  constructor(private prisma: PrismaService) {
    // Initialize with demo defaults
    this.rankingConfig = {
      weights: DEMO_RANKING_WEIGHTS,
      defaultMarketReliability: DEMO_DEFAULT_MARKET_RELIABILITY,
      defaultMarketPaymentReliability: DEMO_DEFAULT_MARKET_PAYMENT_RELIABILITY,
      demandStrength: DEMAND_STRENGTH_CONFIG,
      logistics: LOGISTICS_SCORE_CONFIG,
    };
    this.logisticsConfig = {
      transportRatePerKmPaise: DEMO_NRP_CONFIG.transportRatePerKmPaise,
      roadFactor: DEMO_ROAD_FACTOR,
    };
  }

  async onModuleInit() {
    // In production, load from platform_config table
    // For demo, use hardcoded values from canonical scenario
    try {
      const configRows = await this.prisma.platformConfig.findMany();
      for (const row of configRows) {
        if (row.key === 'nrp_config') {
          this.nrpConfig = row.value as unknown as NRPConfig;
        }
      }
    } catch {
      // DB may not be ready yet (e.g., during migrations)
    }
  }

  getNRPConfig(): NRPConfig {
    return this.nrpConfig;
  }

  getRankingConfig(): RankingConfig {
    return this.rankingConfig;
  }

  getLogisticsConfig(): LogisticsConfig {
    return this.logisticsConfig;
  }

  getRoadFactor(): number {
    return DEMO_ROAD_FACTOR;
  }
}
