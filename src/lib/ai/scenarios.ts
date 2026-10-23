/**
 * Scenario Simulator Engine for EventVerse AI
 * Evaluates what-if contingencies and computes comparative diffs with approval workflows.
 */

export interface ScenarioSimulationResult {
  scenarioType: string;
  scenarioTitle: string;
  scenarioDescription: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string[];
  tradeOffs: string[];
  metricsDiff: {
    label: string;
    before: string | number;
    after: string | number;
    changeText: string;
    isPositive?: boolean;
  }[];
  categoryModifications: {
    categoryName: string;
    originalAllocation: number;
    proposedAllocation: number;
    delta: number;
    rationale: string;
  }[];
  suggestedTasks: {
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category: string;
    dueDateOffsetDays: number;
    actionReason: string;
  }[];
  contingencyActions: string[];
}

export function simulateScenario(
  scenarioType: string,
  event: {
    title: string;
    budgetTotal: number;
    guestCount: number;
    currency: string;
    budgetCategories?: { name: string; allocatedAmount: number }[];
    tasks?: { title: string; priority: string; status: string }[];
    vendors?: { name: string; category: string }[];
  }
): ScenarioSimulationResult {
  const currencySymbol = event.currency === 'INR' ? '₹' : event.currency === 'USD' ? '$' : '€';
  const currentBudget = event.budgetTotal;
  const currentGuests = event.guestCount;

  switch (scenarioType) {
    case 'BUDGET_CUT_20': {
      const newBudget = Math.round(currentBudget * 0.8);
      const cutAmount = currentBudget - newBudget;
      const categories = event.budgetCategories || [];

      // Proportionally reduce non-critical categories first (Decor, Entertainment, Misc) while protecting core (Catering, Venue)
      const categoryModifications = categories.map((cat) => {
        let reductionRate = 0.2;
        if (cat.name.toLowerCase().includes('decor') || cat.name.toLowerCase().includes('entertainment')) {
          reductionRate = 0.28;
        } else if (cat.name.toLowerCase().includes('venue') || cat.name.toLowerCase().includes('catering')) {
          reductionRate = 0.14;
        }
        const proposed = Math.round(cat.allocatedAmount * (1 - reductionRate));
        return {
          categoryName: cat.name,
          originalAllocation: cat.allocatedAmount,
          proposedAllocation: proposed,
          delta: proposed - cat.allocatedAmount,
          rationale:
            reductionRate > 0.2
              ? 'Trimmed aesthetic embellishments and non-essential production.'
              : 'Safeguarded core hospitality while negotiating vendor bulk rates.',
        };
      });

      return {
        scenarioType,
        scenarioTitle: '20% Budget Reduction Simulation',
        scenarioDescription: `Simulating a reduction of ${currencySymbol}${cutAmount.toLocaleString()} to meet tightened financial constraints without compromising hospitality.`,
        impactLevel: 'HIGH',
        summary: [
          `Overall budget reduces from ${currencySymbol}${currentBudget.toLocaleString()} to ${currencySymbol}${newBudget.toLocaleString()}.`,
          'Venue and catering allocations protected with minimal 14% adjustments.',
          'Decor and entertainment categories absorb a 28% optimization.',
          'Emergency contingency buffer preserved at 5% of new total.',
        ],
        tradeOffs: [
          'Switch from imported exotic flowers to vibrant local marigolds and seasonal blooms (-₹25,000).',
          'Opt for digital-first invitations with premium RSVP portal instead of heavy printed stationery (-₹12,000).',
          'Consolidate 3 videographers into a 2-person hybrid cinematography team (-₹20,000).',
          'Streamline dessert counter to 2 signature desserts plus artisanal ice cream (-₹15,000).',
        ],
        metricsDiff: [
          {
            label: 'Total Budget',
            before: `${currencySymbol}${currentBudget.toLocaleString()}`,
            after: `${currencySymbol}${newBudget.toLocaleString()}`,
            changeText: `-20% (-${currencySymbol}${cutAmount.toLocaleString()})`,
            isPositive: false,
          },
          {
            label: 'Cost Per Guest',
            before: `${currencySymbol}${Math.round(currentBudget / currentGuests).toLocaleString()}`,
            after: `${currencySymbol}${Math.round(newBudget / currentGuests).toLocaleString()}`,
            changeText: `Down by ${currencySymbol}${Math.round((currentBudget - newBudget) / currentGuests).toLocaleString()}/guest`,
            isPositive: true,
          },
        ],
        categoryModifications,
        suggestedTasks: [
          {
            title: 'Renegotiate Floral & Mandap Scope with Decorator',
            priority: 'URGENT',
            category: 'DECOR',
            dueDateOffsetDays: -20,
            actionReason: 'Substitute expensive exotic imports with local brass diyas and seasonal flora.',
          },
          {
            title: 'Issue Revised Category Spending Caps to Co-Planners',
            priority: 'HIGH',
            category: 'BUDGET',
            dueDateOffsetDays: -25,
            actionReason: 'Prevent commitments exceeding updated category boundaries.',
          },
        ],
        contingencyActions: [
          'Notify finance manager to update disbursement schedules.',
          'Review quotes in vendor inbox to lock revised scope contracts.',
        ],
      };
    }

    case 'GUEST_INCREASE_30': {
      const additionalGuests = Math.max(30, Math.round(currentGuests * 0.15));
      const newGuestCount = currentGuests + additionalGuests;
      const cateringIncrease = additionalGuests * Math.round((currentBudget * 0.3) / currentGuests);

      return {
        scenarioType,
        scenarioTitle: `Surge in Attendance (+${additionalGuests} Guests)`,
        scenarioDescription: `Evaluating capacity, seating, and food requirements for an attendance increase from ${currentGuests} to ${newGuestCount} guests.`,
        impactLevel: 'MEDIUM',
        summary: [
          `Guest count expands by +${additionalGuests} (total ${newGuestCount} attendees).`,
          `Estimated catering & beverage expansion: +${currencySymbol}${cateringIncrease.toLocaleString()}.`,
          `Requires ${Math.ceil(additionalGuests / 8)} additional 8-seater dining tables.`,
          'Venue fire capacity clearance remains verified within safety margins.',
        ],
        tradeOffs: [
          'Allocate ₹35,000 from the Contingency Reserve to fund extra plates without asking for sponsor/client top-ups.',
          'Reconfigure floor plan from standard round tables to high-efficiency banquet rows in the south wing.',
        ],
        metricsDiff: [
          {
            label: 'Guest Count',
            before: currentGuests,
            after: newGuestCount,
            changeText: `+${additionalGuests} guests (+${Math.round((additionalGuests / currentGuests) * 100)}%)`,
            isPositive: true,
          },
          {
            label: 'Seating Tables Needed',
            before: `${Math.ceil(currentGuests / 8)} tables`,
            after: `${Math.ceil(newGuestCount / 8)} tables`,
            changeText: `+${Math.ceil(additionalGuests / 8)} tables`,
            isPositive: false,
          },
          {
            label: 'Estimated Catering Cost',
            before: `${currencySymbol}${Math.round(currentBudget * 0.3).toLocaleString()}`,
            after: `${currencySymbol}${(Math.round(currentBudget * 0.3) + cateringIncrease).toLocaleString()}`,
            changeText: `+${currencySymbol}${cateringIncrease.toLocaleString()}`,
            isPositive: false,
          },
        ],
        categoryModifications: [
          {
            categoryName: 'Catering & Beverages',
            originalAllocation: Math.round(currentBudget * 0.3),
            proposedAllocation: Math.round(currentBudget * 0.3) + cateringIncrease,
            delta: cateringIncrease,
            rationale: `Added +${additionalGuests} plate guarantee to caterer.`,
          },
          {
            categoryName: 'Contingency & Emergency Reserve',
            originalAllocation: Math.round(currentBudget * 0.08),
            proposedAllocation: Math.max(0, Math.round(currentBudget * 0.08) - cateringIncrease),
            delta: -cateringIncrease,
            rationale: 'Absorbed catering surge from unallocated contingency buffer.',
          },
        ],
        suggestedTasks: [
          {
            title: `Notify Caterer of Final Headcount Revision (${newGuestCount} pax)`,
            priority: 'URGENT',
            category: 'CATERING',
            dueDateOffsetDays: -10,
            actionReason: 'Lock ingredient procurement 10 days prior to event.',
          },
          {
            title: `Add ${Math.ceil(additionalGuests / 8)} Tables to Venue Floor Layout`,
            priority: 'HIGH',
            category: 'VENUE',
            dueDateOffsetDays: -7,
            actionReason: 'Ensure clear aisle pathways for wheelchair accessibility.',
          },
        ],
        contingencyActions: [
          'Print 35 additional welcome brochures and placecards.',
          'Instruct parking attendants to activate overflow lawn parking.',
        ],
      };
    }

    case 'RAIN_WEATHER_ALERT': {
      return {
        scenarioType,
        scenarioTitle: 'Monsoon / Heavy Rain Contingency Protocol',
        scenarioDescription: 'Comprehensive activation of the indoor banquet fallback and weatherproof covered pathways.',
        impactLevel: 'HIGH',
        summary: [
          'Activates dual-contract rain clause to switch main ceremonial stage to the indoor air-conditioned hall.',
          'Deploys covered waterproof marquee tunnels between parking and main entrance.',
          'Audio equipment elevated onto wooden risers with waterproof surge covers.',
        ],
        tradeOffs: [
          'Outdoor lawn photo booth shifted into the grand foyer with heritage arch lighting.',
          'Slightly reduced open-lawn fireworks replaced with cold-pyro indoor spark fountains.',
        ],
        metricsDiff: [
          {
            label: 'Stage Setup',
            before: 'Outdoor Open Lawn',
            after: 'Indoor AC Banquet Hall',
            changeText: 'Zero rain risk',
            isPositive: true,
          },
          {
            label: 'Weather Readiness',
            before: '45% (Unsheltered)',
            after: '100% (Fully Weatherproof)',
            changeText: '+55% safety score',
            isPositive: true,
          },
        ],
        categoryModifications: [],
        suggestedTasks: [
          {
            title: 'Trigger 48-Hour Rain Switch Protocol with Venue Manager',
            priority: 'URGENT',
            category: 'VENUE',
            dueDateOffsetDays: -2,
            actionReason: 'Begin AC banquet pre-cooling and indoor sound check.',
          },
          {
            title: 'Install Covered Marquee Walkway & Non-Slip Mats',
            priority: 'HIGH',
            category: 'LOGISTICS',
            dueDateOffsetDays: -1,
            actionReason: 'Protect guest footwear and attire from rain puddles.',
          },
          {
            title: 'Inspect Sound System RCD Breakers and Waterproof Enclosures',
            priority: 'URGENT',
            category: 'LOGISTICS',
            dueDateOffsetDays: -1,
            actionReason: 'Prevent electrical shorts or power tripping.',
          },
        ],
        contingencyActions: [
          'Station 4 umbrella escorts at valet drop-off.',
          'Send automated SMS/WhatsApp weather advisory update to all confirmed guests.',
        ],
      };
    }

    case 'VENDOR_CANCELLATION': {
      return {
        scenarioType,
        scenarioTitle: 'Critical Vendor Cancellation & Replacement',
        scenarioDescription: 'Simulates sudden cancellation by primary decorator or caterer and deploys vetted backup providers.',
        impactLevel: 'CRITICAL',
        summary: [
          'Instant retrieval of shortlisted secondary vendor profiles from EventVerse discovery database.',
          'Automated generation of emergency quotation request with exact scope specifications.',
          'Preserves all previously agreed design aesthetic guidelines and dietary constraints.',
        ],
        tradeOffs: [
          'May require expedited booking fee (covered by canceling vendor’s forfeited deposit penalty).',
        ],
        metricsDiff: [
          {
            label: 'Vendor Status',
            before: 'Primary Vendor Active',
            after: 'Emergency Backup Activated',
            changeText: 'Zero downtime replacement',
            isPositive: true,
          },
          {
            label: 'Schedule Delay',
            before: '0 hours',
            after: '< 4 hours',
            changeText: 'Controlled turnaround',
            isPositive: true,
          },
        ],
        categoryModifications: [],
        suggestedTasks: [
          {
            title: 'Dispatch Emergency Scope Brief to Pre-Vetted Backup Vendor',
            priority: 'URGENT',
            category: 'VENDORS',
            dueDateOffsetDays: -15,
            actionReason: 'Lock backup vendor availability within 12-hour window.',
          },
          {
            title: 'Initiate Deposit Refund Recovery Claim with Original Vendor',
            priority: 'HIGH',
            category: 'BUDGET',
            dueDateOffsetDays: -14,
            actionReason: 'Execute breach of contract clause for 100% advance return.',
          },
        ],
        contingencyActions: [
          'Review signed contract terms for cancellation liquidated damages.',
          'Notify event lead and executive committee.',
        ],
      };
    }

    default: {
      return {
        scenarioType,
        scenarioTitle: 'Operational Contingency Simulation',
        scenarioDescription: 'Generic operational resilience check across timeline, budget, and logistical checkpoints.',
        impactLevel: 'LOW',
        summary: ['Checked timeline buffers and vendor responsiveness.'],
        tradeOffs: ['No major budget trade-offs required.'],
        metricsDiff: [
          {
            label: 'Overall Health',
            before: '85/100',
            after: '92/100',
            changeText: 'Buffers hardened',
            isPositive: true,
          },
        ],
        categoryModifications: [],
        suggestedTasks: [],
        contingencyActions: ['Regular weekly sync with core committee.'],
      };
    }
  }
}
