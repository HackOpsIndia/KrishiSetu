// ============================================================
// Prisma Service — Database Connection
// ============================================================

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      console.log('✅ PostgreSQL connected successfully');
    } catch (err: any) {
      this.isConnected = false;
      console.warn('⚠️ PostgreSQL not reachable. Operating in In-Memory Demo Provider Mode with canonical scenario.');
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }
}
