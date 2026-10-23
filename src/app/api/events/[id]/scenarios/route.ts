import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { simulateScenario } from '@/lib/ai/scenarios';

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
    const action = body.action || 'SIMULATE'; // 'SIMULATE' or 'APPLY'
    const scenarioType = body.scenarioType;

    if (!scenarioType) {
      return NextResponse.json({ success: false, error: 'scenarioType is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        budget: {
          include: {
            categories: true,
          },
        },
        tasks: true,
        vendors: true,
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    const simulation = simulateScenario(scenarioType, {
      title: event.title,
      budgetTotal: event.budgetTotal,
      guestCount: event.guestCount,
      currency: event.currency,
      budgetCategories: event.budget?.categories,
      tasks: event.tasks,
      vendors: event.vendors,
    });

    // If user clicked "Approve & Apply Changes"
    if (action === 'APPLY') {
      await prisma.$transaction(async (tx) => {
        // Apply category changes if any
        if (simulation.categoryModifications.length > 0 && event.budget) {
          for (const mod of simulation.categoryModifications) {
            const existingCat = event.budget.categories.find(
              (c) => c.name.toLowerCase() === mod.categoryName.toLowerCase()
            );
            if (existingCat) {
              await tx.budgetCategory.update({
                where: { id: existingCat.id },
                data: { allocatedAmount: mod.proposedAllocation },
              });
            }
          }

          // If budget cut, update overall event & budget total
          if (scenarioType === 'BUDGET_CUT_20') {
            const newTotal = Math.round(event.budgetTotal * 0.8);
            await tx.event.update({
              where: { id: eventId },
              data: { budgetTotal: newTotal },
            });
            await tx.budget.update({
              where: { eventId },
              data: { totalBudget: newTotal },
            });
          }
        }

        // If guest increase, update guestCount
        if (scenarioType === 'GUEST_INCREASE_30') {
          const added = Math.max(30, Math.round(event.guestCount * 0.15));
          await tx.event.update({
            where: { id: eventId },
            data: { guestCount: event.guestCount + added },
          });
        }

        // Add suggested emergency tasks
        for (let i = 0; i < simulation.suggestedTasks.length; i++) {
          const t = simulation.suggestedTasks[i];
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 3);

          await tx.task.create({
            data: {
              eventId,
              title: t.title,
              category: t.category,
              priority: t.priority,
              status: 'TODO',
              description: `[Scenario ${simulation.scenarioTitle}] ${t.actionReason}`,
              dueDate,
              order: event.tasks.length + i + 1,
            },
          });
        }

        // Log audit entry
        await tx.auditLog.create({
          data: {
            eventId,
            action: 'SCENARIO_APPLIED',
            performedBy: user.name,
            details: JSON.stringify({
              scenarioType,
              scenarioTitle: simulation.scenarioTitle,
              impactLevel: simulation.impactLevel,
            }),
          },
        });
      });

      return NextResponse.json({
        success: true,
        applied: true,
        message: `Successfully applied changes from "${simulation.scenarioTitle}".`,
        simulation,
      });
    }

    // Default: Return simulation diff for review
    return NextResponse.json({
      success: true,
      applied: false,
      simulation,
    });
  } catch (error) {
    console.error('Error in scenario simulator API:', error);
    return NextResponse.json({ success: false, error: 'Failed to process scenario simulation.' }, { status: 500 });
  }
}
