import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';
import { OffersService } from './offers.service';

class CreateOfferDto {
  @IsString() lotId: string;
  @IsString() receiverId: string;
  @IsNumber() @Min(1) pricePaise: number;
  @IsNumber() @Min(0.1) quantity: number;
}

class CounterOfferDto {
  @IsNumber() @Min(1) pricePaise: number;
}

@ApiTags('Offers')
@Controller('api/offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an offer on a lot' })
  async create(@Request() req, @Body() dto: CreateOfferDto) {
    const senderId = req.user?.id || 'buyer-freshmart';
    return this.offersService.createOffer({
      ...dto,
      senderId,
    });
  }

  @Post(':id/counter')
  @ApiOperation({ summary: 'Counter an offer' })
  async counter(@Request() req, @Param('id') id: string, @Body() dto: CounterOfferDto) {
    const actorId = req.user?.id || 'farmer-ramesh';
    return this.offersService.counterOffer(id, actorId, dto.pricePaise);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept an offer (idempotent)' })
  async accept(@Request() req, @Param('id') id: string) {
    const actorId = req.user?.id || 'farmer-ramesh';
    return this.offersService.acceptOffer(id, actorId);
  }

  @Get('lot/:lotId')
  @ApiOperation({ summary: 'List offers for a lot' })
  async listForLot(@Param('lotId') lotId: string) {
    return this.offersService.getOffersForLot(lotId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer details with calculated NRP' })
  async get(@Param('id') id: string) {
    return this.offersService.getOfferWithNRP(id);
  }
}
