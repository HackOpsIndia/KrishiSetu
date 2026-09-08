import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MarketsService } from './markets.service';

@ApiTags('Markets')
@Controller('api/markets')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MarketsController {
  constructor(private marketsService: MarketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all markets' })
  async list() {
    return this.marketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get market details with price history' })
  async get(@Param('id') id: string) {
    return this.marketsService.findById(id);
  }

  @Get('prices/latest')
  @ApiOperation({ summary: 'Get latest prices for a commodity' })
  async latestPrices(
    @Query('commodity') commodity: string,
    @Query('variety') variety: string,
  ) {
    return this.marketsService.getLatestPrices(commodity, variety);
  }
}
