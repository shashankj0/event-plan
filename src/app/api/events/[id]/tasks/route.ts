import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser, verifyEventAccess } from '@/lib/auth/session';
import { TaskSchema } from '@/lib/validation/schemas';
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
    const parsed = TaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const count = await prisma.task.count({ where: { eventId } });

    const newTask = await prisma.task.create({
      data: {
        eventId,
        title: sanitizeText(parsed.data.title),
        description: parsed.data.description ? sanitizeText(parsed.data.description) : null,
        category: parsed.data.category,
        priority: parsed.data.priority,
        status: parsed.data.status,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assignedTo: parsed.data.assignedTo ? sanitizeText(parsed.data.assignedTo) : null,
        isCriticalPath: parsed.data.isCriticalPath,
        order: count + 1,
      },
    });

    if (parsed.data.dependsOnTaskId) {
      await prisma.taskDependency.create({
        data: {
          taskId: newTask.id,
          dependsOnTaskId: parsed.data.dependsOnTaskId,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'TASK_CREATED',
        performedBy: user.name,
        details: JSON.stringify({ taskId: newTask.id, title: newTask.title }),
      },
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task.' }, { status: 500 });
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
    const taskId = body.taskId;
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId required' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = sanitizeText(body.title);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.assignedTo !== undefined) updateData.assignedTo = sanitizeText(body.assignedTo);
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.isCriticalPath !== undefined) updateData.isCriticalPath = Boolean(body.isCriticalPath);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        eventId,
        action: body.status === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
        performedBy: user.name,
        details: JSON.stringify({ taskId: task.id, title: task.title, status: task.status }),
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task.' }, { status: 500 });
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
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task.' }, { status: 500 });
  }
}
