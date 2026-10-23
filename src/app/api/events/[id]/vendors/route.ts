import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { VendorSchema } from '@/lib/validation/schemas';
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
    const parsed = VendorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const vendor = await prisma.vendor.create({
      data: {
        eventId,
        name: sanitizeText(data.name),
        category: sanitizeText(data.category),
        contactName: data.contactName ? sanitizeText(data.contactName) : null,
        email: data.email ? sanitizeText(data.email) : null,
        phone: data.phone ? sanitizeText(data.phone) : null,
        website: data.website ? sanitizeText(data.website) : null,
        address: data.address ? sanitizeText(data.address) : null,
        rating: data.rating,
        status: data.status,
        notes: data.notes ? sanitizeText(data.notes) : null,
      },
    });

    if (body.quoteAmount) {
      await prisma.vendorQuote.create({
        data: {
          vendorId: vendor.id,
          amount: Number(body.quoteAmount),
          inclusions: body.quoteInclusions ? sanitizeText(body.quoteInclusions) : 'Standard deliverable package',
          status: 'RECEIVED',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'VENDOR_ADDED',
        performedBy: user.name,
        details: JSON.stringify({ vendorId: vendor.id, name: vendor.name, category: vendor.category }),
      },
    });

    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error) {
    console.error('Error adding vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to add vendor.' }, { status: 500 });
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
    const vendorId = body.vendorId;
    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'vendorId is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);
    if (body.rating !== undefined) updateData.rating = Number(body.rating);

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: updateData,
      include: { quotes: true, bookings: true },
    });

    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'VENDOR_UPDATED',
        performedBy: user.name,
        details: JSON.stringify({ vendorId: updatedVendor.id, status: updatedVendor.status }),
      },
    });

    return NextResponse.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ success: false, error: 'Failed to update vendor.' }, { status: 500 });
  }
}
