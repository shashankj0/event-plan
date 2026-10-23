import { describe, it, expect } from 'vitest';
import { simulateScenario } from '@/lib/ai/scenarios';

describe('Scenario Simulator Engine', () => {
  const baseEvent = {
    title: 'Pune Royal Wedding',
    budgetTotal: 800000,
    guestCount: 250,
    currency: 'INR',
    budgetCategories: [
      { name: 'Venue & Lawns', allocatedAmount: 240000 },
      { name: 'Catering & Beverages', allocatedAmount: 220000 },
      { name: 'Decor, Mandap & Florals', allocatedAmount: 130000 },
      { name: 'Photography', allocatedAmount: 80000 },
      { name: 'Contingency Reserve', allocatedAmount: 55000 },
    ],
  };

  it('correctly simulates 20% budget reduction and protects core hospitality', () => {
    const result = simulateScenario('BUDGET_CUT_20', baseEvent);

    expect(result.scenarioType).toBe('BUDGET_CUT_20');
    expect(result.impactLevel).toBe('HIGH');

    // Total budget metric should show 20% decrease (640,000)
    const budgetMetric = result.metricsDiff.find((m) => m.label === 'Total Budget');
    expect(budgetMetric?.after).toContain('640,000');

    // Non-critical categories should bear higher reduction than venue & catering
    const decorMod = result.categoryModifications.find((c) => c.categoryName.includes('Decor'));
    const venueMod = result.categoryModifications.find((c) => c.categoryName.includes('Venue'));

    expect(decorMod).toBeDefined();
    expect(venueMod).toBeDefined();
    // Decor reduction rate should be higher than venue reduction
    const decorPct = Math.abs(decorMod!.delta) / decorMod!.originalAllocation;
    const venuePct = Math.abs(venueMod!.delta) / venueMod!.originalAllocation;
    expect(decorPct).toBeGreaterThan(venuePct);

    // Trade-offs should have actionable recommendations
    expect(result.tradeOffs.length).toBeGreaterThanOrEqual(3);
    expect(result.suggestedTasks.length).toBeGreaterThanOrEqual(2);
  });

  it('simulates 30-guest increase with table and catering calculations', () => {
    const result = simulateScenario('GUEST_INCREASE_30', baseEvent);

    expect(result.scenarioType).toBe('GUEST_INCREASE_30');
    const guestMetric = result.metricsDiff.find((m) => m.label === 'Guest Count');
    expect(guestMetric?.after).toBe(288); // 250 + max(30, 250*0.15 = 38) = 288

    const tableMetric = result.metricsDiff.find((m) => m.label === 'Seating Tables Needed');
    expect(tableMetric?.changeText).toContain('tables');
    expect(result.suggestedTasks.length).toBeGreaterThan(0);
  });

  it('simulates rain weather alert with indoor switch protocol', () => {
    const result = simulateScenario('RAIN_WEATHER_ALERT', baseEvent);

    expect(result.scenarioType).toBe('RAIN_WEATHER_ALERT');
    expect(result.impactLevel).toBe('HIGH');
    const stageMetric = result.metricsDiff.find((m) => m.label === 'Stage Setup');
    expect(stageMetric?.after).toContain('Indoor AC Banquet Hall');
    expect(result.suggestedTasks.some((t) => t.title.toLowerCase().includes('rain'))).toBe(true);
  });
});
