import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { sanitizeText } from '@/lib/security/sanitize';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const eventId = params.id;

    const auth = await verifyEventAccess(eventId, user.id, 'EDIT');
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const body = await req.json();
    const content = body.content;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Comment cannot be empty.' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        eventId,
        userId: user.id,
        authorName: user.name,
        authorRole: auth.role || 'CO_PLANNER',
        content: sanitizeText(content),
      },
    });

    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'COMMENT_POSTED',
        performedBy: user.name,
        details: JSON.stringify({ commentId: comment.id }),
      },
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ success: false, error: 'Failed to post comment.' }, { status: 500 });
  }
}
