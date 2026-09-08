import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { role, reason } = await req.json();

    if (!role) {
      return NextResponse.json({ message: 'Role is required' }, { status: 400 });
    }

    const validRoles = ['FARMER', 'BUYER', 'ADMIN', 'FPO'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: `Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}` },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const previousRole = existing.role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as any },
    });

    // Record audit event
    try {
      await prisma.auditEvent.create({
        data: {
          userId: id,
          action: 'USER_ROLE_UPDATED',
          entityType: 'User',
          entityId: id,
          details: {
            previousRole,
            newRole: role,
            reason: reason || 'Admin promotion/change',
            changedAt: new Date().toISOString(),
          },
        },
      });
    } catch (auditErr) {
      console.warn('[Admin Role PATCH] Audit event warning:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('[Admin Role PATCH] Error:', err);
    return NextResponse.json(
      { message: err?.message || 'Failed to update user role' },
      { status: 500 },
    );
  }
}
