import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.market.findMany({
      where: { isActive: true },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.market.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });
  }

  async getLatestPrices(commodityName: string, varietyName: string) {
    return this.prisma.marketPrice.findMany({
      where: { commodityName, varietyName },
      orderBy: { date: 'desc' },
      include: { market: true },
      distinct: ['marketId'],
    });
  }

  async findNearbyMarkets(latitude: number, longitude: number, radiusKm: number) {
    // For demo: return all markets (PostGIS query in production)
    return this.prisma.market.findMany({
      where: { isActive: true },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });
  }
}
