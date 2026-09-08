// ============================================================
// Health Check Controller
// ============================================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  root() {
    return {
      service: 'KrishiSetu API',
      status: 'ok',
      demo: process.env.DEMO_MODE !== 'false',
      version: '1.0.0',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
