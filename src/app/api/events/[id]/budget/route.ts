import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { ExpenseSchema } from '@/lib/validation/schemas';
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
    const parsed = ExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Create the expense and update category actualSpent in a transaction
    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          categoryId: data.categoryId,
          name: sanitizeText(data.name),
          estimatedCost: data.estimatedCost,
          actualCost: data.actualCost,
          paidAmount: data.paidAmount,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          paymentStatus: data.paymentStatus,
          notes: data.notes ? sanitizeText(data.notes) : null,
        },
      });

      // Recalculate actualSpent on the category
      const allExpenses = await tx.expense.findMany({
        where: { categoryId: data.categoryId },
      });
      const totalActual = allExpenses.reduce((sum, e) => sum + (e.actualCost || 0), 0);

      await tx.budgetCategory.update({
        where: { id: data.categoryId },
        data: { actualSpent: totalActual },
      });

      await tx.auditLog.create({
        data: {
          eventId,
          action: 'EXPENSE_LOGGED',
          performedBy: user.name,
          details: JSON.stringify({ name: newExpense.name, actualCost: newExpense.actualCost }),
        },
      });

      return newExpense;
    });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error) {
    console.error('Error logging expense:', error);
    return NextResponse.json({ success: false, error: 'Failed to record expense.' }, { status: 500 });
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
    const { categoryId, allocatedAmount, name, contingencyPercent } = body;

    if (categoryId && allocatedAmount !== undefined) {
      const updatedCategory = await prisma.budgetCategory.update({
        where: { id: categoryId },
        data: {
          allocatedAmount: Number(allocatedAmount),
          name: name ? sanitizeText(name) : undefined,
        },
      });
      return NextResponse.json({ success: true, category: updatedCategory });
    }

    if (contingencyPercent !== undefined) {
      const budget = await prisma.budget.findUnique({ where: { eventId } });
      if (budget) {
        const reserve = Math.round((budget.totalBudget * Number(contingencyPercent)) / 100);
        const updatedBudget = await prisma.budget.update({
          where: { eventId },
          data: {
            contingencyPercent: Number(contingencyPercent),
            contingencyReserve: reserve,
          },
        });
        return NextResponse.json({ success: true, budget: updatedBudget });
      }
    }

    return NextResponse.json({ success: false, error: 'No valid update parameters provided.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ success: false, error: 'Failed to update budget.' }, { status: 500 });
  }
}
