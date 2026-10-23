# EventVerse AI — Your Intelligent Event Planning Copilot

> A production-quality, responsive, full-stack GenAI event planning platform built with Next.js, TypeScript, Tailwind CSS, Prisma ORM, and provider-independent AI intelligence.

---

## 🌟 Product Vision

**EventVerse AI** helps individuals, families, student communities, organizations, and professional event organizers plan weddings, birthdays, anniversaries, college festivals, corporate events, and cultural programs.

Instead of navigating rigid forms, users describe their event vision in everyday language:
> *"Plan a beautiful outdoor wedding for 250 guests in Pune with a budget of ₹8 lakh, traditional Maharashtrian elements, vegetarian food, accessible seating, and a backup plan for rain."*

EventVerse AI converts this request into a rich, persistent, fully interactive event workspace with:
1. **Natural-Language Event Architect**: Automatically extracts budgets, headcount, locations, cultural traditions, dietary guidelines, and weather constraints.
2. **Adaptive Budget Intelligence**: Dynamic category allocations (Venue, Catering, Decor, Photography, Entertainment, Contingency), actuals vs. estimated variance, multi-currency support, configurable contingency sliders, and overspending trade-off detectors.
3. **Dynamic Timeline Engine**: Critical-path milestones, task dependencies, due dates, priority tags, and run-of-show day schedules.
4. **Guest Experience & RSVP Manager**: Household grouping, attendance tracking, dietary & allergen filters, plus-ones, table assignments, and CSV batch import with automated duplicate detection.
5. **Venue & Seating Planner**: Interactive multi-zone floor plan (VIP, Main Hall, Patio, Outdoor), capacity indicators, and zero-step wheelchair ramp accessibility verification.
6. **Vendor Intelligence & Quotation Matrix**: Side-by-side quote comparisons, deliverable tracking, verified rating badges, and booking pipeline statuses.
7. **AI Creative Studio**: Curated color palettes with copyable hex codes, tailored multi-course tasting menus, invitation drafts (Royal, Warm, Contemporary), social media kits with hashtags, and photo booth concepts.
8. **What-If Scenario Simulator**: Stress-test plans against 20% budget reductions, +30 guest surges, rain storms, or vendor cancellations. Inspect side-by-side metric diffs and apply approved changes directly to the live database with one click.
9. **Grounded Event Copilot**: Conversational AI assistant strictly bound to the authenticated event data context, answering queries like *"What are my 3 most urgent tasks?"*, *"How much money remains?"*, and *"What happens if 25 extra guests attend?"*.
10. **Explainable Event Health Score**: 0–100 readiness index weighted across Tasks (25%), Budget (25%), Vendors (20%), RSVPs (15%), and Contingencies (15%) with actionable recommendations and a Sustainability Scorecard.
11. **Collaborative Planning & Security**: Server-enforced role-based access control (Organizer, Co-Planner, Viewer), prompt-injection defenses, XSS sanitization, IDOR prevention, and timestamped audit logs.
12. **Printable Run-of-Show & Export Center**: Export guest rosters to CSV or generate clean, print-ready Run-of-Show schedules and emergency vendor contact sheets.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 App Router, TypeScript, React 18
- **Styling**: Tailwind CSS with custom design tokens (`midnight`, `ivory`, `coral`, `violet`), glassmorphism, and responsive layouts
- **Icons**: Lucide React
- **Database & ORM**: SQLite (zero-config local portability; seamlessly switchable to PostgreSQL via Prisma) with Prisma ORM
- **Validation**: Zod schemas for all client inputs, API payloads, and AI-generated outputs
- **Security**: Prompt-injection token detectors, XSS input sanitation, server-side event authorization, and IDOR guards
- **Testing**: Vitest unit & integration test suites
- **AI Engine**: Provider-independent LLM architecture supporting Gemini 1.5 Flash, OpenAI, and a built-in deterministic contextual reasoning planner for 100% reliable demo operation without paid API keys.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm

### 2. Installation
```bash
# Clone the repository and install dependencies
npm install
```

### 3. Database Initialization & Seeding
```bash
# Generate Prisma Client and initialize the SQLite database
npx prisma db push

# Seed the database with the Pune Maharashtrian Wedding & Tech Summit
node prisma/seed.js
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the Vitest test suite covering entity extraction, scenario simulation, health scores, and guest deduplication:
```bash
npx vitest run
```

---

## 🔒 Security & Authorization

- **Zero API Key Leakage**: LLM calls and API secrets remain strictly server-side.
- **IDOR Protection**: All protected API endpoints verify event ownership or accepted membership before permitting access (`verifyEventAccess`).
- **Prompt Injection Defense**: Evaluates inputs against jailbreak patterns (`detectPromptInjection`) before feeding them to AI.
- **Sanitized Outputs**: Strips dangerous HTML and scripts from all user descriptions and comments.

---

## 📄 License
MIT License. Built for EventVerse AI.
