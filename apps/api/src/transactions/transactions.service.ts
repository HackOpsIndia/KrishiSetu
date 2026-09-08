// ============================================================
// Transactions Service — Transaction lifecycle, payments, impact.
// Server-authoritative state machine. Idempotent operations.
// ============================================================

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NRPService } from '../domain/nrp.service';
import { ImpactService } from '../domain/impact.service';
import { EmailService } from '../email/email.service';
import { isValidTransactionTransition, TransactionStatus, ChannelType, NRPInput } from '@krishisetu/shared';
import { TRANSACTION_TRANSITIONS, DEMO_NRP_CONFIG } from '@krishisetu/shared';

@Injectable()
export class TransactionsService {
  private demoTransactions: Map<string, any> = new Map([
    ['tx-demo-freshmart-01', {
      id: 'tx-demo-freshmart-01',
      lotId: 'demo-lot-ramesh-18qtl',
      buyerUserId: 'buyer-freshmart',
      farmerUserId: 'farmer-ramesh',
      agreedPricePaise: 297500, // ₹2,975 agreed
      quantity: 18,
      status: 'CONFIRMED' as TransactionStatus,
      createdAt: new Date(),
      lot: {
        id: 'demo-lot-ramesh-18qtl',
        commodityName: 'Tomato',
        varietyName: 'Hybrid',
        quantity: 18,
        farmer: { name: 'Ramesh Kumar', village: 'Dehu Road', district: 'Pune' },
      },
      events: [
        { fromStatus: 'CONFIRMED', toStatus: 'CONFIRMED', actorId: 'buyer-freshmart', note: 'Transaction confirmed from accepted offer', createdAt: new Date() }
      ],
      logistics: null,
      payment: null,
    }]
  ]);

  constructor(
    private prisma: PrismaService,
    private nrpService: NRPService,
    private impactService: ImpactService,
    private emailService: EmailService,
  ) {}

  async findById(id: string) {
    if (!this.prisma.isConnected || id.startsWith('tx-demo')) {
      let tx = this.demoTransactions.get(id);
      if (!tx) {
        tx = {
          id,
          lotId: 'demo-lot-ramesh-18qtl',
          buyerUserId: 'buyer-freshmart',
          farmerUserId: 'farmer-ramesh',
          agreedPricePaise: 297500, // ₹2,975 canonical agreed
          quantity: 18,
          status: 'CONFIRMED' as TransactionStatus,
          createdAt: new Date(),
          lot: {
            id: 'demo-lot-ramesh-18qtl',
            commodityName: 'Tomato',
            varietyName: 'Hybrid',
            quantity: 18,
            farmer: { name: 'Ramesh Kumar', village: 'Dehu Road', district: 'Pune' },
          },
          events: [
            { fromStatus: 'CONFIRMED', toStatus: 'CONFIRMED', actorId: 'buyer-freshmart', note: 'Transaction confirmed from accepted offer', createdAt: new Date() }
          ],
          logistics: null,
          payment: null,
        };
        this.demoTransactions.set(id, tx);
      }
      return tx;
    }

    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        lot: { include: { farmer: true } },
        events: { orderBy: { createdAt: 'asc' } },
        logistics: true,
        payment: true,
      },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async findByUser(userId: string) {
    if (!this.prisma.isConnected) {
      return Array.from(this.demoTransactions.values());
    }

    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { farmerUserId: userId },
          { buyerUserId: userId },
        ],
      },
      include: { lot: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async transitionStatus(id: string, newStatus: TransactionStatus, actorId: string, note?: string) {
    const tx = await this.findById(id);
    const currentStatus = tx.status as TransactionStatus;

    if (!isValidTransactionTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid transaction transition: ${currentStatus} → ${newStatus}`
      );
    }

    if (!this.prisma.isConnected || id.startsWith('tx-demo')) {
      tx.status = newStatus;
      tx.events.push({
        fromStatus: currentStatus,
        toStatus: newStatus,
        actorId,
        note,
        createdAt: new Date(),
      });
      this.demoTransactions.set(tx.id, tx);

      // Safe notification
      this.emailService.sendTransactionUpdate('ramesh@demo.in', {
        recipientName: 'Ramesh Kumar',
        transactionId: tx.id,
        commodityName: tx.lot?.commodityName || 'Tomato',
        quantityQtl: tx.quantity || 18,
        status: newStatus,
        note,
      }).catch(() => {});

      return tx;
    }

    return this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.transaction.update({
        where: { id },
        data: { status: newStatus },
      });

      await prisma.transactionEvent.create({
        data: {
          transactionId: id,
          fromStatus: currentStatus,
          toStatus: newStatus,
          actorId,
          note,
        },
      });

      const lotStatusMap: Record<string, string> = {
        'LOGISTICS_BOOKED': 'LOGISTICS_BOOKED',
        'IN_TRANSIT': 'IN_TRANSIT',
        'DELIVERED': 'DELIVERED',
        'PAYMENT_PENDING': 'PAYMENT_PENDING',
        'COMPLETED': 'COMPLETED',
      };

      if (lotStatusMap[newStatus]) {
        await prisma.lot.update({
          where: { id: tx.lotId },
          data: { status: lotStatusMap[newStatus] as any },
        });
      }

      // Safe notification
      this.emailService.sendTransactionUpdate('ramesh@demo.in', {
        recipientName: 'Ramesh Kumar',
        transactionId: tx.id,
        commodityName: tx.lot?.commodityName || 'Tomato',
        quantityQtl: tx.quantity || 18,
        status: newStatus,
        note,
      }).catch(() => {});

      return updated;
    });
  }

  async bookLogistics(transactionId: string, actorId: string, data: {
    distanceKm: number;
    estimatedCostPaise: number;
    vehicleType?: string;
    pickupDate?: string;
  }) {
    if (!this.prisma.isConnected || transactionId.startsWith('tx-demo')) {
      const tx = await this.findById(transactionId);
      const booking = {
        id: `logistics-${Date.now()}`,
        transactionId,
        distanceKm: data.distanceKm,
        estimatedCostPaise: data.estimatedCostPaise,
        vehicleType: data.vehicleType || 'Tata Ace (1.5 Ton)',
        pickupDate: data.pickupDate ? new Date(data.pickupDate) : new Date(),
        status: 'SCHEDULED',
      };
      tx.logistics = booking;
      await this.transitionStatus(transactionId, TransactionStatus.LOGISTICS_BOOKED, actorId, 'Logistics booked');
      return { booking, idempotent: false };
    }

    const existing = await this.prisma.logisticsBooking.findUnique({
      where: { transactionId },
    });
    if (existing) return { booking: existing, idempotent: true };

    const booking = await this.prisma.logisticsBooking.create({
      data: {
        transactionId,
        distanceKm: data.distanceKm,
        estimatedCostPaise: data.estimatedCostPaise,
        vehicleType: data.vehicleType,
        pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
      },
    });

    await this.transitionStatus(transactionId, TransactionStatus.LOGISTICS_BOOKED, actorId, 'Logistics booked');

    return { booking, idempotent: false };
  }

  async completePayment(transactionId: string, actorId: string) {
    const tx = await this.findById(transactionId);

    // Idempotent: already paid
    if (tx.payment?.status === 'SUCCESS') {
      return { payment: tx.payment, idempotent: true };
    }

    // Payment = agreedPrice × quantity (from transaction, not hardcoded)
    const paymentAmount = tx.agreedPricePaise * tx.quantity;

    if (!this.prisma.isConnected || transactionId.startsWith('tx-demo')) {
      const payment = {
        id: `pay-${Date.now()}`,
        transactionId,
        amountPaise: paymentAmount,
        status: 'SUCCESS',
        method: 'SIMULATED_PAYMENT_COMPLETION',
        paidAt: new Date(),
      };
      tx.payment = payment;
      tx.status = TransactionStatus.COMPLETED;
      tx.events.push({
        fromStatus: TransactionStatus.PAYMENT_PENDING,
        toStatus: TransactionStatus.COMPLETED,
        actorId,
        note: `Payment of ₹${paymentAmount / 100} released to farmer bank account`,
        createdAt: new Date(),
      });
      this.demoTransactions.set(tx.id, tx);

      // Safe notification
      this.emailService.sendPaymentNotification('ramesh@demo.in', {
        recipientName: 'Ramesh Kumar',
        transactionId,
        amount: paymentAmount / 100,
        status: 'SUCCESS',
        referenceNumber: `PAY-${transactionId.slice(0, 8).toUpperCase()}`,
        method: 'Direct Escrow Settlement (T+1)',
        paidAt: new Date(),
      }).catch(() => {});

      return { payment, idempotent: false };
    }

    const payment = await this.prisma.$transaction(async (prisma) => {
      const p = await prisma.payment.upsert({
        where: { transactionId },
        update: { status: 'SUCCESS', paidAt: new Date() },
        create: {
          transactionId,
          amountPaise: paymentAmount,
          status: 'SUCCESS',
          method: 'DEMO_BANK_TRANSFER',
          paidAt: new Date(),
        },
      });

      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'COMPLETED' },
      });

      await prisma.transactionEvent.create({
        data: {
          transactionId,
          fromStatus: tx.status as any,
          toStatus: 'COMPLETED',
          actorId,
          note: `Payment of ₹${paymentAmount / 100} completed`,
        },
      });

      await prisma.lot.update({
        where: { id: tx.lotId },
        data: { status: 'COMPLETED' },
      });

      // Safe notification
      this.emailService.sendPaymentNotification('ramesh@demo.in', {
        recipientName: 'Ramesh Kumar',
        transactionId,
        amount: paymentAmount / 100,
        status: 'SUCCESS',
        referenceNumber: `PAY-${transactionId.slice(0, 8).toUpperCase()}`,
        method: 'Direct Escrow Settlement (T+1)',
        paidAt: new Date(),
      }).catch(() => {});

      return p;
    });

    return { payment, idempotent: false };
  }

  async getTransactionSummary(id: string) {
    const tx = await this.findById(id);

    const nrpInput: NRPInput = {
      salePricePaise: tx.agreedPricePaise,
      quantity: tx.quantity,
      distanceKm: tx.logistics?.distanceKm ?? 42,
      channelType: ChannelType.BUYER,
      buyerProvidesPickup: true,
      commodityId: tx.lot.commodityName.toLowerCase(),
      storageDays: 0,
    };

    const finalNRP = this.nrpService.calculate(nrpInput);
    const paymentTotal = tx.agreedPricePaise * tx.quantity;

    return {
      transaction: tx,
      agreedPricePaise: tx.agreedPricePaise,
      agreedPriceRupees: tx.agreedPricePaise / 100,
      quantity: tx.quantity,
      paymentTotalPaise: paymentTotal,
      paymentTotalRupees: paymentTotal / 100,
      finalNRP,
      allowedActions: TRANSACTION_TRANSITIONS[tx.status as TransactionStatus] || [],
    };
  }

  async getImpact(transactionId: string, baselineMarketName = 'Talegaon Mandi', baselineMarketPricePaise = 290000, baselineDistanceKm = 18) {
    const tx = await this.findById(transactionId);

    const finalNRPInput: NRPInput = {
      salePricePaise: tx.agreedPricePaise,
      quantity: tx.quantity,
      distanceKm: 42,
      channelType: ChannelType.BUYER,
      buyerProvidesPickup: true,
      commodityId: tx.lot.commodityName.toLowerCase(),
      storageDays: 0,
    };

    const selectedNRP = this.nrpService.calculate(finalNRPInput);

    return this.impactService.calculate({
      selectedNRP,
      selectedOpportunityName: 'FreshMart Foods',
      baselineMarketName,
      baselineMarketPricePaise,
      baselineDistanceKm,
      baselineQuantity: tx.quantity,
      baselineCommodityId: tx.lot.commodityName.toLowerCase(),
      config: DEMO_NRP_CONFIG,
    });
  }
}
