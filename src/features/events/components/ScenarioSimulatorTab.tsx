'use client';

import React, { useState } from 'react';
import {
  Zap,
  TrendingDown,
  Users,
  CloudRain,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ScenarioSimulationResult } from '@/lib/ai/scenarios';

interface ScenarioSimulatorTabProps {
  event: any;
  onRefresh: () => void;
}

const SCENARIOS = [
  {
    type: 'BUDGET_CUT_20',
    title: '20% Budget Reduction',
    icon: TrendingDown,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    desc: 'Simulate financial trimming while protecting core catering & venue hospitality.',
  },
  {
    type: 'GUEST_INCREASE_30',
    title: 'Attendance Surge (+30 Guests)',
    icon: Users,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    desc: 'Assess seating table additions, catering buffers, and fire capacity clearances.',
  },
  {
    type: 'RAIN_WEATHER_ALERT',
    title: 'Monsoon Rain Alert Protocol',
    icon: CloudRain,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    desc: 'Activate indoor AC ballroom backup and covered walkways within 3 hours.',
  },
  {
    type: 'VENDOR_CANCELLATION',
    title: 'Critical Vendor Cancellation',
    icon: AlertTriangle,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    desc: 'Retrieve pre-vetted replacement providers and initiate contract recovery claims.',
  },
];

export default function ScenarioSimulatorTab({
  event,
  onRefresh,
}: ScenarioSimulatorTabProps) {
  const [selectedType, setSelectedType] = useState('BUDGET_CUT_20');
  const [simulation, setSimulation] = useState<ScenarioSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const runSimulation = async (type: string) => {
    setSelectedType(type);
    setLoading(true);
    setApplyMessage(null);

    try {
      const res = await fetch(`/api/events/${event.id}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE', scenarioType: type }),
      });
      const data = await res.json();
      if (data.success && data.simulation) {
        setSimulation(data.simulation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!simulation) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/events/${event.id}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPLY', scenarioType: simulation.scenarioType }),
      });
      const data = await res.json();
      if (data.success) {
        setApplyMessage(data.message || 'Changes successfully applied to your workspace!');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-coral-400" />
          What-If Scenario Simulator & Contingency Lab
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Stress-test your event against sudden disruptions. Review comparative metric diffs, trade-offs, and
          approve proposed changes before applying them to your live event database.
        </p>
      </div>

      {/* Scenario Chooser Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedType === sc.type;
          return (
            <button
              key={sc.type}
              onClick={() => runSimulation(sc.type)}
              className={`p-5 rounded-2xl glass-panel text-left flex flex-col justify-between transition-all border ${
                isSelected
                  ? 'border-coral-500 bg-coral-500/10 shadow-lg shadow-coral-500/10'
                  : 'border-white/10 hover:border-white/20 bg-midnight-900/80'
              }`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl ${sc.bg} ${sc.color} ${sc.border} border flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">{sc.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sc.desc}</p>
              </div>

              <span className={`text-[11px] font-semibold mt-4 flex items-center gap-1 ${isSelected ? 'text-coral-400' : 'text-slate-400'}`}>
                {isSelected ? 'Simulated & Active' : 'Simulate Scenario &rarr;'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Application Success Feedback */}
      {applyMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{applyMessage}</span>
        </div>
      )}

      {/* Simulation Result Diff View */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 glass-panel rounded-3xl animate-pulse">
          <Zap className="w-6 h-6 text-coral-400 mx-auto mb-2 animate-spin" />
          Computing contingency metrics and trade-offs...
        </div>
      ) : simulation ? (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel bg-midnight-900/90 border border-white/15 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-coral-500/20 text-coral-400 border border-coral-500/30">
                  Simulation Outcome
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {simulation.impactLevel} Impact Level
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mt-1">
                {simulation.scenarioTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{simulation.scenarioDescription}</p>
            </div>

            {/* Approve & Apply Button */}
            <button
              onClick={handleApplyChanges}
              disabled={applying}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-coral-500 via-rose-600 to-violet-600 hover:from-coral-600 hover:to-violet-700 text-white font-bold text-xs shadow-xl shadow-coral-500/25 flex items-center justify-center gap-2 self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {applying ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Applying Changes...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Apply to Workspace</span>
                </>
              )}
            </button>
          </div>

          {/* Metrics Diff Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {simulation.metricsDiff.map((metric, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-2">
                <p className="text-slate-400 font-medium">{metric.label}</p>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Current</span>
                    <span className="text-sm font-semibold text-slate-300">{metric.before}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Proposed</span>
                    <span className="text-sm font-bold text-coral-400">{metric.after}</span>
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-emerald-400 pt-1 border-t border-white/5">
                  {metric.changeText}
                </p>
              </div>
            ))}
          </div>

          {/* Trade-Offs & Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {/* Proposed Trade-Offs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Proposed Trade-Offs & Adjustments
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {simulation.tradeOffs.map((trade, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{trade}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Corrective Tasks */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-coral-400" />
                Corrective Tasks to be Auto-Scheduled
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {simulation.suggestedTasks.map((t, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{t.title}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300">
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{t.actionReason}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
          Click any scenario card above to inspect live comparative simulations.
        </div>
      )}
    </div>
  );
}
