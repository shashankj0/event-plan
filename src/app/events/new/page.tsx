'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  DollarSign,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  UtensilsCrossed,
  Music,
  Camera,
  Layers,
} from 'lucide-react';
import { GeneratedEventPlan } from '@/lib/ai/engine';

import { Suspense } from 'react';

const SAMPLE_PRESETS = [
  {
    title: 'Pune Maharashtrian Wedding (Prompt Spec)',
    prompt:
      'Plan a beautiful outdoor wedding for 250 guests in Pune with a budget of ₹8 lakh, traditional Maharashtrian elements, vegetarian food, accessible seating, and a backup plan for rain.',
  },
  {
    title: 'College Tech Festival & Hackathon',
    prompt:
      'Plan a 2-day College Tech Festival for 800 students in Pune with a budget of ₹10 lakh, keynote auditoriums, overnight hackathon, gaming zone, and food stalls.',
  },
  {
    title: 'Executive Leadership Summit',
    prompt:
      'Organize a high-level corporate retreat for 75 executives in Goa with a budget of ₹20 lakh, beach banquet, AV projection, team building workshops, and private transfers.',
  },
];

function NewEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase state: 'INPUT' or 'REVIEW'
  const [step, setStep] = useState<'INPUT' | 'REVIEW'>('INPUT');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedEventPlan | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // Editable fields for review phase
  const [editableTitle, setEditableTitle] = useState('');
  const [editableLocation, setEditableLocation] = useState('');
  const [editableVenue, setEditableVenue] = useState('');
  const [editableBudget, setEditableBudget] = useState(800000);
  const [editableGuests, setEditableGuests] = useState(250);
  const [editableTraditions, setEditableTraditions] = useState('');
  const [editableDietary, setEditableDietary] = useState('');
  const [editableAccessibility, setEditableAccessibility] = useState('');
  const [editableRainBackup, setEditableRainBackup] = useState('');
  const [isPersisting, setIsPersisting] = useState(false);

  useEffect(() => {
    const queryPrompt = searchParams.get('prompt');
    if (queryPrompt) {
      setPrompt(queryPrompt);
    }
  }, [searchParams]);

  // Call AI architect API
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 5) {
      setError('Please provide at least a brief description of your event.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/events/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          preferredCurrency: currency,
          autoPersist: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to architect event plan.');
      }

      const plan: GeneratedEventPlan = data.plan;
      setGeneratedPlan(plan);
      setFollowUpQuestions(data.followUpQuestions || []);

      // Populate editable fields
      setEditableTitle(plan.title);
      setEditableLocation(plan.location);
      setEditableVenue(plan.venueName);
      setEditableBudget(plan.budgetTotal);
      setEditableGuests(plan.guestCount);
      setEditableTraditions(plan.culturalTraditions);
      setEditableDietary(plan.dietaryRestrictions);
      setEditableAccessibility(plan.accessibilityNeeds);
      setEditableRainBackup(plan.rainBackupPreference);

      setStep('REVIEW');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while contacting planning engine.');
    } finally {
      setLoading(false);
    }
  };

  // User confirms & persists customized plan
  const handleConfirmAndLaunch = async () => {
    if (!generatedPlan) return;
    setIsPersisting(true);
    setError(null);

    try {
      // Re-stitch prompt with user answers to follow-up questions
      let expandedPrompt = prompt;
      Object.entries(userAnswers).forEach(([qIdx, ans]) => {
        if (ans.trim()) {
          expandedPrompt += ` [Answer to '${followUpQuestions[Number(qIdx)]}': ${ans}]`;
        }
      });

      // Call API with autoPersist = true
      const res = await fetch('/api/events/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: expandedPrompt,
          autoPersist: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.eventId) {
        throw new Error(data.error || 'Failed to save event workspace.');
      }

      // Route immediately into the newly created AI Event Workspace!
      router.push(`/events/${data.eventId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to persist event.');
      setIsPersisting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-500/10 text-coral-400 text-xs font-semibold mb-3 border border-coral-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Natural-Language Event Architect
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          {step === 'INPUT' ? 'What Event Are We Architecting?' : 'Review & Customize Your AI Plan'}
        </h1>
        <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
          {step === 'INPUT'
            ? 'Describe your gathering in everyday language. We extract budgets, dietary guidelines, rituals, weather contingencies, and vendor scopes automatically.'
            : 'Every field is fully customizable. Review your budget allocations, timeline items, and answer quick follow-up questions before launching.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PHASE 1: INPUT */}
      {step === 'INPUT' && (
        <div className="space-y-8">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/15 shadow-2xl space-y-4">
              <label htmlFor="event-prompt-input" className="block text-sm font-semibold text-white flex items-center justify-between">
                <span>Event Vision & Requirements</span>
                <span className="text-xs text-slate-400 font-normal">Mention location, budget, guest count & traditions</span>
              </label>

              <textarea
                id="event-prompt-input"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Plan a beautiful outdoor wedding for 250 guests in Pune with a budget of ₹8 lakh, traditional Maharashtrian elements, vegetarian food, accessible seating, and a backup plan for rain."
                className="w-full p-4 rounded-xl glass-panel bg-white/5 border border-white/10 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-coral-500 transition-colors leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400">
                  <span>Preferred Currency:</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-medium focus:outline-none"
                  >
                    <option value="INR">INR (₹ Indian Rupee)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-coral-500 via-rose-600 to-violet-600 hover:from-coral-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-coral-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Architecting Event Plan...
                    </span>
                  ) : (
                    <>
                      <span>Architect Event Specification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Preset Selector */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Or pick an industry preset to test:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className="p-4 rounded-2xl glass-panel glass-panel-hover text-left flex flex-col justify-between border border-white/10 hover:border-coral-500/40"
                >
                  <div>
                    <p className="font-bold text-white text-sm mb-1">{preset.title}</p>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{preset.prompt}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-coral-400 mt-3 flex items-center gap-1">
                    Load Prompt &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: REVIEW & EDIT */}
      {step === 'REVIEW' && generatedPlan && (
        <div className="space-y-8 animate-fade-in">
          {/* Follow-up Questions Card (if any missing info) */}
          {followUpQuestions.length > 0 && (
            <div className="p-6 rounded-2xl glass-panel bg-amber-500/10 border border-amber-500/30">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Useful Follow-Up Questions (Optional)
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Our AI noticed a few areas that could use clarification. Answering these refines your vendor briefs:
              </p>
              <div className="space-y-3">
                {followUpQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-1">
                    <label htmlFor={`follow-up-${qIdx}`} className="text-xs font-medium text-slate-200">{q}</label>
                    <input
                      id={`follow-up-${qIdx}`}
                      type="text"
                      value={userAnswers[qIdx] || ''}
                      onChange={(e) =>
                        setUserAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))
                      }
                      placeholder="Type brief clarification..."
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editable Event Core Attributes */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel bg-midnight-900/90 border border-white/15 shadow-2xl space-y-6">
            <h3 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-coral-400" />
              Core Event Specification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-title-input" className="block text-xs font-semibold text-slate-400 mb-1">Event Title</label>
                <input
                  id="event-title-input"
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label htmlFor="event-location-input" className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <input
                  id="event-location-input"
                  type="text"
                  value={editableLocation}
                  onChange={(e) => setEditableLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label htmlFor="venue-name-input" className="block text-xs font-semibold text-slate-400 mb-1">Venue Recommendation</label>
                <input
                  id="venue-name-input"
                  type="text"
                  value={editableVenue}
                  onChange={(e) => setEditableVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="total-budget-input" className="block text-xs font-semibold text-slate-400 mb-1">
                    Total Budget ({generatedPlan.currency})
                  </label>
                  <input
                    id="total-budget-input"
                    type="number"
                    value={editableBudget}
                    onChange={(e) => setEditableBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                  />
                </div>
                <div>
                  <label htmlFor="guest-headcount-input" className="block text-xs font-semibold text-slate-400 mb-1">Guest Headcount</label>
                  <input
                    id="guest-headcount-input"
                    type="number"
                    value={editableGuests}
                    onChange={(e) => setEditableGuests(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                  />
                </div>
              </div>
            </div>

            {/* Cultural, Dietary, Accessibility, Rain Backup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <label htmlFor="cultural-traditions-input" className="block text-xs font-semibold text-slate-400 mb-1">Cultural Traditions</label>
                <textarea
                  id="cultural-traditions-input"
                  rows={2}
                  value={editableTraditions}
                  onChange={(e) => setEditableTraditions(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label htmlFor="dietary-requirements-input" className="block text-xs font-semibold text-slate-400 mb-1">Dietary Requirements</label>
                <textarea
                  id="dietary-requirements-input"
                  rows={2}
                  value={editableDietary}
                  onChange={(e) => setEditableDietary(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label htmlFor="accessibility-needs-input" className="block text-xs font-semibold text-slate-400 mb-1">Accessibility Provisions</label>
                <textarea
                  id="accessibility-needs-input"
                  rows={2}
                  value={editableAccessibility}
                  onChange={(e) => setEditableAccessibility(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label htmlFor="rain-weather-contingency-input" className="block text-xs font-semibold text-slate-400 mb-1">Rain / Weather Contingency</label>
                <textarea
                  id="rain-weather-contingency-input"
                  rows={2}
                  value={editableRainBackup}
                  onChange={(e) => setEditableRainBackup(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-coral-500"
                />
              </div>
            </div>

            {/* Generated Budget Categories Breakdown Preview */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-bold text-white mb-3">Calculated Budget Allocation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {generatedPlan.budgetCategories.map((cat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-400">{cat.name}</p>
                    <p className="text-base font-bold text-white mt-0.5">
                      ₹{cat.allocatedAmount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{cat.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep('INPUT')}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium"
              >
                &larr; Modify Description
              </button>

              <button
                type="button"
                onClick={handleConfirmAndLaunch}
                disabled={isPersisting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-coral-500 via-rose-600 to-violet-600 hover:from-coral-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-coral-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isPersisting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Launching Workspace...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Launch & Persist AI Event Workspace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs text-slate-400">
          <Sparkles className="w-6 h-6 text-coral-400 mx-auto mb-2 animate-spin" />
          Loading Event Architect Wizard...
        </div>
      }
    >
      <NewEventContent />
    </Suspense>
  );
}
