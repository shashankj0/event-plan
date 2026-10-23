import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { GuestSchema } from '@/lib/validation/schemas';
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

    // Check if it's a batch CSV import
    if (Array.isArray(body.guests)) {
      const existingGuests = await prisma.guest.findMany({
        where: { eventId },
        select: { firstName: true, lastName: true, email: true, phone: true },
      });

      const addedGuests = [];
      const duplicateCount = { count: 0 };

      for (const row of body.guests) {
        if (!row.firstName || !row.lastName) continue;

        const cleanFirst = sanitizeText(row.firstName);
        const cleanLast = sanitizeText(row.lastName);
        const cleanEmail = row.email ? sanitizeText(row.email).toLowerCase() : null;
        const cleanPhone = row.phone ? sanitizeText(row.phone) : null;

        // Check for duplicates
        const isDuplicate = existingGuests.some((g) => {
          if (cleanEmail && g.email && g.email.toLowerCase() === cleanEmail) return true;
          if (cleanPhone && g.phone && g.phone === cleanPhone) return true;
          if (g.firstName.toLowerCase() === cleanFirst.toLowerCase() && g.lastName.toLowerCase() === cleanLast.toLowerCase()) return true;
          return false;
        });

        if (isDuplicate) {
          duplicateCount.count++;
          continue;
        }

        const guest = await prisma.guest.create({
          data: {
            eventId,
            firstName: cleanFirst,
            lastName: cleanLast,
            email: cleanEmail,
            phone: cleanPhone,
            household: row.household ? sanitizeText(row.household) : null,
            dietary: row.dietary ? sanitizeText(row.dietary) : null,
            accessibility: row.accessibility ? sanitizeText(row.accessibility) : null,
            plusOneAllowed: Boolean(row.plusOneAllowed),
            rsvp: {
              create: {
                status: 'PENDING',
                confirmedCount: 1,
              },
            },
          },
        });
        addedGuests.push(guest);
        existingGuests.push({ firstName: cleanFirst, lastName: cleanLast, email: cleanEmail, phone: cleanPhone });
      }

      await prisma.auditLog.create({
        data: {
          eventId,
          action: 'GUESTS_IMPORTED_CSV',
          performedBy: user.name,
          details: JSON.stringify({ added: addedGuests.length, skippedDuplicates: duplicateCount.count }),
        },
      });

      return NextResponse.json({
        success: true,
        addedCount: addedGuests.length,
        skippedDuplicates: duplicateCount.count,
        guests: addedGuests,
      });
    }

    // Single guest creation
    const parsed = GuestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check duplicate
    const existing = await prisma.guest.findFirst({
      where: {
        eventId,
        OR: [
          {
            firstName: { equals: data.firstName },
            lastName: { equals: data.lastName },
          },
          ...(data.email ? [{ email: { equals: data.email } }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Guest "${data.firstName} ${data.lastName}" is already registered on this guest list.` },
        { status: 409 }
      );
    }

    const newGuest = await prisma.guest.create({
      data: {
        eventId,
        firstName: sanitizeText(data.firstName),
        lastName: sanitizeText(data.lastName),
        email: data.email ? sanitizeText(data.email) : null,
        phone: data.phone ? sanitizeText(data.phone) : null,
        household: data.household ? sanitizeText(data.household) : null,
        dietary: data.dietary ? sanitizeText(data.dietary) : null,
        accessibility: data.accessibility ? sanitizeText(data.accessibility) : null,
        plusOneAllowed: data.plusOneAllowed,
        notes: data.notes ? sanitizeText(data.notes) : null,
        tableId: data.tableId || null,
        rsvp: {
          create: {
            status: 'PENDING',
            confirmedCount: 1,
          },
        },
      },
      include: {
        rsvp: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'GUEST_ADDED',
        performedBy: user.name,
        details: JSON.stringify({ guestId: newGuest.id, name: `${newGuest.firstName} ${newGuest.lastName}` }),
      },
    });

    return NextResponse.json({ success: true, guest: newGuest }, { status: 201 });
  } catch (error) {
    console.error('Error in guests API:', error);
    return NextResponse.json({ success: false, error: 'Failed to process guest operation.' }, { status: 500 });
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
    const guestId = body.guestId;
    if (!guestId) {
      return NextResponse.json({ success: false, error: 'guestId required' }, { status: 400 });
    }

    // Update guest data
    const guestData: any = {};
    if (body.tableId !== undefined) guestData.tableId = body.tableId || null;
    if (body.invitationSent !== undefined) guestData.invitationSent = Boolean(body.invitationSent);
    if (body.dietary !== undefined) guestData.dietary = sanitizeText(body.dietary);
    if (body.accessibility !== undefined) guestData.accessibility = sanitizeText(body.accessibility);

    if (Object.keys(guestData).length > 0) {
      await prisma.guest.update({
        where: { id: guestId },
        data: guestData,
      });
    }

    // Update RSVP if provided
    if (body.rsvpStatus !== undefined) {
      await prisma.rsvp.upsert({
        where: { guestId },
        update: {
          status: body.rsvpStatus,
          confirmedCount: body.confirmedCount ? Number(body.confirmedCount) : 1,
          mealChoice: body.mealChoice ? sanitizeText(body.mealChoice) : undefined,
          respondedAt: new Date(),
        },
        create: {
          guestId,
          status: body.rsvpStatus,
          confirmedCount: body.confirmedCount ? Number(body.confirmedCount) : 1,
          mealChoice: body.mealChoice ? sanitizeText(body.mealChoice) : undefined,
          respondedAt: new Date(),
        },
      });
    }

    const updatedGuest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { rsvp: true, table: true },
    });

    return NextResponse.json({ success: true, guest: updatedGuest });
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json({ success: false, error: 'Failed to update guest.' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    if (!guestId) {
      return NextResponse.json({ success: false, error: 'guestId required' }, { status: 400 });
    }

    await prisma.guest.delete({ where: { id: guestId } });

    return NextResponse.json({ success: true, message: 'Guest removed.' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete guest.' }, { status: 500 });
  }
}
