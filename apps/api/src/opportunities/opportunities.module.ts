import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { DomainModule } from '../domain/domain.module';
import { MarketsModule } from '../markets/markets.module';

@Module({
  imports: [DomainModule, MarketsModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
