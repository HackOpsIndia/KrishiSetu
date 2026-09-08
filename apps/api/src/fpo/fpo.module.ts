import { Module } from '@nestjs/common';
import { FpoController } from './fpo.controller';
import { OpportunitiesModule } from '../opportunities/opportunities.module';

@Module({
  imports: [OpportunitiesModule],
  controllers: [FpoController],
})
export class FpoModule {}
