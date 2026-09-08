import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { LotsService } from './lots.service';
import { OpportunitiesService } from '../opportunities/opportunities.service';

class CreateLotDto {
  @IsString() commodityName: string;
  @IsString() varietyName: string;
  @IsNumber() @Min(0.1) quantity: number;
  @IsString() qualityGrade: string;
  @IsOptional() qualityParams?: any;
  @IsOptional() @IsString() harvestDate?: string;
  @IsOptional() @IsString() expectedSaleDate?: string;
  @IsOptional() @IsNumber() minAcceptablePricePaise?: number;
}

class UpdateStatusDto {
  @IsString() status: string;
}

@ApiTags('Lots')
@Controller('api/lots')
export class LotsController {
  constructor(
    private lotsService: LotsService,
    private opportunitiesService: OpportunitiesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lot' })
  async create(@Request() req, @Body() dto: CreateLotDto) {
    const userId = req.user?.id || 'farmer-ramesh';
    return this.lotsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my lots' })
  async list(@Request() req) {
    const userId = req.user?.id || 'farmer-ramesh';
    return this.lotsService.findByFarmerUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lot details' })
  async get(@Param('id') id: string) {
    return this.lotsService.findById(id);
  }

  @Get(':id/actions')
  @ApiOperation({ summary: 'Get allowed status transitions' })
  async getActions(@Param('id') id: string) {
    return this.lotsService.getStatusActions(id);
  }

  @Get(':id/recommendation')
  @ApiOperation({ summary: 'What should I do today: lot recommendation' })
  async getRecommendation(@Param('id') id: string) {
    return this.opportunitiesService.getRecommendation(id);
  }

  @Get(':id/buyer-matches')
  @ApiOperation({ summary: 'Get buyer matches for lot' })
  async getBuyerMatches(@Param('id') id: string) {
    return this.opportunitiesService.getBuyerMatches(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition lot status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.lotsService.updateStatus(id, dto.status as any);
  }
}
