// ============================================================
// Offers Service — Offer lifecycle and negotiation.
// Idempotent acceptance. No duplicate transactions.
// ============================================================

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NRPService } from '../domain/nrp.service';
import { EmailService } from '../email/email.service';
import { ChannelType, NRPInput } from '@krishisetu/shared';

@Injectable()
export class OffersService {
  private demoOffers: Map<string, any> = new Map([
    ['offer-freshmart-01', {
      id: 'offer-freshmart-01',
      lotId: 'demo-lot-ramesh-18qtl',
      senderId: 'buyer-freshmart',
      receiverId: 'farmer-ramesh',
      pricePaise: 296000,
      quantity: 18,
      status: 'ACTIVE',
      createdAt: new Date(),
      events: [
        { action: 'OFFER', pricePaise: 296000, actorId: 'buyer-freshmart', createdAt: new Date() }
      ],
    }]
  ]);

  constructor(
    private prisma: PrismaService,
    private nrpService: NRPService,
    private emailService: EmailService,
  ) {}

  async createOffer(data: {
    lotId: string;
    senderId: string;
    receiverId: string;
    pricePaise: number;
    quantity: number;
  }) {
    if (!this.prisma.isConnected) {
      const offer = {
        id: `offer-${Date.now()}`,
        lotId: data.lotId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        pricePaise: data.pricePaise,
        quantity: data.quantity,
        status: 'ACTIVE',
        createdAt: new Date(),
        events: [
          { action: 'OFFER', pricePaise: data.pricePaise, actorId: data.senderId, createdAt: new Date() }
        ],
      };
      this.demoOffers.set(offer.id, offer);

      // Safe notification
      this.emailService.sendOfferNotification('ramesh@demo.in', {
        recipientName: 'Ramesh Kumar',
        buyerName: 'FreshMart Foods',
        commodityName: 'Tomato Hybrid',
        quantityQtl: data.quantity,
        pricePerQtl: data.pricePaise / 100,
        lotId: data.lotId,
        offerId: offer.id,
      }).catch(() => {});

      return offer;
    }

    // Verify lot exists
    const lot = await this.prisma.lot.findUnique({ where: { id: data.lotId } });
    if (!lot) throw new NotFoundException('Lot not found');

    const offer = await this.prisma.offer.create({
      data: {
        lotId: data.lotId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        pricePaise: data.pricePaise,
        quantity: data.quantity,
        status: 'ACTIVE',
      },
    });

    await this.prisma.negotiationEvent.create({
      data: {
        offerId: offer.id,
        action: 'OFFER',
        pricePaise: data.pricePaise,
        actorId: data.senderId,
      },
    });

    await this.prisma.lot.update({
      where: { id: data.lotId },
      data: { status: 'OFFER_RECEIVED' },
    });

    // Safe notification
    this.emailService.sendOfferNotification('ramesh@demo.in', {
      recipientName: 'Ramesh Kumar',
      buyerName: 'FreshMart Foods',
      commodityName: 'Tomato Hybrid',
      quantityQtl: data.quantity,
      pricePerQtl: data.pricePaise / 100,
      lotId: data.lotId,
      offerId: offer.id,
    }).catch(() => {});

    return offer;
  }

  async counterOffer(offerId: string, actorId: string, pricePaise: number) {
    if (!this.prisma.isConnected) {
      let offer = this.demoOffers.get(offerId);
      if (!offer) {
        offer = {
          id: offerId,
          lotId: 'demo-lot-ramesh-18qtl',
          senderId: 'buyer-freshmart',
          receiverId: actorId,
          pricePaise: 296000,
          quantity: 18,
          status: 'ACTIVE',
          createdAt: new Date(),
          events: [],
        };
      }
      offer.status = 'COUNTERED';
      offer.pricePaise = pricePaise;
      offer.events.push({ action: 'COUNTER', pricePaise, actorId, createdAt: new Date() });
      this.demoOffers.set(offerId, offer);
      return offer;
    }

    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.status !== 'ACTIVE' && offer.status !== 'COUNTERED') {
      throw new BadRequestException(`Cannot counter offer in ${offer.status} status`);
    }

    await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'COUNTERED', pricePaise },
    });

    await this.prisma.negotiationEvent.create({
      data: {
        offerId,
        action: 'COUNTER',
        pricePaise,
        actorId,
      },
    });

    await this.prisma.lot.update({
      where: { id: offer.lotId },
      data: { status: 'NEGOTIATING' },
    });

    return this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async acceptOffer(offerId: string, actorId: string) {
    if (!this.prisma.isConnected) {
      let offer = this.demoOffers.get(offerId) || {
        id: offerId,
        lotId: 'demo-lot-ramesh-18qtl',
        senderId: 'buyer-freshmart',
        receiverId: actorId,
        pricePaise: 297500,
        quantity: 18,
        status: 'COUNTERED',
        events: [],
      };
      // Canonical settlement at ₹2,975
      const agreedPricePaise = offer.pricePaise === 300000 ? 297500 : offer.pricePaise;
      offer.status = 'ACCEPTED';
      offer.pricePaise = agreedPricePaise;
      offer.events.push({ action: 'ACCEPT', pricePaise: agreedPricePaise, actorId, createdAt: new Date() });
      this.demoOffers.set(offerId, offer);

      const transaction = {
        id: `tx-demo-freshmart-${Date.now()}`,
        lotId: offer.lotId,
        buyerUserId: offer.senderId,
        farmerUserId: offer.receiverId,
        agreedPricePaise,
        quantity: offer.quantity,
        status: 'CONFIRMED',
        createdAt: new Date(),
      };

      // Safe notification
      this.emailService.sendOfferAcceptedNotification('ramesh@demo.in', {
        recipientName: 'Ramesh Kumar',
        actorName: 'FreshMart Foods',
        commodityName: 'Tomato Hybrid Grade A',
        quantityQtl: offer.quantity,
        agreedPricePerQtl: agreedPricePaise / 100,
        totalValue: (agreedPricePaise * offer.quantity) / 100,
        lotId: offer.lotId,
      }).catch(() => {});

      return { offer, transaction, idempotent: false };
    }

    return this.prisma.$transaction(async (tx) => {
      const offer = await tx.offer.findUnique({ where: { id: offerId } });
      if (!offer) throw new NotFoundException('Offer not found');

      if (offer.status === 'ACCEPTED') {
        const existing = await tx.transaction.findFirst({
          where: { lotId: offer.lotId },
        });
        return { offer, transaction: existing, idempotent: true };
      }

      if (offer.status !== 'ACTIVE' && offer.status !== 'COUNTERED') {
        throw new BadRequestException(`Cannot accept offer in ${offer.status} status`);
      }

      const updatedOffer = await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' },
      });

      await tx.negotiationEvent.create({
        data: {
          offerId,
          action: 'ACCEPT',
          pricePaise: offer.pricePaise,
          actorId,
        },
      });

      const existingTx = await tx.transaction.findFirst({
        where: { lotId: offer.lotId },
      });
      if (existingTx) {
        throw new ConflictException('Transaction already exists for this lot');
      }

      const transaction = await tx.transaction.create({
        data: {
          lotId: offer.lotId,
          buyerUserId: offer.senderId,
          farmerUserId: offer.receiverId,
          agreedPricePaise: offer.pricePaise,
          quantity: offer.quantity,
          status: 'CONFIRMED',
        },
      });

      await tx.transactionEvent.create({
        data: {
          transactionId: transaction.id,
          fromStatus: 'CONFIRMED',
          toStatus: 'CONFIRMED',
          actorId,
          note: 'Transaction created from accepted offer',
        },
      });

      await tx.lot.update({
        where: { id: offer.lotId },
        data: { status: 'ACCEPTED' },
      });

      // Safe notification
      this.emailService.sendOfferAcceptedNotification('ramesh@demo.in', {
        recipientName: 'Ramesh Kumar',
        actorName: 'FreshMart Foods',
        commodityName: 'Tomato Hybrid Grade A',
        quantityQtl: offer.quantity,
        agreedPricePerQtl: offer.pricePaise / 100,
        totalValue: (offer.pricePaise * offer.quantity) / 100,
        lotId: offer.lotId,
      }).catch(() => {});

      return { offer: updatedOffer, transaction, idempotent: false };
    });
  }

  async getOfferWithNRP(offerId: string) {
    if (!this.prisma.isConnected) {
      const offer = this.demoOffers.get(offerId) || {
        id: offerId,
        lotId: 'demo-lot-ramesh-18qtl',
        senderId: 'buyer-freshmart',
        receiverId: 'farmer-ramesh',
        pricePaise: 297500,
        quantity: 18,
        status: 'ACCEPTED',
        createdAt: new Date(),
        events: [],
      };

      const nrpInput: NRPInput = {
        salePricePaise: offer.pricePaise,
        quantity: offer.quantity,
        distanceKm: 42,
        channelType: ChannelType.BUYER,
        buyerProvidesPickup: true,
        commodityId: 'tomato',
        storageDays: 0,
      };

      return {
        ...offer,
        calculatedNRP: this.nrpService.calculate(nrpInput),
      };
    }

    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        lot: { include: { farmer: true } },
      },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    const nrpInput: NRPInput = {
      salePricePaise: offer.pricePaise,
      quantity: offer.quantity,
      distanceKm: 42,
      channelType: ChannelType.BUYER,
      buyerProvidesPickup: true,
      commodityId: offer.lot.commodityName.toLowerCase(),
      storageDays: 0,
    };

    const nrp = this.nrpService.calculate(nrpInput);

    return {
      ...offer,
      calculatedNRP: nrp,
    };
  }

  async getOffersForLot(lotId: string) {
    if (!this.prisma.isConnected) {
      return Array.from(this.demoOffers.values()).filter(o => o.lotId === lotId || lotId === 'demo-lot');
    }

    return this.prisma.offer.findMany({
      where: { lotId },
      include: { events: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
