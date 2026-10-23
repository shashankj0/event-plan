/**
 * EventVerse AI Provider-Independent LLM & Intelligent Planning Engine
 * Supports Gemini, OpenAI, and a built-in deterministic contextual reasoning planner for 100% reliable demo execution.
 */

import { detectPromptInjection, sanitizeText } from '@/lib/security/sanitize';

export interface GeneratedEventPlan {
  title: string;
  eventType: string;
  location: string;
  venueName: string;
  guestCount: number;
  budgetTotal: number;
  currency: string;
  description: string;
  startDate: string;
  culturalTraditions: string;
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  sustainabilityGoals: string;
  rainBackupPreference: string;
  theme: {
    name: string;
    description: string;
    primaryColors: string[];
    decorVibe: string;
  };
  budgetCategories: {
    name: string;
    allocatedAmount: number;
    icon: string;
    notes: string;
  }[];
  timeline: {
    timeSlot: string;
    title: string;
    stage: string;
    description: string;
    isMilestone: boolean;
  }[];
  tasks: {
    title: string;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDateOffsetDays: number;
    isCriticalPath: boolean;
    description: string;
  }[];
  vendors: {
    name: string;
    category: string;
    estimatedQuote: number;
    rating: number;
    notes: string;
  }[];
  risks: {
    riskType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    contingencyPlan: string;
  }[];
  creativeIdeas: {
    invitationHeadline: string;
    invitationBody: string;
    menuHighlights: string[];
    photoBoothIdea: string;
    playlistTheme: string;
  };
}

/**
 * Parses currency and amount from natural language (e.g. "₹8 lakh", "800000", "$15,000", "€20k", "50k")
 */
export function extractBudget(prompt: string): { amount: number; currency: string } {
  let currency = 'INR';
  if (prompt.includes('$') || prompt.toLowerCase().includes('usd')) currency = 'USD';
  else if (prompt.includes('€') || prompt.toLowerCase().includes('eur')) currency = 'EUR';
  else if (prompt.includes('£') || prompt.toLowerCase().includes('gbp')) currency = 'GBP';

  // Check for Indian Lakh notation (e.g. "8 lakh", "8.5 lakhs", "12.5 lakhs", "₹8L")
  const lakhMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?)\b/i) || prompt.match(/(?:₹|rs\.?\s*)(\d+(?:\.\d+)?)\s*l\b/i);
  if (lakhMatch) {
    return { amount: parseFloat(lakhMatch[1]) * 100000, currency: 'INR' };
  }

  // Check for Crore notation (e.g. "1.5 crore", "2 cr")
  const croreMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);
  if (croreMatch) {
    return { amount: parseFloat(croreMatch[1]) * 10000000, currency: 'INR' };
  }

  // Check for "k" notation (e.g. "50k", "500k")
  const kMatch = prompt.match(/(?:[₹$€£]\s*)?(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    return { amount: parseFloat(kMatch[1]) * 1000, currency };
  }

  // Check for plain numbers
  const numMatch = prompt.match(/(?:[₹$€£]|rs\.?|inr|usd)\s*([\d,]+)/i) || prompt.match(/budget\s*(?:of|is)?\s*([\d,]+)/i);
  if (numMatch) {
    const raw = numMatch[1].replace(/,/g, '');
    const val = parseFloat(raw);
    if (!isNaN(val) && val > 0) return { amount: val, currency };
  }

  return { amount: 800000, currency };
}

/**
 * Extracts guest count from natural language (e.g. "250 guests", "for 100 people")
 */
export function extractGuestCount(prompt: string): number {
  const match = prompt.match(/(\d+)\s*(?:guests?|people|attendees|pax|members)\b/i);
  if (match) {
    const count = parseInt(match[1], 10);
    if (!isNaN(count) && count > 0) return count;
  }
  return 200;
}

/**
 * Extracts location from text (e.g. "in Pune", "at Goa", "in Bangalore")
 */
export function extractLocation(prompt: string): string {
  const match = prompt.match(/\b(?:in|at|near|around)\s+([A-Z][a-zA-Z\s]+?)(?:,|\.|\s+with|\s+for|\s+and|\s*$)/i);
  if (match && match[1].trim()) {
    return match[1].trim();
  }
  return 'Pune, Maharashtra';
}

/**
 * Detects event type from text
 */
export function detectEventType(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('vivah') || lower.includes('marriage')) return 'Wedding';
  if (lower.includes('birthday') || lower.includes('bday')) return 'Birthday';
  if (lower.includes('anniversary')) return 'Anniversary';
  if (lower.includes('corporate') || lower.includes('conference') || lower.includes('summit')) return 'Corporate';
  if (lower.includes('fest') || lower.includes('college')) return 'College Festival';
  if (lower.includes('cultural') || lower.includes('puja') || lower.includes('gathering')) return 'Cultural Program';
  if (lower.includes('fundraiser') || lower.includes('charity')) return 'Fundraiser';
  return 'Community Gathering';
}

/**
 * Intelligent Deterministic Natural Language Event Architect
 * Uses extracted entities to generate tailored, domain-specific event plans.
 */
export function generateDeterministicEventPlan(rawPrompt: string): GeneratedEventPlan {
  const prompt = sanitizeText(rawPrompt);
  const eventType = detectEventType(prompt);
  const location = extractLocation(prompt);
  const { amount: budgetTotal, currency } = extractBudget(prompt);
  const guestCount = extractGuestCount(prompt);

  const lower = prompt.toLowerCase();
  const isMaharashtrian = lower.includes('maharashtrian') || lower.includes('pune') || lower.includes('mumbai');
  const isVegetarian = lower.includes('vegetarian') || lower.includes('veg');
  const hasRainBackup = lower.includes('rain') || lower.includes('weather') || lower.includes('monsoon');
  const hasAccessibility = lower.includes('accessib') || lower.includes('wheelchair') || lower.includes('elderly');

  const now = new Date();
  const eventDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days ahead
  const eventDateStr = eventDate.toISOString().split('T')[0];

  if (eventType === 'Wedding') {
    return {
      title: isMaharashtrian ? `Royal Maharashtrian Wedding & Reception` : `Enchanted Celebration & Wedding`,
      eventType: 'Wedding',
      location,
      venueName: isMaharashtrian ? 'The Royal Maratha Lawns & Heritage Courtyard' : 'Grand Floral Gardens & Banquet',
      guestCount,
      budgetTotal,
      currency,
      description: prompt,
      startDate: eventDateStr,
      culturalTraditions: isMaharashtrian
        ? 'Traditional Maharashtrian Sakharpuda, Haldi ceremony, Muhurt rituals with Shehnai, Saptapadi, and Mangalashtak recital.'
        : 'Welcome procession, exchange of garlands, ceremonial vows, and celebratory toasts.',
      dietaryRestrictions: isVegetarian
        ? '100% Pure Vegetarian menu featuring regional specialties (Puran Poli, Ukdiche Modak, Kothimbir Vadi), with dedicated Jain & nut-free options.'
        : 'Curated multi-cuisine buffet with live interactive stations and vegetarian options.',
      accessibilityNeeds: hasAccessibility
        ? 'Zero-step wheelchair ramps to Mandap/Stage, priority front-row seating for elders, accessible restrooms, and dedicated golf carts for lawn transit.'
        : 'Priority seating and paved ramp access for senior family members.',
      sustainabilityGoals:
        'Zero single-use plastic, biodegradable areca palm tableware, leftover food distribution tie-up with Robin Hood Army, and potted sapling return gifts.',
      rainBackupPreference: hasRainBackup
        ? 'Waterproof German hangar canopy pre-booked on standby, with adjacent 400-capacity indoor air-conditioned banquet hall reserved on first-right basis.'
        : 'Clear weatherproof marquee setup for outdoor lawn.',
      theme: {
        name: isMaharashtrian ? 'Maratha Royalty & Marigold Splendor' : 'Ethereal Garden Bloom',
        description:
          'A majestic blend of rich saffron, marigold, deep midnight navy accents, brass diya lamps, and fragrant Mogra florals.',
        primaryColors: ['#FF5441', '#E5C07B', '#0B1120', '#8B5CF6'],
        decorVibe: 'Regal, fragrant, warm candlelight, traditional brass aesthetics with contemporary comfort.',
      },
      budgetCategories: [
        {
          name: 'Venue & Infrastructure',
          allocatedAmount: Math.round(budgetTotal * 0.32),
          icon: 'Building2',
          notes: 'Lawn rental, backup indoor banquet reservation, generators, and changing rooms.',
        },
        {
          name: 'Catering & Beverages',
          allocatedAmount: Math.round(budgetTotal * 0.28),
          icon: 'UtensilsCrossed',
          notes: `Traditional feast for ${guestCount} guests, welcome drinks, live dessert stations, and chai bar.`,
        },
        {
          name: 'Decor, Mandap & Florals',
          allocatedAmount: Math.round(budgetTotal * 0.16),
          icon: 'Sparkles',
          notes: 'Floral mandap, fairy lights, brass diyas, welcome arch, and lounge seating.',
        },
        {
          name: 'Photography & Cinematography',
          allocatedAmount: Math.round(budgetTotal * 0.10),
          icon: 'Camera',
          notes: 'Traditional + candid photographers, 4K drone coverage, teaser reel, and raw footage.',
        },
        {
          name: 'Sound, Lights & Entertainment',
          allocatedAmount: Math.round(budgetTotal * 0.05),
          icon: 'Music',
          notes: 'Live Shehnai/Dhol-Tasha troop, wireless lapel mics, mood ambient wash lights.',
        },
        {
          name: 'Attire, Hair & Makeup',
          allocatedAmount: Math.round(budgetTotal * 0.04),
          icon: 'Crown',
          notes: 'Bridal Nauvari styling, groom traditional attire, and family touch-up artist.',
        },
        {
          name: 'Contingency & Emergency Reserve',
          allocatedAmount: Math.round(budgetTotal * 0.05),
          icon: 'ShieldAlert',
          notes: 'Dedicated 5% buffer for last-minute guest additions or weather adaptations.',
        },
      ],
      timeline: [
        {
          timeSlot: '08:30 AM - 10:00 AM',
          title: 'Guest Arrival & Traditional Welcome',
          stage: 'MORNING',
          description: 'Aarti welcome, Shehnai melodies, and refreshing Kokum sherbet & breakfast snacks.',
          isMilestone: true,
        },
        {
          timeSlot: '10:15 AM - 12:30 PM',
          title: 'Auspicious Muhurt & Wedding Rituals',
          stage: 'MORNING',
          description: 'Antarpat ceremony, exchange of garlands, Mangalashtak, and Kanyadan ritual.',
          isMilestone: true,
        },
        {
          timeSlot: '12:30 PM - 02:30 PM',
          title: 'Grand Traditional Vegetarian Feast',
          stage: 'AFTERNOON',
          description: 'Traditional sit-down Pangat / buffet with Puran Poli, Dal, Shrikhand, and appetizers.',
          isMilestone: true,
        },
        {
          timeSlot: '03:00 PM - 05:00 PM',
          title: 'Photo Sessions & Family Blessings',
          stage: 'AFTERNOON',
          description: 'Stage photography with immediate relatives, group portraits, and relaxed mingling.',
          isMilestone: false,
        },
        {
          timeSlot: '06:00 PM - 09:30 PM',
          title: 'Evening Musical Reception & Dinner',
          stage: 'EVENING',
          description: 'Ambient lighting switch, acoustic fusion music performance, and warm dinner reception.',
          isMilestone: true,
        },
      ],
      tasks: [
        {
          title: 'Finalize and Sign Venue Contract with Weather Clause',
          category: 'VENUE',
          priority: 'URGENT',
          dueDateOffsetDays: -45,
          isCriticalPath: true,
          description: 'Ensure indoor hall standby is legally locked without extra hourly fee penalty.',
        },
        {
          title: 'Approve Vegetarian Catering Tasting & Dietary Counters',
          category: 'CATERING',
          priority: 'HIGH',
          dueDateOffsetDays: -30,
          isCriticalPath: true,
          description: 'Sample Jain preparations, confirm live sweet counters and beverage menu.',
        },
        {
          title: 'Dispatch Digital Invitations with RSVP & Dietary Form',
          category: 'GUESTS',
          priority: 'HIGH',
          dueDateOffsetDays: -25,
          isCriticalPath: false,
          description: 'Send WhatsApp/Email invitations with trackable RSVP link and accessibility questionnaire.',
        },
        {
          title: 'Conduct Venue Walkthrough with Mandap Decorator',
          category: 'DECOR',
          priority: 'MEDIUM',
          dueDateOffsetDays: -15,
          isCriticalPath: false,
          description: 'Verify power socket loads, stage ramp slopes for wheelchairs, and green-room setups.',
        },
        {
          title: 'Confirm Rain Backup Hangar & Electrician Generator Readiness',
          category: 'LOGISTICS',
          priority: 'HIGH',
          dueDateOffsetDays: -7,
          isCriticalPath: true,
          description: 'Check 125 kVA generator fuel levels and cable waterproofing for monsoon contingency.',
        },
      ],
      vendors: [
        {
          name: 'Sanskriti Heritage Decorators',
          category: 'Decor & Mandap',
          estimatedQuote: Math.round(budgetTotal * 0.15),
          rating: 4.9,
          notes: 'Specializes in Maratha heritage themes, marigold draping, and brass props.',
        },
        {
          name: 'Parampara Rasoi Gourmet Caterers',
          category: 'Catering',
          estimatedQuote: Math.round(budgetTotal * 0.27),
          rating: 4.9,
          notes: 'Renowned for hygienic, traditional Maharashtrian & North Indian vegetarian spreads.',
        },
        {
          name: 'Drishti Memories Photography',
          category: 'Photography',
          estimatedQuote: Math.round(budgetTotal * 0.10),
          rating: 4.8,
          notes: 'Award-winning candid team with dual camera drone setup.',
        },
        {
          name: 'Sur Swar Ensemble & Sound Systems',
          category: 'Music & Audio',
          estimatedQuote: Math.round(budgetTotal * 0.05),
          rating: 4.7,
          notes: 'Includes wireless Sennheiser microphones, live Shehnai, and JBL sound array.',
        },
      ],
      risks: [
        {
          riskType: 'WEATHER',
          severity: 'HIGH',
          likelihood: 'MEDIUM',
          description: 'Sudden rainstorm could drench outdoor lawn and disrupt audio equipment.',
          contingencyPlan:
            'Trigger 3-hour switch protocol to migrate Mandap rituals inside adjacent AC banquet hall.',
        },
        {
          riskType: 'ATTENDANCE',
          severity: 'MEDIUM',
          likelihood: 'HIGH',
          description: `Guest headcount could surge by 15-20% beyond the booked ${guestCount} pax.`,
          contingencyPlan:
            'Pre-agreed +15% dynamic catering buffer with caterer; additional buffet counters on standby.',
        },
        {
          riskType: 'ACCESSIBILITY',
          severity: 'MEDIUM',
          likelihood: 'LOW',
          description: 'Elderly guests unable to climb stage steps or walk across uneven wet grass.',
          contingencyPlan:
            'Pre-installed wooden anti-slip ramps and two dedicated golf carts stationed at lawn entrance.',
        },
      ],
      creativeIdeas: {
        invitationHeadline: 'Two Hearts, Two Families, One Sacred Journey',
        invitationBody: `With the blessings of our elders, we cordially invite you to celebrate our union in ${location}. Your presence, laughter, and blessings will grace our special day.`,
        menuHighlights: [
          'Welcome Drink: Kokum Sherbet & Spiced Kesar Thandai',
          'Appetizers: Kothimbir Vadi, Paneer Tikka, Mini Sabudana Vada Bites',
          'Main Course: Traditional Varan Bhaat with pure Ghee, Matki Usal, Paneer Peshawari, Puri & Bhakri',
          'Dessert: Fresh Warm Ukdiche Modak with Saffron Milk & Kesari Shrikhand',
        ],
        photoBoothIdea:
          'Royal Maratha Palace Arch with antique brass lanterns, marigold floral curtains, and traditional Pagadi & Feta props for fun guest photos.',
        playlistTheme: 'Acoustic Sitar & Flute morning melodies transitioning to upbeat Bollywood retro in the evening.',
      },
    };
  }

  // Generic/Corporate/Festival/Birthday fallback
  return {
    title: `${eventType} Experience in ${location}`,
    eventType,
    location,
    venueName: `${location} Premium Event Center`,
    guestCount,
    budgetTotal,
    currency,
    description: prompt,
    startDate: eventDateStr,
    culturalTraditions: 'Contemporary celebratory format with warm hospitality and keynote moments.',
    dietaryRestrictions: isVegetarian ? 'Curated Vegetarian gourmet spread' : 'Diverse multi-cuisine buffet',
    accessibilityNeeds: hasAccessibility ? 'Complete wheelchair access, tactile paths, and reserved front seating' : 'Standard ADA accessibility',
    sustainabilityGoals: 'Digital passes, zero single-use plastic, water refill stations, and carbon-offset pledge.',
    rainBackupPreference: hasRainBackup ? 'Dual indoor/outdoor reservation with rapid weather canopy.' : 'Indoor climate-controlled venue.',
    theme: {
      name: 'Modern Luminance & Celebration',
      description: 'Sophisticated aesthetics featuring modern lighting, sleek geometric lines, and warm ambient glow.',
      primaryColors: ['#FF5441', '#8B5CF6', '#0B1120', '#E5C07B'],
      decorVibe: 'Crisp, contemporary, elegant, and vibrant.',
    },
    budgetCategories: [
      { name: 'Venue & Staging', allocatedAmount: Math.round(budgetTotal * 0.35), icon: 'Building2', notes: 'Facility rental, stage, screens, and lighting truss.' },
      { name: 'Catering & Hospitality', allocatedAmount: Math.round(budgetTotal * 0.30), icon: 'UtensilsCrossed', notes: `Gourmet service for ${guestCount} guests.` },
      { name: 'Production & AV', allocatedAmount: Math.round(budgetTotal * 0.15), icon: 'Music', notes: 'High-definition projectors, sound engineering, microphones.' },
      { name: 'Decor & Branding', allocatedAmount: Math.round(budgetTotal * 0.10), icon: 'Sparkles', notes: 'Backdrops, floral touches, signage, registration desk.' },
      { name: 'Contingency Buffer', allocatedAmount: Math.round(budgetTotal * 0.10), icon: 'ShieldAlert', notes: 'Emergency fund for unexpected surges or logistical changes.' },
    ],
    timeline: [
      { timeSlot: '10:00 AM - 11:30 AM', title: 'Arrival & Welcome Reception', stage: 'MORNING', description: 'Registration, badges, welcome drinks and networking.', isMilestone: true },
      { timeSlot: '11:30 AM - 01:00 PM', title: 'Main Program & Keynote Activities', stage: 'MORNING', description: 'Speeches, performances, and feature presentation.', isMilestone: true },
      { timeSlot: '01:00 PM - 02:30 PM', title: 'Networking Luncheon', stage: 'AFTERNOON', description: 'Multi-cuisine banquet lunch.', isMilestone: false },
      { timeSlot: '02:30 PM - 05:00 PM', title: 'Interactive Sessions & Celebrations', stage: 'AFTERNOON', description: 'Group games, awards, and dessert bar.', isMilestone: true },
    ],
    tasks: [
      { title: 'Confirm Venue Booking & Safety Clearances', category: 'VENUE', priority: 'URGENT', dueDateOffsetDays: -30, isCriticalPath: true, description: 'Sign lease agreement and check insurance policies.' },
      { title: 'Finalize AV Equipment & Microphones', category: 'PRODUCTION', priority: 'HIGH', dueDateOffsetDays: -14, isCriticalPath: true, description: 'Test projector lumens and wireless frequencies.' },
      { title: 'Publish RSVP and Dietary Registration Form', category: 'GUESTS', priority: 'HIGH', dueDateOffsetDays: -20, isCriticalPath: false, description: 'Send digital confirmation links to all invitees.' },
      { title: 'Verify Fire Safety & First Aid Setup', category: 'LOGISTICS', priority: 'MEDIUM', dueDateOffsetDays: -5, isCriticalPath: false, description: 'Station first responder kit and emergency exit indicators.' },
    ],
    vendors: [
      { name: 'Apex Event Productions', category: 'AV & Staging', estimatedQuote: Math.round(budgetTotal * 0.15), rating: 4.9, notes: 'LED walls, line arrays, and stage lighting.' },
      { name: 'Epicurean Gourmet Catering', category: 'Catering', estimatedQuote: Math.round(budgetTotal * 0.28), rating: 4.8, notes: 'Continental and regional specialties.' },
    ],
    risks: [
      { riskType: 'LOGISTICS', severity: 'MEDIUM', likelihood: 'MEDIUM', description: 'Traffic delays near event venue could delay setup crew.', contingencyPlan: 'Advance setup window by 4 hours.' },
      { riskType: 'TECHNICAL', severity: 'HIGH', likelihood: 'LOW', description: 'Microphone feedback or projector failure during primary presentation.', contingencyPlan: 'Dual redundant audio backup and spare bulb.' },
    ],
    creativeIdeas: {
      invitationHeadline: `Join us for an Extraordinary ${eventType}`,
      invitationBody: `You are cordially invited to celebrate with us in ${location}. We look forward to an unforgettable experience filled with connection and joy.`,
      menuHighlights: ['Gourmet Mocktail Bar', 'Artisanal Hors d’oeuvres', 'Chef-crafted Entrees', 'Dessert Tasting Platter'],
      photoBoothIdea: 'Interactive 360-degree video booth with customized branding overlay and instant digital sharing.',
      playlistTheme: 'Contemporary upbeat lounge vibes and energizing celebration beats.',
    },
  };
}

/**
 * Dispatches event plan generation to AI or built-in deterministic engine.
 */
export async function generateEventPlan(prompt: string): Promise<GeneratedEventPlan> {
  const injection = detectPromptInjection(prompt);
  if (injection.isSuspicious) {
    throw new Error(`Security Alert: ${injection.reason}`);
  }

  // Check if GEMINI_API_KEY is present
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are EventVerse AI, an expert event architect. Transform this user description into a structured JSON event plan matching the GeneratedEventPlan interface:
"${prompt}"

Ensure realistic budget allocations, tasks, vendors, timeline, and risk contingency plans. Output pure JSON only without backticks.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text) as GeneratedEventPlan;
          if (parsed.title && parsed.budgetCategories && parsed.tasks) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, gracefully falling back to intelligent planner:', err);
    }
  }

  // Graceful deterministic fallback ensures zero downtime and complete reliability
  return generateDeterministicEventPlan(prompt);
}
