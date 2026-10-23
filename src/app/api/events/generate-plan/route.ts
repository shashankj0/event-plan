import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { generateEventPlan } from '@/lib/ai/engine';
import { sanitizeText, detectPromptInjection } from '@/lib/security/sanitize';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers.get('x-user-id'));
    const body = await req.json();

    const rawPrompt = body.prompt;
    if (!rawPrompt || typeof rawPrompt !== 'string' || rawPrompt.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide a descriptive prompt for your event.' },
        { status: 400 }
      );
    }

    const injectionCheck = detectPromptInjection(rawPrompt);
    if (injectionCheck.isSuspicious) {
      return NextResponse.json(
        { success: false, error: injectionCheck.reason },
        { status: 403 }
      );
    }

    const autoPersist = Boolean(body.autoPersist);

    // Generate comprehensive structured plan
    const plan = await generateEventPlan(rawPrompt);

    // Derive smart follow-up questions for anything underspecified
    const followUpQuestions: string[] = [];
    if (!rawPrompt.toLowerCase().includes('date') && !rawPrompt.toLowerCase().includes('month')) {
      followUpQuestions.push('Do you have a specific target month or auspicious date in mind?');
    }
    if (!rawPrompt.toLowerCase().includes('alcohol') && !rawPrompt.toLowerCase().includes('bar')) {
      followUpQuestions.push('Would you like a licensed cocktail/mocktail bar or non-alcoholic beverage counters?');
    }
    if (!rawPrompt.toLowerCase().includes('transport') && !rawPrompt.toLowerCase().includes('shuttle')) {
      followUpQuestions.push('Will out-of-town guests require group transit shuttles from the airport/station?');
    }

    // If autoPersist is true, persist into database immediately
    if (autoPersist) {
      const createdEvent = await prisma.$transaction(async (tx) => {
        const event = await tx.event.create({
          data: {
            title: plan.title,
            description: plan.description,
            eventType: plan.eventType,
            location: plan.location,
            venueName: plan.venueName,
            startDate: new Date(plan.startDate),
            guestCount: plan.guestCount,
            budgetTotal: plan.budgetTotal,
            currency: plan.currency,
            userId: user.id,
            coverImage:
              'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          },
        });

        // Preferences
        await tx.eventPreference.create({
          data: {
            eventId: event.id,
            culturalTraditions: plan.culturalTraditions,
            dietaryRestrictions: plan.dietaryRestrictions,
            accessibilityNeeds: plan.accessibilityNeeds,
            sustainabilityGoals: plan.sustainabilityGoals,
            rainBackupPreference: plan.rainBackupPreference,
            themeKeywords: plan.theme.name,
            vibeStyle: plan.theme.decorVibe,
          },
        });

        // Budget
        const budget = await tx.budget.create({
          data: {
            eventId: event.id,
            totalBudget: plan.budgetTotal,
            contingencyPercent: 10,
            contingencyReserve: Math.round(plan.budgetTotal * 0.1),
            currency: plan.currency,
          },
        });

        // Categories
        for (const cat of plan.budgetCategories) {
          await tx.budgetCategory.create({
            data: {
              budgetId: budget.id,
              name: cat.name,
              allocatedAmount: cat.allocatedAmount,
              actualSpent: 0,
              icon: cat.icon,
              notes: cat.notes,
            },
          });
        }

        // Tasks
        for (let i = 0; i < plan.tasks.length; i++) {
          const t = plan.tasks[i];
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (60 + t.dueDateOffsetDays));

          await tx.task.create({
            data: {
              eventId: event.id,
              title: t.title,
              category: t.category,
              priority: t.priority,
              isCriticalPath: t.isCriticalPath,
              description: t.description,
              dueDate,
              order: i + 1,
            },
          });
        }

        // Timeline items
        for (let i = 0; i < plan.timeline.length; i++) {
          const item = plan.timeline[i];
          await tx.timelineItem.create({
            data: {
              eventId: event.id,
              timeSlot: item.timeSlot,
              title: item.title,
              stage: item.stage,
              description: item.description,
              isMilestone: item.isMilestone,
              order: i + 1,
            },
          });
        }

        // Vendors
        for (const v of plan.vendors) {
          const vendor = await tx.vendor.create({
            data: {
              eventId: event.id,
              name: v.name,
              category: v.category,
              rating: v.rating,
              notes: v.notes,
              status: 'DISCOVERED',
            },
          });

          await tx.vendorQuote.create({
            data: {
              vendorId: vendor.id,
              amount: v.estimatedQuote,
              currency: plan.currency,
              inclusions: `Estimated quote for ${v.name} covering event deliverables.`,
              status: 'RECEIVED',
            },
          });
        }

        // Risks
        for (const r of plan.risks) {
          const risk = await tx.risk.create({
            data: {
              eventId: event.id,
              riskType: r.riskType,
              severity: r.severity,
              likelihood: r.likelihood,
              description: r.description,
              impact: 'Potential operational disruption.',
            },
          });

          await tx.contingencyPlan.create({
            data: {
              riskId: risk.id,
              title: `${r.riskType} Mitigation Protocol`,
              triggerCondition: 'Weather or logistical threshold breached.',
              actionSteps: r.contingencyPlan,
            },
          });
        }

        // Default Seating tables
        const tableCount = Math.max(3, Math.ceil(plan.guestCount / 8));
        for (let t = 1; t <= Math.min(tableCount, 8); t++) {
          await tx.seatingTable.create({
            data: {
              eventId: event.id,
              tableName: `Table ${t} (Zone ${t <= 2 ? 'VIP' : 'Main'})`,
              tableNumber: t,
              capacity: 8,
              shape: 'ROUND',
              zone: t <= 2 ? 'VIP' : 'MAIN_HALL',
            },
          });
        }

        // Invitation draft
        await tx.invitation.create({
          data: {
            eventId: event.id,
            templateName: plan.theme.name,
            heading: plan.creativeIdeas.invitationHeadline,
            messageContent: plan.creativeIdeas.invitationBody,
            designStyle: 'EDITORIAL_ROYAL',
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            eventId: event.id,
            action: 'EVENT_GENERATED_BY_AI',
            performedBy: user.name,
            details: JSON.stringify({ prompt: rawPrompt.substring(0, 150) }),
          },
        });

        return event;
      });

      return NextResponse.json({
        success: true,
        persisted: true,
        eventId: createdEvent.id,
        plan,
        followUpQuestions,
      });
    }

    return NextResponse.json({
      success: true,
      persisted: false,
      plan,
      followUpQuestions,
    });
  } catch (error: any) {
    console.error('Error generating event plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate event plan.' },
      { status: 500 }
    );
  }
}
