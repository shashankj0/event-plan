'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Users,
  Compass,
  CheckCircle2,
  DollarSign,
  Layers,
  HeartHandshake,
  Bot,
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    title: 'Pune Maharashtrian Wedding (Prompt Example)',
    tag: 'Wedding',
    text: 'Plan a beautiful outdoor wedding for 250 guests in Pune with a budget of ₹8 lakh, traditional Maharashtrian elements, vegetarian food, accessible seating, and a backup plan for rain.',
  },
  {
    title: 'NexTech AI Developer Summit',
    tag: 'Corporate',
    text: 'Plan a full-day conference and product launch for 450 tech leaders and engineers in Pune with ₹15 lakh budget, AV staging, hackathon, and gourmet catering.',
  },
  {
    title: 'Safari Theme 1st Birthday',
    tag: 'Birthday',
    text: 'Intimate safari adventure birthday party for 60 guests in Mumbai with ₹2.5 lakh budget, balloon arches, kids magic show, and photo booth.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS[0].text);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLaunchIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsSubmitting(true);
    router.push(`/events/new?prompt=${encodeURIComponent(promptText.trim())}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-coral-500/15 via-violet-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-violet-600/10 blur-[100px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-coral-500 animate-pulse" />
          <span className="font-semibold text-white">EventVerse AI 2.0</span>
          <span className="text-slate-400">|</span>
          <span className="text-coral-300">Intelligent Event Planning Copilot</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Plan Extraordinary Events at the{' '}
          <span className="bg-gradient-to-r from-coral-400 via-rose-400 to-violet-400 bg-clip-text text-transparent">
            Speed of Thought
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
          From weddings in Pune to corporate tech summits — describe your vision in ordinary language.
          EventVerse AI instantly architects an actionable workspace with dynamic budgets, timelines,
          vendor quotes, guest seating, and contingency simulations.
        </p>

        {/* Interactive Natural Language Prompt Intake Bar */}
        <div className="mt-10 max-w-3xl mx-auto">
          <form
            onSubmit={handleLaunchIntake}
            className="p-2 sm:p-2.5 rounded-2xl glass-panel bg-midnight-900/90 border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center gap-2 focus-within:border-coral-500/60 transition-all"
          >
            <div className="relative flex-1 w-full flex items-center pl-3">
              <Sparkles className="w-5 h-5 text-coral-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe your event (e.g. Pune wedding for 250 guests, ₹8 lakh budget, veg food, rain backup)..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-coral-500 via-rose-600 to-violet-600 hover:from-coral-600 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-coral-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              {isSubmitting ? (
                <span>Architecting...</span>
              ) : (
                <>
                  <span>Architect with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Prompt Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try presets:</span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptText(sample.text)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Demo Links */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/events/event_wedding_pune_01"
            className="text-sm font-semibold text-coral-400 hover:text-coral-300 flex items-center gap-1.5 underline underline-offset-4"
          >
            <Layers className="w-4 h-4" />
            Explore Pre-Built Pune Wedding Workspace &rarr;
          </Link>
          <span className="text-slate-600">|</span>
          <Link
            href="/events"
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            View All Saved Events
          </Link>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Engineered for Flawless Real-World Execution
          </h2>
          <p className="mt-3 text-slate-400 text-base max-w-2xl mx-auto">
            Not a generic questionnaire or static mockup. EventVerse AI provides full-stack intelligence
            with persistent data, automated trade-offs, and grounded answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Natural-Language Event Architect */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/20 flex items-center justify-center mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Natural-Language Event Architect</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Transforms ordinary text into structured schemas with cultural rituals, dietary constraints,
                accessibility ramps, and weather contingencies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Extracts budgets, locations, guests</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Card 2: Adaptive Budget Intelligence */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-5">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Adaptive Budget Intelligence</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Categorizes expenses across venue, catering, decor, and photography. Computes actual vs
                estimated variance, contingency reserves, and cost-per-guest metrics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Multi-currency & contingency buffers</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Card 3: Dynamic Timeline & Critical Path */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Dynamic Timeline & Critical Path</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Automatically calculates task dependencies, deadlines, and critical-path milestones to prevent
                cascading delays across vendor bookings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Automatic rescheduling alerts</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Card 4: Scenario Simulator */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Scenario Simulator</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Simulate 20% budget cuts, sudden +30 guest attendance surges, or rain weather alerts.
                Review side-by-side metric diffs and apply changes in one click.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Approve before applying changes</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Card 5: Grounded Event Copilot */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Grounded Event Copilot</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Ask conversational questions strictly answered from your authenticated database state:
                &quot;What are my 3 most urgent tasks?&quot; or &quot;How much money remains?&quot;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Zero hallucinations, 100% grounded</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Card 6: Explainable Health Score */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Explainable Health Score</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Transparent 0-100 readiness index weighted across Tasks (25%), Budget (25%), Vendors (20%),
                RSVPs (15%), and Weather Contingencies (15%).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Sustainability & accessibility checks</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl glass-panel bg-gradient-to-r from-midnight-900 via-midnight-850 to-midnight-900 border border-coral-500/30 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Ready to Plan with Exceptional Intelligence?
          </h2>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            No signup barriers or credit card required. Experience the full Pune Maharashtrian Wedding workspace
            or start your own custom event in seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events/new"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white font-semibold text-sm shadow-xl shadow-coral-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Launch Event Architect Wizard
            </Link>
            <Link
              href="/events/event_wedding_pune_01"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Open Live Pune Wedding Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
