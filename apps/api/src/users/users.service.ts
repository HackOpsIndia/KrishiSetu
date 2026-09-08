import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        fpoProfile: { include: { members: { include: { farmer: true } } } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateFarmerProfile(userId: string, data: {
    village?: string; district?: string; state?: string;
    latitude?: number; longitude?: number; preferredRadius?: number;
  }) {
    return this.prisma.farmerProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, village: data.village || '', district: data.district || '', state: data.state || '', ...data },
    });
  }

  async updateBuyerProfile(userId: string, data: {
    companyName?: string; buyerType?: any;
    latitude?: number; longitude?: number;
    serviceRadiusKm?: number; providesPickup?: boolean;
  }) {
    return this.prisma.buyerProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, companyName: data.companyName || '', buyerType: data.buyerType || 'TRADER', ...data },
    });
  }
}
