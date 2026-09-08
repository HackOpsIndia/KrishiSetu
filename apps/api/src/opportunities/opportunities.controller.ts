import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';

@ApiTags('Opportunities')
@Controller('api/opportunities')
export class OpportunitiesController {
  constructor(private opportunitiesService: OpportunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all database opportunity records' })
  async findAll() {
    return this.opportunitiesService.findAllOpportunities();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity record' })
  async create(@Body() body: any) {
    return this.opportunitiesService.createOpportunity(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an opportunity record' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.opportunitiesService.updateOpportunity(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an opportunity record' })
  async remove(@Param('id') id: string) {
    return this.opportunitiesService.deleteOpportunity(id);
  }

  @Get('fpo/aggregation')
  @ApiOperation({ summary: 'Get FPO collective aggregation opportunities' })
  async getFpoAggregation() {
    return this.opportunitiesService.getFpoAggregationOpportunities();
  }

  @Get('lot/:lotId')
  @ApiOperation({ summary: 'Analyze and rank all opportunities for a lot' })
  async analyzeForLotPrefix(@Param('lotId') lotId: string) {
    return this.opportunitiesService.analyzeForLot(lotId);
  }

  @Get(':lotId')
  @ApiOperation({ summary: 'Analyze and rank all opportunities for a lot' })
  async analyzeForLot(@Param('lotId') lotId: string) {
    return this.opportunitiesService.analyzeForLot(lotId);
  }

  @Get(':lotId/recommendation')
  @ApiOperation({ summary: 'What should I do today: lot recommendation' })
  async getRecommendation(@Param('lotId') lotId: string) {
    return this.opportunitiesService.getRecommendation(lotId);
  }

  @Get(':lotId/buyer-matches')
  @ApiOperation({ summary: 'Get buyer matches for lot' })
  async getBuyerMatches(@Param('lotId') lotId: string) {
    return this.opportunitiesService.getBuyerMatches(lotId);
  }
}
