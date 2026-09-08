// ============================================================
// NRP Service — NestJS wrapper for the NRP Engine
// ALL NRP calculations go through here. No duplicates.
// ============================================================

import { Injectable } from '@nestjs/common';
import { calculateNRP, NRPInput, NRPResult, NRPConfig } from '@krishisetu/shared';
import { ConfigService } from './config.service';

@Injectable()
export class NRPService {
  constructor(private configService: ConfigService) {}

  calculate(input: NRPInput, config?: NRPConfig): NRPResult {
    return calculateNRP(input, config ?? this.configService.getNRPConfig());
  }
}
