import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OpportunitiesService } from '../opportunities/opportunities.service';

@ApiTags('FPO')
@Controller('api/fpo')
export class FpoController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get('aggregation-opportunities')
  @ApiOperation({ summary: 'List FPO collective freight and aggregation opportunities' })
  async getAggregationOpportunities() {
    return this.opportunitiesService.getFpoAggregationOpportunities();
  }
}
