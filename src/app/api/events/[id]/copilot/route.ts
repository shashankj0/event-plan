import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { answerEventQuestion } from '@/lib/ai/copilot';
import { sanitizeText, detectPromptInjection } from '@/lib/security/sanitize';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const eventId = params.id;

    // IDOR authorization
    const auth = await verifyEventAccess(eventId, user.id, 'VIEW');
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const body = await req.json();
    const message = body.message;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message cannot be empty.' }, { status: 400 });
    }

    const injection = detectPromptInjection(message);
    if (injection.isSuspicious) {
      return NextResponse.json({ success: false, error: injection.reason }, { status: 403 });
    }

    // Fetch full active event context
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        preference: true,
        budget: {
          include: {
            categories: true,
          },
        },
        tasks: true,
        vendors: true,
        guests: {
          include: { rsvp: true },
        },
        risks: true,
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    // Pass strictly authorized event context into grounded answering engine
    const { reply, suggestedActions } = answerEventQuestion(sanitizeText(message), {
      id: event.id,
      title: event.title,
      eventType: event.eventType,
      location: event.location,
      venueName: event.venueName,
      startDate: event.startDate,
      guestCount: event.guestCount,
      budgetTotal: event.budgetTotal,
      currency: event.currency,
      budgetCategories: event.budget?.categories || [],
      tasks: event.tasks,
      vendors: event.vendors,
      guests: event.guests,
      risks: event.risks,
      preference: event.preference,
    });

    // Save message to database conversation
    let conversation = await prisma.aIConversation.findFirst({
      where: { eventId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          eventId,
          title: 'Planning Assistant Session',
        },
      });
    }

    // Record user message & assistant response
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: sanitizeText(message),
      },
    });

    const assistantMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
        metadataJson: JSON.stringify({ suggestedActions }),
      },
    });

    return NextResponse.json({
      success: true,
      reply,
      suggestedActions,
      messageId: assistantMsg.id,
    });
  } catch (error) {
    console.error('Error in Copilot API:', error);
    return NextResponse.json({ success: false, error: 'Copilot query failed.' }, { status: 500 });
  }
}
