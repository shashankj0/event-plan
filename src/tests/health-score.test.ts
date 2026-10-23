import { describe, it, expect } from 'vitest';
import { calculateEventHealth } from '@/lib/ai/health';

describe('Event Health Score & Readiness Analytics', () => {
  it('computes explainable readiness breakdown across 5 dimensions', () => {
    const health = calculateEventHealth({
      budgetTotal: 800000,
      guestCount: 250,
      budgetCategories: [
        { allocatedAmount: 400000, actualSpent: 150000 },
        { allocatedAmount: 400000, actualSpent: 100000 },
      ],
      tasks: [
        { status: 'COMPLETED', priority: 'URGENT', isCriticalPath: true },
        { status: 'COMPLETED', priority: 'HIGH', isCriticalPath: true },
        { status: 'IN_PROGRESS', priority: 'MEDIUM', isCriticalPath: false },
        { status: 'TODO', priority: 'LOW', isCriticalPath: false },
      ],
      vendors: [
        { status: 'BOOKED' },
        { status: 'BOOKED' },
        { status: 'QUOTED' },
      ],
      guests: [
        { rsvp: { status: 'ACCEPTED' } },
        { rsvp: { status: 'ACCEPTED' } },
        { rsvp: { status: 'DECLINED' } },
        { rsvp: { status: 'PENDING' } },
      ],
      risks: [
        { severity: 'HIGH', contingencyPlans: [{ id: 'plan-1' }] },
      ],
    });

    expect(health.overallScore).toBeGreaterThanOrEqual(70);
    expect(health.breakdown.length).toBe(5);
    expect(health.breakdown.map((b) => b.factor)).toEqual(
      expect.arrayContaining([
        'Task Milestones & Critical Path',
        'Budget Discipline & Spend Variance',
        'Vendor Contracting & Quotations',
        'Guest Confirmation & RSVP Velocity',
        'Contingency & Risk Preparedness',
      ])
    );

    expect(health.analytics.costPerGuest).toBe(3200);
    expect(health.sustainabilityScore.score).toBeGreaterThan(70);
  });

  it('penalizes health score if there are overdue/blocked tasks and budget overspend', () => {
    const unhealthy = calculateEventHealth({
      budgetTotal: 500000,
      guestCount: 100,
      budgetCategories: [
        { allocatedAmount: 500000, actualSpent: 620000 }, // 124% overspend
      ],
      tasks: [
        { status: 'BLOCKED', priority: 'URGENT', isCriticalPath: true },
        { status: 'TODO', priority: 'HIGH', isCriticalPath: true, dueDate: '2020-01-01' }, // Overdue
      ],
      vendors: [{ status: 'DISCOVERED' }],
      guests: [{ rsvp: { status: 'PENDING' } }],
      risks: [{ severity: 'HIGH', contingencyPlans: [] }], // Unmitigated risk
    });

    expect(unhealthy.overallScore).toBeLessThan(55);
    expect(unhealthy.criticalAlerts.length).toBeGreaterThanOrEqual(2);
    expect(unhealthy.actionableRecommendations.some((r) => r.priority === 'HIGH')).toBe(true);
  });
});
