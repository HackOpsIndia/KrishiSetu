import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { status, reason } = await req.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    const validStatuses = ['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}` },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const previousStatus = existing.status;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: status as any, isActive: status === 'ACTIVE' },
    });

    // Record audit event
    try {
      await prisma.auditEvent.create({
        data: {
          userId: id,
          action: 'USER_STATUS_UPDATED',
          entityType: 'User',
          entityId: id,
          details: {
            previousStatus,
            newStatus: status,
            reason: reason || 'Admin status change',
            changedAt: new Date().toISOString(),
          },
        },
      });
    } catch (auditErr) {
      console.warn('[Admin Status PATCH] Audit event warning:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `User status successfully updated to ${status}`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('[Admin Status PATCH] Error:', err);
    return NextResponse.json(
      { message: err?.message || 'Failed to update user status' },
      { status: 500 },
    );
  }
}
