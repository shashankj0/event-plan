import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'user_ananya_01',
    email: 'ananya@eventverse.ai',
    name: 'Ananya Sharma',
    role: 'ORGANIZER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'user_rohan_02',
    email: 'rohan.patil@eventverse.ai',
    name: 'Rohan Patil',
    role: 'CO_PLANNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'user_priya_03',
    email: 'priya.guest@gmail.com',
    name: 'Priya Deshmukh',
    role: 'VIEWER',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
  },
];

export async function getCurrentUser(userIdHeader?: string | null): Promise<AuthUser> {
  const selectedId = userIdHeader || DEMO_USERS[0].id;
  const foundUser = DEMO_USERS.find((u) => u.id === selectedId) || DEMO_USERS[0];

  // Ensure user exists in database
  const dbUser = await prisma.user.upsert({
    where: { email: foundUser.email },
    update: { name: foundUser.name, role: foundUser.role, avatar: foundUser.avatar },
    create: {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      avatar: foundUser.avatar,
    },
  });

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    avatar: dbUser.avatar,
  };
}

/**
 * Enforces event-level authorization to prevent IDOR vulnerabilities.
 * Checks if user is event owner or has active membership.
 */
export async function verifyEventAccess(
  eventId: string,
  userId: string,
  requiredRole: 'VIEW' | 'EDIT' | 'ADMIN' = 'VIEW'
): Promise<{ authorized: boolean; role?: string; error?: string }> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      userId: true,
      memberships: {
        where: { userId },
        select: { role: true, status: true },
      },
    },
  });

  if (!event) {
    return { authorized: false, error: 'Event not found.' };
  }

  // Event owner has full ADMIN privileges
  if (event.userId === userId) {
    return { authorized: true, role: 'OWNER' };
  }

  // Check co-planner membership
  const membership = event.memberships[0];
  if (!membership || membership.status !== 'ACCEPTED') {
    return { authorized: false, error: 'You do not have permission to access this event workspace.' };
  }

  if (requiredRole === 'ADMIN' && membership.role !== 'OWNER') {
    return { authorized: false, error: 'Administrator access required.' };
  }

  if (requiredRole === 'EDIT' && (membership.role === 'VIEWER' || membership.role === 'GUEST')) {
    return { authorized: false, error: 'Write permission required for this modification.' };
  }

  return { authorized: true, role: membership.role };
}
