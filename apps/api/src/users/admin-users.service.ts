// ============================================================
// Admin Users Service — Platform User & Access Governance
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  inMemoryUsers,
  inMemoryAuditLogs,
  InMemoryUserRecord,
  AuditRecord,
} from '../auth/auth.service';

export interface UserQueryFilter {
  search?: string;
  role?: string;
  status?: string;
  provider?: string;
}

@Injectable()
export class AdminUsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Helper: strip sensitive credentials
   */
  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  /**
   * List platform users with search, role, status, and provider filters.
   */
  async listUsers(filters: UserQueryFilter) {
    const { search, role, status, provider } = filters;

    // 1. PostgreSQL path
    if (this.prisma.isConnected) {
      const where: any = {};
      if (role && role !== 'ALL') where.role = role;
      if (status && status !== 'ALL') where.status = status;
      if (provider && provider !== 'ALL') where.authProvider = provider;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const users = await this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          farmerProfile: true,
          buyerProfile: true,
        },
      });

      return users.map((u) => this.sanitizeUser(u));
    }

    // 2. In-Memory path
    let users = Array.from(inMemoryUsers.values());

    if (role && role !== 'ALL') {
      users = users.filter((u) => u.role === role);
    }
    if (status && status !== 'ALL') {
      users = users.filter((u) => u.status === status);
    }
    if (provider && provider !== 'ALL') {
      users = users.filter((u) => u.authProvider === provider);
    }
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q)),
      );
    }

    return users.map((u) => this.sanitizeUser(u));
  }

  /**
   * Aggregated user governance KPIs
   */
  async getUserStats() {
    if (this.prisma.isConnected) {
      const all = await this.prisma.user.findMany();
      return {
        totalUsers: all.length,
        farmers: all.filter((u) => u.role === 'FARMER').length,
        buyers: all.filter((u) => u.role === 'BUYER').length,
        fpos: all.filter((u) => u.role === 'FPO').length,
        admins: all.filter((u) => u.role === 'ADMIN').length,
        active: all.filter((u) => u.status === 'ACTIVE').length,
        suspended: all.filter((u) => u.status === 'SUSPENDED').length,
        pending: all.filter((u) => u.status === 'PENDING').length,
      };
    }

    const all = Array.from(inMemoryUsers.values());
    return {
      totalUsers: all.length,
      farmers: all.filter((u) => u.role === 'FARMER').length,
      buyers: all.filter((u) => u.role === 'BUYER').length,
      fpos: all.filter((u) => u.role === 'FPO').length,
      admins: all.filter((u) => u.role === 'ADMIN').length,
      active: all.filter((u) => u.status === 'ACTIVE').length,
      suspended: all.filter((u) => u.status === 'SUSPENDED').length,
      pending: all.filter((u) => u.status === 'PENDING').length,
    };
  }

  /**
   * Get complete user profile for administrative detail drawer
   */
  async getUserDetail(userIdOrEmail: string) {
    if (this.prisma.isConnected) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: userIdOrEmail }, { email: userIdOrEmail.toLowerCase() }],
        },
        include: {
          farmerProfile: true,
          buyerProfile: true,
          fpoProfile: true,
          auditEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
      });
      if (!user) throw new NotFoundException('Target user not found');
      return this.sanitizeUser(user);
    }

    const user =
      inMemoryUsers.get(userIdOrEmail.toLowerCase()) ||
      Array.from(inMemoryUsers.values()).find((u) => u.id === userIdOrEmail);

    if (!user) throw new NotFoundException('Target user not found');

    const auditEvents = inMemoryAuditLogs.filter(
      (a) => a.targetUserId === user.id || a.targetEmail === user.email,
    );

    return {
      ...this.sanitizeUser(user),
      auditEvents,
    };
  }

  /**
   * Role Mutation with Final-Admin Safety and Audit Logging
   */
  async updateUserRole(
    targetUserId: string,
    newRole: 'FARMER' | 'FPO' | 'BUYER' | 'ADMIN',
    actor: { id: string; email: string },
    reason?: string,
  ) {
    if (!['FARMER', 'FPO', 'BUYER', 'ADMIN'].includes(newRole)) {
      throw new BadRequestException(`Invalid role: ${newRole}`);
    }

    // 1. PostgreSQL path
    if (this.prisma.isConnected) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
      });
      if (!targetUser) throw new NotFoundException('Target user not found');

      // Final-admin protection
      if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
        const adminCount = await this.prisma.user.count({
          where: { role: 'ADMIN', status: 'ACTIVE' },
        });
        if (adminCount <= 1) {
          throw new BadRequestException(
            'Cannot revoke administrator role from the final active platform administrator.',
          );
        }
      }

      const previousRole = targetUser.role;
      const updatedUser = await this.prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });

      // Record audit event
      const auditAction =
        newRole === 'ADMIN'
          ? 'ADMIN_ROLE_GRANTED'
          : previousRole === 'ADMIN'
          ? 'ADMIN_ROLE_REVOKED'
          : 'USER_ROLE_CHANGED';

      await this.prisma.auditEvent.create({
        data: {
          userId: actor.id,
          action: auditAction,
          entityType: 'USER_ROLE',
          entityId: targetUserId,
          details: {
            actorEmail: actor.email,
            targetEmail: targetUser.email,
            previousRole,
            newRole,
            reason: reason || 'Administrative access reassignment',
          },
        },
      });

      // Dispatch security notification
      if (newRole === 'ADMIN' || previousRole === 'ADMIN') {
        this.emailService
          .sendSecurityAlert(targetUser.email, {
            recipientName: targetUser.name,
            email: targetUser.email,
            eventType: newRole === 'ADMIN' ? 'ADMIN_ROLE_GRANTED' : 'ADMIN_ROLE_REVOKED',
            details: `Your KrishiSetu account role was updated from ${previousRole} to ${newRole} by administrator ${actor.email}.`,
            timestamp: new Date(),
          })
          .catch(() => {});
      }

      return this.sanitizeUser(updatedUser);
    }

    // 2. In-Memory path
    const targetUser =
      Array.from(inMemoryUsers.values()).find((u) => u.id === targetUserId) ||
      inMemoryUsers.get(targetUserId.toLowerCase());

    if (!targetUser) throw new NotFoundException('Target user not found');

    // Final-admin protection
    if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
      const activeAdmins = Array.from(inMemoryUsers.values()).filter(
        (u) => u.role === 'ADMIN' && u.status === 'ACTIVE',
      );
      if (activeAdmins.length <= 1) {
        throw new BadRequestException(
          'Cannot revoke administrator role from the final active platform administrator.',
        );
      }
    }

    const previousRole = targetUser.role;
    targetUser.role = newRole;
    targetUser.updatedAt = new Date();

    const auditAction =
      newRole === 'ADMIN'
        ? 'ADMIN_ROLE_GRANTED'
        : previousRole === 'ADMIN'
        ? 'ADMIN_ROLE_REVOKED'
        : 'USER_ROLE_CHANGED';

    inMemoryAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      actorEmail: actor.email,
      action: auditAction,
      previousValue: previousRole,
      newValue: newRole,
      reason: reason || 'Administrative access reassignment',
      timestamp: new Date(),
    });

    // Dispatch security notification
    if (newRole === 'ADMIN' || previousRole === 'ADMIN') {
      this.emailService
        .sendSecurityAlert(targetUser.email, {
          recipientName: targetUser.name,
          email: targetUser.email,
          eventType: newRole === 'ADMIN' ? 'ADMIN_ROLE_GRANTED' : 'ADMIN_ROLE_REVOKED',
          details: `Your KrishiSetu account role was updated from ${previousRole} to ${newRole} by administrator ${actor.email}.`,
          timestamp: new Date(),
        })
        .catch(() => {});
    }

    return this.sanitizeUser(targetUser);
  }

  /**
   * Account Status Mutation with Self-Protection, Final-Admin Safety, and Audit Logging
   */
  async updateUserStatus(
    targetUserId: string,
    newStatus: 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING',
    actor: { id: string; email: string },
    reason?: string,
  ) {
    if (!['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING'].includes(newStatus)) {
      throw new BadRequestException(`Invalid account status: ${newStatus}`);
    }

    // 1. PostgreSQL path
    if (this.prisma.isConnected) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
      });
      if (!targetUser) throw new NotFoundException('Target user not found');

      // Self-protection
      if (
        (actor.id === targetUser.id || actor.email.toLowerCase() === targetUser.email.toLowerCase()) &&
        (newStatus === 'SUSPENDED' || newStatus === 'DISABLED')
      ) {
        throw new BadRequestException(
          'Administrators cannot suspend or disable their own account.',
        );
      }

      // Final-admin protection
      if (
        targetUser.role === 'ADMIN' &&
        (newStatus === 'SUSPENDED' || newStatus === 'DISABLED')
      ) {
        const activeAdmins = await this.prisma.user.count({
          where: { role: 'ADMIN', status: 'ACTIVE', id: { not: targetUserId } },
        });
        if (activeAdmins === 0) {
          throw new BadRequestException(
            'Cannot suspend or disable the final active platform administrator.',
          );
        }
      }

      const previousStatus = targetUser.status;
      const updatedUser = await this.prisma.user.update({
        where: { id: targetUserId },
        data: {
          status: newStatus,
          isActive: newStatus === 'ACTIVE',
        },
      });

      const auditAction =
        newStatus === 'ACTIVE'
          ? 'USER_ACTIVATED'
          : newStatus === 'SUSPENDED'
          ? 'USER_SUSPENDED'
          : 'USER_DISABLED';

      await this.prisma.auditEvent.create({
        data: {
          userId: actor.id,
          action: auditAction,
          entityType: 'ACCOUNT_STATUS',
          entityId: targetUserId,
          details: {
            actorEmail: actor.email,
            targetEmail: targetUser.email,
            previousStatus,
            newStatus,
            reason: reason || 'Administrative status adjustment',
          },
        },
      });

      // Dispatch security notification on suspension or status change
      if (newStatus === 'SUSPENDED' || newStatus === 'DISABLED') {
        this.emailService
          .sendSecurityAlert(targetUser.email, {
            recipientName: targetUser.name,
            email: targetUser.email,
            eventType: newStatus === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_DISABLED',
            details: `Your KrishiSetu account status was set to ${newStatus} by administrator ${actor.email}. Reason: ${reason || 'Administrative governance review'}`,
            timestamp: new Date(),
          })
          .catch(() => {});
      }

      return this.sanitizeUser(updatedUser);
    }

    // 2. In-Memory path
    const targetUser =
      Array.from(inMemoryUsers.values()).find((u) => u.id === targetUserId) ||
      inMemoryUsers.get(targetUserId.toLowerCase());

    if (!targetUser) throw new NotFoundException('Target user not found');

    // Self-protection
    if (
      (actor.id === targetUser.id || actor.email.toLowerCase() === targetUser.email.toLowerCase()) &&
      (newStatus === 'SUSPENDED' || newStatus === 'DISABLED')
    ) {
      throw new BadRequestException(
        'Administrators cannot suspend or disable their own account.',
      );
    }

    // Final-admin protection
    if (
      targetUser.role === 'ADMIN' &&
      (newStatus === 'SUSPENDED' || newStatus === 'DISABLED')
    ) {
      const remainingActiveAdmins = Array.from(inMemoryUsers.values()).filter(
        (u) => u.role === 'ADMIN' && u.status === 'ACTIVE' && u.id !== targetUser.id,
      );
      if (remainingActiveAdmins.length === 0) {
        throw new BadRequestException(
          'Cannot suspend or disable the final active platform administrator.',
        );
      }
    }

    const previousStatus = targetUser.status;
    targetUser.status = newStatus;
    targetUser.isActive = newStatus === 'ACTIVE';
    targetUser.updatedAt = new Date();

    const auditAction =
      newStatus === 'ACTIVE'
        ? 'USER_ACTIVATED'
        : newStatus === 'SUSPENDED'
        ? 'USER_SUSPENDED'
        : 'USER_DISABLED';

    inMemoryAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      actorEmail: actor.email,
      action: auditAction,
      previousValue: previousStatus,
      newValue: newStatus,
      reason: reason || 'Administrative status adjustment',
      timestamp: new Date(),
    });

    // Dispatch security notification on suspension or status change
    if (newStatus === 'SUSPENDED' || newStatus === 'DISABLED') {
      this.emailService
        .sendSecurityAlert(targetUser.email, {
          recipientName: targetUser.name,
          email: targetUser.email,
          eventType: newStatus === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_DISABLED',
          details: `Your KrishiSetu account status was set to ${newStatus} by administrator ${actor.email}. Reason: ${reason || 'Administrative governance review'}`,
          timestamp: new Date(),
        })
        .catch(() => {});
    }

    return this.sanitizeUser(targetUser);
  }

  /**
   * Get user audit trail
   */
  async getUserAudit(userIdOrEmail: string) {
    const detail = await this.getUserDetail(userIdOrEmail);
    return detail.auditEvents || [];
  }
}
