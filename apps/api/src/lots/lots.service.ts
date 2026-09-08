import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isValidLotTransition, LotStatus } from '@krishisetu/shared';
import { DEMO_LOT, DEMO_FARMER } from '@krishisetu/shared';

@Injectable()
export class LotsService {
  constructor(private prisma: PrismaService) {}

  private getCanonicalDemoLot() {
    return {
      id: 'demo-lot-ramesh-18qtl',
      farmerId: 'farmer-ramesh',
      commodityName: DEMO_LOT.commodityName,
      varietyName: DEMO_LOT.varietyName,
      quantity: DEMO_LOT.quantity,
      unit: 'quintal',
      qualityGrade: DEMO_LOT.qualityGrade,
      qualityParams: DEMO_LOT.qualityParams,
      harvestDate: new Date(DEMO_LOT.harvestDate),
      expectedSaleDate: new Date(DEMO_LOT.expectedSaleDate),
      minAcceptablePricePaise: DEMO_LOT.minAcceptablePricePaise,
      status: 'LISTED' as LotStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      farmer: {
        id: 'farmer-ramesh',
        name: DEMO_FARMER.name,
        village: DEMO_FARMER.village,
        district: DEMO_FARMER.district,
        state: DEMO_FARMER.state,
        latitude: DEMO_FARMER.location.latitude,
        longitude: DEMO_FARMER.location.longitude,
      },
      offers: [],
      transactions: [],
    };
  }

  async create(farmerId: string, data: {
    commodityName: string;
    varietyName: string;
    quantity: number;
    qualityGrade: string;
    qualityParams?: any;
    harvestDate?: string;
    expectedSaleDate?: string;
    minAcceptablePricePaise?: number;
  }) {
    if (!this.prisma.isConnected) {
      return {
        ...this.getCanonicalDemoLot(),
        ...data,
        id: `lot-${Date.now()}`,
        status: 'DRAFT' as LotStatus,
      };
    }

    let farmer = await this.prisma.farmerProfile.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      const profile = await this.prisma.farmerProfile.findUnique({ where: { userId: farmerId } });
      if (!profile) throw new NotFoundException('Farmer profile not found');
      farmerId = profile.id;
    }

    return this.prisma.lot.create({
      data: {
        farmerId,
        commodityName: data.commodityName,
        varietyName: data.varietyName,
        quantity: data.quantity,
        qualityGrade: data.qualityGrade,
        qualityParams: data.qualityParams ?? {},
        harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
        expectedSaleDate: data.expectedSaleDate ? new Date(data.expectedSaleDate) : null,
        minAcceptablePricePaise: data.minAcceptablePricePaise,
        status: 'DRAFT',
      },
    });
  }

  async findById(id: string) {
    if (!this.prisma.isConnected || id === 'demo-lot' || id === 'demo-lot-ramesh-18qtl') {
      return this.getCanonicalDemoLot();
    }

    try {
      const lot = await this.prisma.lot.findUnique({
        where: { id },
        include: { farmer: true, offers: true, transactions: true },
      });
      if (!lot) return this.getCanonicalDemoLot();
      return lot;
    } catch (e) {
      return this.getCanonicalDemoLot();
    }
  }

  async findByFarmer(farmerId: string) {
    if (!this.prisma.isConnected) {
      return [this.getCanonicalDemoLot()];
    }
    return this.prisma.lot.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByFarmerUserId(userId: string) {
    if (!this.prisma.isConnected) {
      return [this.getCanonicalDemoLot()];
    }

    try {
      const profile = await this.prisma.farmerProfile.findUnique({ where: { userId } });
      if (!profile) return [this.getCanonicalDemoLot()];
      return this.findByFarmer(profile.id);
    } catch (e) {
      return [this.getCanonicalDemoLot()];
    }
  }

  async updateStatus(id: string, newStatus: LotStatus) {
    const lot = await this.findById(id);

    if (!isValidLotTransition(lot.status as LotStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${lot.status} to ${newStatus}`,
      );
    }

    if (!this.prisma.isConnected) {
      return { ...lot, status: newStatus };
    }

    return this.prisma.lot.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async getStatusActions(id: string) {
    const lot = await this.findById(id);
    const allStatuses: LotStatus[] = [
      LotStatus.DRAFT, LotStatus.READY, LotStatus.MATCHED, LotStatus.OFFER_RECEIVED,
      LotStatus.NEGOTIATING, LotStatus.ACCEPTED, LotStatus.LOGISTICS_BOOKED,
      LotStatus.IN_TRANSIT, LotStatus.DELIVERED, LotStatus.PAYMENT_PENDING,
      LotStatus.COMPLETED, LotStatus.CANCELLED,
    ];
    return {
      currentStatus: lot.status,
      allowedTransitions: allStatuses.filter(s =>
        isValidLotTransition(lot.status as LotStatus, s),
      ),
    };
  }
}
