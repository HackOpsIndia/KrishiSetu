import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/server/prisma';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return payload.sub || null;
      }
    } catch { }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    let userId = getUserIdFromRequest(req);
    let avatarUrl: string | null = null;
    let filename = `avatar-${Date.now()}.jpg`;
    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const formUserId = formData.get('userId') as string | null;
      if (formUserId) userId = formUserId;

      if (!file) {
        return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
      filename = file.name || `avatar-${Date.now()}`;
      mimeType = file.type || 'image/jpeg';
    } else {
      // JSON body (base64 data URL)
      const body = await req.json();
      if (body.userId) userId = body.userId;

      if (!body.image) {
        return NextResponse.json({ message: 'Image data is required' }, { status: 400 });
      }

      if (typeof body.image === 'string' && body.image.startsWith('data:')) {
        const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          fileBuffer = Buffer.from(matches[2], 'base64');
          filename = body.filename || `avatar-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
        } else {
          avatarUrl = body.image;
        }
      } else if (typeof body.image === 'string' && (body.image.startsWith('http://') || body.image.startsWith('https://'))) {
        avatarUrl = body.image;
      }
    }

    // Try Vercel Blob if token configured and we have buffer
    if (fileBuffer && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, fileBuffer, {
          access: 'public',
          contentType: mimeType,
        });
        avatarUrl = blob.url;
      } catch (blobErr: any) {
        console.warn('[Avatar Upload] Vercel Blob error, falling back to data URL:', blobErr?.message);
        avatarUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      }
    } else if (fileBuffer && !avatarUrl) {
      // Fallback: Store directly as data URL if Blob token is not configured yet
      avatarUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }

    if (!avatarUrl) {
      return NextResponse.json({ message: 'Failed to process avatar image' }, { status: 400 });
    }

    // Persist to user record in Postgres if userId is provided
    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { avatarUrl },
        });
      } catch (dbErr: any) {
        console.warn('[Avatar Upload] Could not update user avatar in DB:', dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      source: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'direct',
    });
  } catch (err: any) {
    console.error('[Avatar Upload API] Error:', err);
    return NextResponse.json(
      { message: err?.message || 'Avatar upload failed' },
      { status: 500 },
    );
  }
}
