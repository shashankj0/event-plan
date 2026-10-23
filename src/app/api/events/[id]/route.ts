import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { sanitizeText } from '@/lib/security/sanitize';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const eventId = params.id;

    // IDOR & Authorization check
    const auth = await verifyEventAccess(eventId, user.id, 'VIEW');
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        preference: true,
        budget: {
          include: {
            categories: {
              include: {
                expenses: true,
              },
            },
          },
        },
        tasks: {
          include: {
            dependencies: true,
          },
          orderBy: { order: 'asc' },
        },
        timelineItems: {
          orderBy: { order: 'asc' },
        },
        vendors: {
          include: {
            quotes: true,
            bookings: true,
          },
        },
        guests: {
          include: {
            rsvp: true,
            table: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        seatingTables: {
          include: {
            guests: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { tableNumber: 'asc' },
        },
        invitations: true,
        checklists: true,
        risks: {
          include: {
            contingencyPlans: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        memberships: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event,
      userRole: auth.role,
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching event.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = sanitizeText(body.title);
    if (body.description !== undefined) updateData.description = sanitizeText(body.description);
    if (body.location !== undefined) updateData.location = sanitizeText(body.location);
    if (body.venueName !== undefined) updateData.venueName = sanitizeText(body.venueName);
    if (body.guestCount !== undefined) updateData.guestCount = Number(body.guestCount);
    if (body.budgetTotal !== undefined) updateData.budgetTotal = Number(body.budgetTotal);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'EVENT_UPDATED',
        performedBy: user.name,
        details: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event details.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const eventId = params.id;

    const auth = await verifyEventAccess(eventId, user.id, 'ADMIN');
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true, message: 'Event successfully removed.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event.' },
      { status: 500 }
    );
  }
}
