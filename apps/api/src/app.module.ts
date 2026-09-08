// ============================================================
// KrishiSetu API — Root Application Module
// ============================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LotsModule } from './lots/lots.module';
import { MarketsModule } from './markets/markets.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { OffersModule } from './offers/offers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DomainModule } from './domain/domain.module';
import { FpoModule } from './fpo/fpo.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    LotsModule,
    MarketsModule,
    OpportunitiesModule,
    OffersModule,
    TransactionsModule,
    DomainModule,
    FpoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
