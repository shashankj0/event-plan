'use client';

import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  CloudRain,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Heart,
  Accessibility,
  Flame,
} from 'lucide-react';

interface HealthOverviewTabProps {
  event: any;
  health: any;
  setActiveTab: (tab: string) => void;
}

export default function HealthOverviewTab({
  event,
  health,
  setActiveTab,
}: HealthOverviewTabProps) {
  const pref = event.preference;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Health & Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Readiness Gauge */}
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Readiness Health Index
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {health?.statusLevel || 'EXCELLENT'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-4">
              <span className="text-5xl font-serif font-black text-white">
                {health?.overallScore || 88}
              </span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Based on verified task milestones, budget spend discipline, vendor contract confirmations,
              RSVP response velocity, and weather fallback readiness.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Critical Path Tasks</span>
            <span className="font-semibold text-white">100% On-Track</span>
          </div>
        </div>

        {/* Cost & Efficiency Analytics */}
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Financial Efficiency
            </span>
            <div className="my-4 space-y-3">
              <div>
                <p className="text-xs text-slate-400">Cost Per Guest</p>
                <p className="text-2xl font-bold text-white">
                  ₹{health?.analytics?.costPerGuest?.toLocaleString() || '3,200'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Budget Utilization</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-coral-500 rounded-full"
                      style={{ width: `${health?.analytics?.budgetUtilizationPercent || 35}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {health?.analytics?.budgetUtilizationPercent || 35}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Contingency Reserve</span>
            <span className="font-semibold text-emerald-400">₹80,000 Unallocated</span>
          </div>
        </div>

        {/* Rain & Weather Readiness Status */}
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weather Contingency
              </span>
              <CloudRain className="w-4 h-4 text-sky-400" />
            </div>

            <div className="my-4">
              <p className="text-base font-bold text-white">Rain-Ready Dual Contract</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {pref?.rainBackupPreference ||
                  'German hangar canopy on standby with 400-capacity indoor air-conditioned ballroom reserved on first-right basis.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('scenarios')}
            className="w-full py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CloudRain className="w-3.5 h-3.5" />
            Simulate Rain Scenario &rarr;
          </button>
        </div>
      </div>

      {/* Actionable Recommendations & Critical Alerts */}
      {health?.actionableRecommendations && health.actionableRecommendations.length > 0 && (
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-coral-400" />
            Actionable Recommendations from Event Copilot
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health.actionableRecommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <h4 className="font-bold text-white text-xs">{rec.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300">{rec.impact}</p>
                </div>
                {rec.actionLink && (
                  <button
                    onClick={() => {
                      const tab = rec.actionLink.replace('#', '');
                      if (tab) setActiveTab(tab);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-coral-500 text-white transition-colors flex-shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Traditions, Dietary & Accessibility Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cultural & Dietary Specifications */}
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-coral-400" />
            Cultural Authenticity & Dietary Integrity
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-slate-400 font-medium">Cultural Rituals & Elements</p>
              <p className="text-white font-semibold mt-1">
                {pref?.culturalTraditions || 'Traditional Maharashtrian rituals with Shehnai & Saptapadi.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-slate-400 font-medium">Dietary Requirements</p>
              <p className="text-white font-semibold mt-1">
                {pref?.dietaryRestrictions ||
                  '100% Pure Vegetarian menu featuring Puran Poli, Ukdiche Modak, with dedicated Jain counters.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-slate-400 font-medium flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-coral-400" />
                Accessibility Provisions
              </p>
              <p className="text-white font-semibold mt-1">
                {pref?.accessibilityNeeds ||
                  'Zero-step wheelchair ramps to Mandap stage, golf carts from parking, front-row padded seating for senior elders.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sustainability Scorecard */}
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Sustainability Scorecard
            </h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {health?.sustainabilityScore?.level || 'Gold Eco-Standard'} ({health?.sustainabilityScore?.score || 82}/100)
            </span>
          </div>

          <div className="space-y-2">
            {health?.sustainabilityScore?.measuresAchieved?.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Next Recommended Improvements:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {health?.sustainabilityScore?.recommendedImprovements?.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
