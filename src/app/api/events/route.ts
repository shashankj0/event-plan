import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { EventCreateSchema } from '@/lib/validation/schemas';
import { sanitizeText } from '@/lib/security/sanitize';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));

    // Fetch events owned by user or where user is an accepted collaborator
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { userId: user.id },
          { memberships: { some: { userId: user.id, status: 'ACCEPTED' } } },
        ],
      },
      include: {
        budget: {
          include: {
            categories: {
              select: { id: true, name: true, allocatedAmount: true, actualSpent: true },
            },
          },
        },
        tasks: {
          select: { id: true, status: true, priority: true, isCriticalPath: true, dueDate: true },
        },
        vendors: {
          select: { id: true, status: true, category: true },
        },
        guests: {
          select: { id: true, rsvp: { select: { status: true } } },
        },
        _count: {
          select: { tasks: true, guests: true, vendors: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve events.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const body = await req.json();

    const parsed = EventCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Use a transaction to create the event and its initial relations
    const newEvent = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          title: sanitizeText(data.title),
          description: sanitizeText(data.description),
          eventType: data.eventType,
          location: sanitizeText(data.location),
          venueName: data.venueName ? sanitizeText(data.venueName) : null,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          guestCount: data.guestCount,
          budgetTotal: data.budgetTotal,
          currency: data.currency,
          userId: user.id,
          coverImage:
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        },
      });

      // Create preferences
      await tx.eventPreference.create({
        data: {
          eventId: event.id,
          culturalTraditions: data.culturalTraditions ? sanitizeText(data.culturalTraditions) : null,
          dietaryRestrictions: data.dietaryRestrictions ? sanitizeText(data.dietaryRestrictions) : null,
          accessibilityNeeds: data.accessibilityNeeds ? sanitizeText(data.accessibilityNeeds) : null,
          sustainabilityGoals: data.sustainabilityGoals ? sanitizeText(data.sustainabilityGoals) : null,
          rainBackupPreference: data.rainBackupPreference ? sanitizeText(data.rainBackupPreference) : null,
        },
      });

      // Create initial budget with default categories
      const budget = await tx.budget.create({
        data: {
          eventId: event.id,
          totalBudget: data.budgetTotal,
          contingencyPercent: 10,
          contingencyReserve: Math.round(data.budgetTotal * 0.1),
          currency: data.currency,
        },
      });

      // Default budget categories based on standard allocations
      const defaultCategories = [
        { name: 'Venue & Lawns', pct: 0.35, icon: 'Building2', color: '#3B82F6' },
        { name: 'Catering & Beverages', pct: 0.30, icon: 'UtensilsCrossed', color: '#F97316' },
        { name: 'Decor & Florals', pct: 0.15, icon: 'Sparkles', color: '#EC4899' },
        { name: 'Photography & Media', pct: 0.10, icon: 'Camera', color: '#8B5CF6' },
        { name: 'Contingency Buffer', pct: 0.10, icon: 'ShieldAlert', color: '#64748B' },
      ];

      for (const cat of defaultCategories) {
        await tx.budgetCategory.create({
          data: {
            budgetId: budget.id,
            name: cat.name,
            allocatedAmount: Math.round(data.budgetTotal * cat.pct),
            actualSpent: 0,
            icon: cat.icon,
            color: cat.color,
          },
        });
      }

      // Log creation
      await tx.auditLog.create({
        data: {
          eventId: event.id,
          action: 'EVENT_CREATED',
          performedBy: user.name,
          details: JSON.stringify({ title: event.title, budgetTotal: event.budgetTotal }),
        },
      });

      return event;
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while creating event.' },
      { status: 500 }
    );
  }
}
