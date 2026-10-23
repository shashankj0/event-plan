import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const eventId = params.id;

    const auth = await verifyEventAccess(eventId, user.id, 'VIEW');
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'run-of-show';

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        timelineItems: { orderBy: { order: 'asc' } },
        vendors: true,
        guests: { include: { rsvp: true, table: true } },
        budget: { include: { categories: { include: { expenses: true } } } },
        risks: { include: { contingencyPlans: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    if (format === 'guests-csv') {
      const header = 'First Name,Last Name,Email,Phone,Household,RSVP Status,Confirmed Count,Dietary,Accessibility,Table\n';
      const rows = event.guests.map((g) => {
        const rsvp = g.rsvp?.status || 'PENDING';
        const count = g.rsvp?.confirmedCount || 1;
        const table = g.table ? `Table ${g.table.tableNumber} - ${g.table.tableName}` : 'Unassigned';
        return `"${g.firstName}","${g.lastName}","${g.email || ''}","${g.phone || ''}","${g.household || ''}","${rsvp}",${count},"${g.dietary || ''}","${g.accessibility || ''}","${table}"`;
      });

      const csvContent = header + rows.join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_Guests.csv"`,
        },
      });
    }

    // Default JSON export bundle for print run-of-show or PDF rendering
    const emergencyContacts = event.vendors.map((v) => ({
      name: v.name,
      role: v.category,
      contact: v.contactName || 'Primary Lead',
      phone: v.phone || 'N/A',
      email: v.email || 'N/A',
    }));

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        date: event.startDate,
        location: event.location,
        venue: event.venueName,
        guestCount: event.guestCount,
        budgetTotal: event.budgetTotal,
        currency: event.currency,
      },
      timeline: event.timelineItems,
      emergencyContacts,
      risks: event.risks,
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json({ success: false, error: 'Export failed.' }, { status: 500 });
  }
}
