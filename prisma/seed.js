const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EventVerse AI database...');

  // 1. Create Demo Users
  const ananya = await prisma.user.upsert({
    where: { email: 'ananya@eventverse.ai' },
    update: {},
    create: {
      id: 'user_ananya_01',
      email: 'ananya@eventverse.ai',
      name: 'Ananya Sharma',
      role: 'ORGANIZER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
  });

  const rohan = await prisma.user.upsert({
    where: { email: 'rohan.patil@eventverse.ai' },
    update: {},
    create: {
      id: 'user_rohan_02',
      email: 'rohan.patil@eventverse.ai',
      name: 'Rohan Patil',
      role: 'CO_PLANNER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
  });

  console.log(`Created primary users: ${ananya.name}, ${rohan.name}`);

  // 2. Primary Event: Royal Maharashtrian Wedding in Pune (Matches User Spec Exactly!)
  const weddingEvent = await prisma.event.upsert({
    where: { id: 'event_wedding_pune_01' },
    update: {},
    create: {
      id: 'event_wedding_pune_01',
      title: 'Royal Maharashtrian Wedding: Tanvi & Advaith',
      description:
        'A beautiful outdoor celebration for 250 guests in Pune with traditional Maharashtrian elements, pure vegetarian culinary feast, accessible elderly seating, and a verified backup plan for rain.',
      eventType: 'Wedding',
      location: 'Pune, Maharashtra',
      venueName: 'The Maratha Heritage Lawns & Grand Ballroom, Baner',
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      endDate: new Date(Date.now() + 46 * 24 * 60 * 60 * 1000),
      guestCount: 250,
      budgetTotal: 800000, // ₹8 Lakh
      currency: 'INR',
      status: 'PLANNING',
      healthScore: 88,
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      userId: ananya.id,
      preference: {
        create: {
          culturalTraditions: 'Traditional Sakharpuda, Haldi, Muhurt Shehnai recitation, Antarpat, and Saptapadi.',
          dietaryRestrictions: '100% Pure Vegetarian menu featuring Puran Poli, Ukdiche Modak, Kothimbir Vadi, with dedicated Jain counters.',
          accessibilityNeeds: 'Zero-step wheelchair ramps to Mandap stage, golf carts from parking, front-row padded seating for senior elders.',
          sustainabilityGoals: 'Zero single-use plastic, biodegradable areca palm plates, leftover food donation to local shelter, potted sapling return gifts.',
          themeKeywords: 'Maratha Royalty, Marigold Gold & Saffron, Brass Diyas, Fragrant Mogra',
          rainBackupPreference: 'Waterproof German hangar canopy on standby with 400-capacity indoor air-conditioned ballroom reserved on first-right basis.',
          vibeStyle: 'Regal, warm, culturally authentic, and joyously hospitable',
        },
      },
      budget: {
        create: {
          totalBudget: 800000,
          contingencyPercent: 10.0,
          contingencyReserve: 80000,
          currency: 'INR',
          notes: 'Target budget ₹8,00,000 INR with dedicated 10% contingency reserve for weather/surge buffers.',
          categories: {
            create: [
              {
                name: 'Venue & Lawns',
                allocatedAmount: 240000,
                actualSpent: 120000,
                icon: 'Building2',
                color: '#3B82F6',
                notes: 'Includes lawn rental, backup indoor AC banquet reservation, generator backup.',
                expenses: {
                  create: [
                    {
                      name: 'Venue Advance Deposit (50%)',
                      estimatedCost: 120000,
                      actualCost: 120000,
                      paidAmount: 120000,
                      paymentStatus: 'PAID',
                      notes: 'Includes signed rain backup indemnity clause.',
                    },
                    {
                      name: 'Venue Final Settlement',
                      estimatedCost: 120000,
                      actualCost: 120000,
                      paidAmount: 0,
                      paymentStatus: 'UNPAID',
                      notes: 'Due on event day morning.',
                    },
                  ],
                },
              },
              {
                name: 'Catering & Beverages',
                allocatedAmount: 220000,
                actualSpent: 50000,
                icon: 'UtensilsCrossed',
                color: '#F97316',
                notes: 'Traditional feast for 250 guests + 25 plate contingency buffer, welcome kokum sherbet, live modak station.',
                expenses: {
                  create: [
                    {
                      name: 'Caterer Tasting & Advance Booking',
                      estimatedCost: 50000,
                      actualCost: 50000,
                      paidAmount: 50000,
                      paymentStatus: 'PAID',
                      notes: 'Approved menu tasting and Jain counter arrangement.',
                    },
                  ],
                },
              },
              {
                name: 'Decor, Mandap & Florals',
                allocatedAmount: 130000,
                actualSpent: 40000,
                icon: 'Sparkles',
                color: '#EC4899',
                notes: 'Carved Maratha-style wooden mandap, marigold chandeliers, brass diya stands, ambient lighting.',
              },
              {
                name: 'Photography & Cinematography',
                allocatedAmount: 80000,
                actualSpent: 30000,
                icon: 'Camera',
                color: '#8B5CF6',
                notes: '2 Candid photographers, 1 traditional videographer, 4K drone cinematography, wedding teaser.',
              },
              {
                name: 'Music, Sound & Shehnai',
                allocatedAmount: 35000,
                actualSpent: 15000,
                icon: 'Music',
                color: '#10B981',
                notes: 'Traditional Shehnai artists for Muhurt, sound console, and evening reception fusion music.',
              },
              {
                name: 'Attire & Bridal Styling',
                allocatedAmount: 40000,
                actualSpent: 20000,
                icon: 'Crown',
                color: '#F59E0B',
                notes: 'Bridal Nauvari draping artist and family grooming coordination.',
              },
              {
                name: 'Contingency & Emergency Reserve',
                allocatedAmount: 55000,
                actualSpent: 0,
                icon: 'ShieldAlert',
                color: '#64748B',
                notes: 'Buffer for last-minute guest additions, weather adaptations, or tips.',
              },
            ],
          },
        },
      },
      tasks: {
        create: [
          {
            title: 'Verify Rain Contingency & German Hangar Booking Contract',
            description: 'Ensure indoor AC banquet hall can be switched within 3 hours if precipitation exceeds 60%.',
            category: 'VENUE',
            status: 'COMPLETED',
            priority: 'URGENT',
            isCriticalPath: true,
            order: 1,
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            title: 'Finalize Vegetarian Menu & Jain Counters with Caterer',
            description: 'Sample Puran Poli, confirm separate Jain cooking vessel protocols and allergen tags.',
            category: 'CATERING',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            isCriticalPath: true,
            order: 2,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            title: 'Audit Wheelchair Ramps & Elderly Seating Access',
            description: 'Inspect ramp angles to Mandap stage and reserve 30 padded armchairs in front row.',
            category: 'LOGISTICS',
            status: 'TODO',
            priority: 'HIGH',
            isCriticalPath: false,
            order: 3,
            dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          },
          {
            title: 'Send Digital WhatsApp Invitations with RSVP Link',
            description: 'Send personalized links with dietary preference and song request questions.',
            category: 'GUESTS',
            status: 'COMPLETED',
            priority: 'MEDIUM',
            isCriticalPath: false,
            order: 4,
            dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            title: 'Conduct Final Sound & Microphone Check with Shehnai Ensemble',
            description: 'Ensure wireless lapel mics for Guruji and feedback suppression in open lawn.',
            category: 'MUSIC',
            status: 'TODO',
            priority: 'MEDIUM',
            isCriticalPath: false,
            order: 5,
            dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      timelineItems: {
        create: [
          {
            timeSlot: '08:00 AM - 09:30 AM',
            title: 'Guest Arrival, Aarti Welcome & Breakfast',
            description: 'Aarti with Shehnai melodies; Kokum sherbet, Misal Pav, and Poha served in morning courtyard.',
            stage: 'MORNING',
            isMilestone: true,
            order: 1,
          },
          {
            timeSlot: '09:45 AM - 12:15 PM',
            title: 'Auspicious Muhurt & Vivah Rituals',
            description: 'Antarpat, exchange of garlands (Varmala), Mangalashtak recital, Kanyadan, and Saptapadi vows.',
            stage: 'MORNING',
            isMilestone: true,
            order: 2,
          },
          {
            timeSlot: '12:30 PM - 02:30 PM',
            title: 'Royal Traditional Feast (Pangat & Buffet)',
            description: 'Sit-down traditional Pangat and continuous buffet featuring freshly made Puran Poli with Ghee.',
            stage: 'AFTERNOON',
            isMilestone: true,
            order: 3,
          },
          {
            timeSlot: '03:00 PM - 05:00 PM',
            title: 'Family Portrait Sessions & Couple Shringar Change',
            description: 'Stage photography with immediate relatives and transition into evening reception attire.',
            stage: 'AFTERNOON',
            isMilestone: false,
            order: 4,
          },
          {
            timeSlot: '06:00 PM - 09:30 PM',
            title: 'Evening Musical Reception & Dinner',
            stage: 'EVENING',
            description: 'Illumination of 500 brass lamps, live acoustic fusion performance, dinner, and celebratory toasts.',
            isMilestone: true,
            order: 5,
          },
        ],
      },
      vendors: {
        create: [
          {
            name: 'Maratha Shaan Mandap & Florals',
            category: 'Decor & Mandap',
            contactName: 'Suresh Kadam',
            phone: '+91 98220 12345',
            email: 'suresh@marathashaan.com',
            rating: 4.9,
            status: 'BOOKED',
            notes: 'Booked. Specializing in royal Maratha brass props and natural Mogra/marigold canopy.',
            quotes: {
              create: {
                amount: 125000,
                inclusions: 'Carved Mandap, 2 Welcome Arches, Stage sofa, 50 Brass Diyas, Marigold Chandeliers',
                status: 'ACCEPTED',
              },
            },
          },
          {
            name: 'Peshwa Rasoi Gourmet Caterers',
            category: 'Catering',
            contactName: 'Milind Deshpande',
            phone: '+91 94220 54321',
            email: 'milind@peshwarasoi.in',
            rating: 4.9,
            status: 'BOOKED',
            notes: 'Booked. Guaranteed 250 plates + 25 complimentary buffer. Pure veg with strict Jain hygiene.',
            quotes: {
              create: {
                amount: 215000,
                inclusions: '3-course traditional feast, 4 live counters, welcome drinks, desserts, 30 service staff',
                status: 'ACCEPTED',
              },
            },
          },
          {
            name: 'Pune Candid Frames Studio',
            category: 'Photography',
            contactName: 'Neha Joshi',
            phone: '+91 97654 32109',
            email: 'neha@puneframes.com',
            rating: 4.8,
            status: 'BOOKED',
            notes: 'Booked. Dual candid shooters, cinematic teaser, 400 edited high-res photos.',
            quotes: {
              create: {
                amount: 78000,
                inclusions: 'Pre-wedding session, wedding day full 12-hr coverage, Drone 4K footage, leather album',
                status: 'ACCEPTED',
              },
            },
          },
          {
            name: 'Swaranjali Shehnai & Sound Systems',
            category: 'Music & Audio',
            contactName: 'Pandit Ravi Shinde',
            phone: '+91 98901 23456',
            rating: 4.8,
            status: 'SHORTLISTED',
            notes: 'Quotation under final review. Includes Shehnai quartet for morning and acoustic trio for evening.',
            quotes: {
              create: {
                amount: 32000,
                inclusions: 'Live 4-piece Shehnai ensemble (4 hrs), 8-channel digital mixer, 4 JBL tops, 2 wireless lapels',
                status: 'REVIEWING',
              },
            },
          },
        ],
      },
      seatingTables: {
        create: [
          { tableName: 'Grandparents & VIP Elders', tableNumber: 1, capacity: 8, shape: 'ROUND', zone: 'VIP' },
          { tableName: 'Bride Immediate Family', tableNumber: 2, capacity: 8, shape: 'ROUND', zone: 'MAIN_HALL' },
          { tableName: 'Groom Immediate Family', tableNumber: 3, capacity: 8, shape: 'ROUND', zone: 'MAIN_HALL' },
          { tableName: 'College Friends Circle', tableNumber: 4, capacity: 10, shape: 'RECTANGLE', zone: 'OUTDOOR' },
          { tableName: 'Work Colleagues & Tech Team', tableNumber: 5, capacity: 10, shape: 'RECTANGLE', zone: 'OUTDOOR' },
        ],
      },
      guests: {
        create: [
          {
            firstName: 'Dattatray',
            lastName: 'Patil',
            email: 'dattatray.patil@gmail.com',
            phone: '+91 98221 11223',
            household: 'Patil Family',
            dietary: 'Pure Vegetarian (Jain prep preferred)',
            accessibility: 'Wheelchair ramp access required',
            plusOneAllowed: true,
            plusOneAttending: true,
            invitationSent: true,
            rsvp: {
              create: {
                status: 'ACCEPTED',
                confirmedCount: 2,
                mealChoice: 'Traditional Maharashtrian Vegetarian',
                specialRequests: 'Elderly seating close to stage',
              },
            },
          },
          {
            firstName: 'Sunita',
            lastName: 'Kulkarni',
            email: 'sunita.kulkarni@yahoo.com',
            household: 'Kulkarni Family',
            dietary: 'Vegetarian, strictly Nut-Free',
            accessibility: 'Ground floor seating',
            plusOneAllowed: false,
            invitationSent: true,
            rsvp: {
              create: {
                status: 'ACCEPTED',
                confirmedCount: 1,
                mealChoice: 'Nut-Free Vegetarian',
              },
            },
          },
          {
            firstName: 'Amit',
            lastName: 'Deshmukh',
            email: 'amit.deshmukh@gmail.com',
            household: 'Deshmukh Friends',
            dietary: 'Vegetarian',
            accessibility: 'None',
            plusOneAllowed: true,
            plusOneAttending: true,
            invitationSent: true,
            rsvp: {
              create: {
                status: 'ACCEPTED',
                confirmedCount: 2,
              },
            },
          },
          {
            firstName: 'Siddharth',
            lastName: 'Mehta',
            email: 'siddharth.m@outlook.com',
            dietary: 'Jain Vegetarian',
            plusOneAllowed: false,
            invitationSent: true,
            rsvp: {
              create: {
                status: 'TENTATIVE',
                confirmedCount: 1,
                specialRequests: 'Traveling from Bangalore; will confirm by Tuesday',
              },
            },
          },
        ],
      },
      risks: {
        create: [
          {
            riskType: 'WEATHER',
            severity: 'HIGH',
            likelihood: 'MEDIUM',
            description: 'Sudden afternoon shower could disrupt outdoor lawn mandap ceremonies.',
            impact: 'Potential equipment water damage and guest discomfort.',
            contingencyPlans: {
              create: [
                {
                  title: 'Indoor Ballroom Rapid Switch Protocol',
                  triggerCondition: 'Rain radar shows >60% probability within 4 hours of ceremony.',
                  actionSteps:
                    'Activate venue ballroom pre-cooling. Move brass lamps and holy fire altar to verified indoor exhaust area. Deploy valet umbrellas.',
                  alternativeVenue: 'The Maratha Heritage Indoor Ballroom (Capacity 400)',
                  budgetImpact: 0,
                  contacts: 'Venue Manager: Vikram Shinde (+91 98223 99887)',
                },
              ],
            },
          },
          {
            riskType: 'ATTENDANCE',
            severity: 'MEDIUM',
            likelihood: 'HIGH',
            description: 'Guest count surge beyond 250 due to extended family plus-ones.',
            impact: 'Catering plate shortage and seating congestion.',
            contingencyPlans: {
              create: [
                {
                  title: '+25 Plate Caterer Buffer Protocol',
                  triggerCondition: 'On-site check-in registers >230 guests by 11:30 AM.',
                  actionSteps:
                    'Caterer unlocks pre-prepared reserve hot buffet line; staff sets up 3 additional 8-seater dining tables in side courtyard.',
                  budgetImpact: 15000,
                  contacts: 'Peshwa Rasoi Lead: Milind Deshpande (+91 94220 54321)',
                },
              ],
            },
          },
        ],
      },
      invitations: {
        create: {
          templateName: 'Royal Peshwa Heritage',
          heading: 'शुभ विवाह: Tanvi & Advaith',
          messageContent:
            'With the blessings of our ancestors and family, we invite you to celebrate our sacred union amidst traditional Maharashtrian warmth and joyful festivities in Pune.',
          designStyle: 'TRADITIONAL_ROYAL',
          dressCode: 'Traditional Indian / Festive Ethnic (Nauvari, Kurta, Paithani)',
          rsvpDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          shareableLink: 'https://eventverse.ai/invite/tanvi-advaith-2026',
        },
      },
      memberships: {
        create: [
          {
            userId: rohan.id,
            userEmail: rohan.email,
            userName: rohan.name,
            role: 'CO_PLANNER',
            status: 'ACCEPTED',
          },
        ],
      },
      comments: {
        create: [
          {
            authorName: 'Rohan Patil',
            authorRole: 'CO_PLANNER',
            content:
              'Venue manager confirmed that the indoor AC ballroom is fully on standby for us at no additional deposit. Weather backup is secure!',
          },
        ],
      },
    },
  });

  console.log(`Created primary event: ${weddingEvent.title} (ID: ${weddingEvent.id})`);

  // 3. Secondary Event: Corporate Tech Summit & Fest
  const corporateEvent = await prisma.event.upsert({
    where: { id: 'event_corporate_summit_02' },
    update: {},
    create: {
      id: 'event_corporate_summit_02',
      title: 'NexTech AI & Developer Summit 2026',
      description:
        'A full-day conference and product launch for 450 tech leaders and engineers in Pune featuring keynotes, panel discussions, live AI demos, and evening networking.',
      eventType: 'Corporate',
      location: 'Pune, Maharashtra',
      venueName: 'JW Marriott Grand Ballroom & Convention Centre, Senapati Bapat Road',
      startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      guestCount: 450,
      budgetTotal: 1500000, // ₹15 Lakh
      currency: 'INR',
      status: 'PLANNING',
      healthScore: 92,
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      userId: ananya.id,
      budget: {
        create: {
          totalBudget: 1500000,
          contingencyPercent: 8.0,
          contingencyReserve: 120000,
          currency: 'INR',
          categories: {
            create: [
              { name: 'Venue & Staging', allocatedAmount: 550000, actualSpent: 275000, icon: 'Building2', color: '#3B82F6' },
              { name: 'Audio Visual & Live Streaming', allocatedAmount: 320000, actualSpent: 160000, icon: 'Music', color: '#8B5CF6' },
              { name: 'Catering & Coffee Lounges', allocatedAmount: 420000, actualSpent: 100000, icon: 'UtensilsCrossed', color: '#F97316' },
              { name: 'Swag & Attendee Kits', allocatedAmount: 90000, actualSpent: 45000, icon: 'Sparkles', color: '#10B981' },
              { name: 'Contingency Reserve', allocatedAmount: 120000, actualSpent: 0, icon: 'ShieldAlert', color: '#64748B' },
            ],
          },
        },
      },
      tasks: {
        create: [
          { title: 'Lock Keynote Speaker Lineup & Flight Logistics', category: 'SPEAKERS', status: 'COMPLETED', priority: 'HIGH', isCriticalPath: true },
          { title: 'Test 4K LED Screen Resolution and Audio Line Array', category: 'AV', status: 'IN_PROGRESS', priority: 'URGENT', isCriticalPath: true },
          { title: 'Print Sustainable Lanyards & NFC Badges', category: 'BRANDING', status: 'TODO', priority: 'MEDIUM', isCriticalPath: false },
        ],
      },
    },
  });

  console.log(`Created secondary event: ${corporateEvent.title} (ID: ${corporateEvent.id})`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
