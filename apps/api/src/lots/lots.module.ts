import { Module } from '@nestjs/common';
import { LotsController } from './lots.controller';
import { LotsService } from './lots.service';
import { DomainModule } from '../domain/domain.module';
import { OpportunitiesModule } from '../opportunities/opportunities.module';

@Module({
  imports: [DomainModule, OpportunitiesModule],
  controllers: [LotsController],
  providers: [LotsService],
  exports: [LotsService],
})
export class LotsModule {}
