import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { TransactionsService } from './transactions.service';

class TransitionDto {
  @IsString() status: string;
  @IsOptional() @IsString() note?: string;
}

class BookLogisticsDto {
  @IsNumber() distanceKm: number;
  @IsNumber() estimatedCostPaise: number;
  @IsOptional() @IsString() vehicleType?: string;
  @IsOptional() @IsString() pickupDate?: string;
}

@ApiTags('Transactions')
@Controller('api/transactions')
export class TransactionsController {
  constructor(private txService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List my transactions' })
  async list(@Request() req) {
    const userId = req.user?.id || 'farmer-ramesh';
    return this.txService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details' })
  async get(@Param('id') id: string) {
    return this.txService.findById(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get transaction summary with NRP and payment' })
  async summary(@Param('id') id: string) {
    return this.txService.getTransactionSummary(id);
  }

  @Get(':id/impact')
  @ApiOperation({ summary: 'Get economic impact vs baseline' })
  async impact(@Param('id') id: string) {
    return this.txService.getImpact(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition transaction status' })
  async transition(@Request() req, @Param('id') id: string, @Body() dto: TransitionDto) {
    const userId = req.user?.id || 'farmer-ramesh';
    return this.txService.transitionStatus(id, dto.status as any, userId, dto.note);
  }

  @Post(':id/logistics')
  @ApiOperation({ summary: 'Book logistics (idempotent)' })
  async bookLogistics(@Request() req, @Param('id') id: string, @Body() dto: BookLogisticsDto) {
    const userId = req.user?.id || 'farmer-ramesh';
    return this.txService.bookLogistics(id, userId, dto);
  }

  @Post(':id/payment/complete')
  @ApiOperation({ summary: 'Complete payment (idempotent)' })
  async completePayment(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id || 'buyer-freshmart';
    return this.txService.completePayment(id, userId);
  }
}
