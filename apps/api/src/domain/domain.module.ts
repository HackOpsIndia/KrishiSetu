// ============================================================
// Domain Module — NestJS wrappers for pure domain engines
// Domain logic stays in @krishisetu/shared as pure TypeScript.
// These services wrap the engines for dependency injection.
// ============================================================

import { Module } from '@nestjs/common';
import { NRPService } from './nrp.service';
import { RankingService } from './ranking.service';
import { MatchingService } from './matching.service';
import { TrustService } from './trust.service';
import { LogisticsService } from './logistics.service';
import { AggregationService } from './aggregation.service';
import { ImpactService } from './impact.service';
import { ConfigService } from './config.service';

const services = [
  NRPService,
  RankingService,
  MatchingService,
  TrustService,
  LogisticsService,
  AggregationService,
  ImpactService,
  ConfigService,
];

@Module({
  providers: services,
  exports: services,
})
export class DomainModule {}
