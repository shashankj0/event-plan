'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  ShieldCheck,
  Share2,
  Printer,
  ChevronRight,
  Info,
  DollarSign,
  Users,
} from 'lucide-react';

interface WorkspaceHeaderProps {
  event: any;
  health: any;
  userRole?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function WorkspaceHeader({
  event,
  health,
  userRole,
  activeTab,
  setActiveTab,
}: WorkspaceHeaderProps) {
  const [showHealthModal, setShowHealthModal] = useState(false);

  const currencySymbol = event.currency === 'INR' ? '₹' : event.currency === 'USD' ? '$' : '€';
  const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate days remaining
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(event.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="relative rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 overflow-hidden mb-8 no-print">
      {/* Background Banner Ambient Image */}
      <div className="h-44 w-full relative overflow-hidden">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80'}
          alt={event.title}
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/60 to-transparent" />

        {/* Breadcrumb on Banner */}
        <div className="absolute top-4 left-6 flex items-center gap-2 text-xs text-slate-300">
          <Link href="/events" className="hover:text-white transition-colors">
            Events
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-coral-300 font-medium">{event.title}</span>
        </div>

        {/* Top Right Role Indicator */}
        <div className="absolute top-4 right-6 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Role: {userRole || 'ORGANIZER'}
          </span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="px-6 sm:px-8 pb-6 -mt-14 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Title & Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-coral-500/20 text-coral-400 border border-coral-500/30">
                {event.eventType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300 border border-white/10">
                {event.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-coral-400" />
                {eventDate} ({daysRemaining} days away)
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-coral-400" />
                {event.venueName ? `${event.venueName}, ` : ''}{event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-coral-400" />
                {event.guestCount} Guests
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-coral-400" />
                {currencySymbol}{event.budgetTotal.toLocaleString()} Budget
              </span>
            </div>
          </div>

          {/* Health Score Gauge Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHealthModal(true)}
              className="p-3 sm:px-5 sm:py-3 rounded-2xl glass-panel bg-white/5 hover:bg-white/10 border border-white/15 flex items-center gap-3 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-coral-500/20 to-violet-500/20 border border-coral-500/30 flex items-center justify-center font-bold text-coral-400 text-lg">
                {health?.overallScore || 88}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Health Score
                  </p>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                  {health?.statusLevel || 'Optimal Readiness'}
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('runofshow')}
              className="p-3 sm:px-4 sm:py-3 rounded-2xl glass-panel bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
            >
              <Printer className="w-4 h-4 text-coral-400" />
              <span className="hidden sm:inline">Print Run-of-Show</span>
            </button>
          </div>
        </div>
      </div>

      {/* Health Score Explainability Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-3xl glass-panel bg-midnight-900 border border-white/15 max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-coral-500/20 text-coral-400 flex items-center justify-center font-bold text-lg">
                  {health?.overallScore || 88}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Event Readiness Health Score</h3>
                  <p className="text-xs text-slate-400">Explainable breakdown of readiness drivers</p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Factors breakdown */}
            <div className="space-y-3">
              {health?.breakdown?.map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.factor}</span>
                    <span className="text-coral-400 font-bold">
                      {item.score} / {item.maxScore} ({item.weight})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Note: Health score is an explainable decision-support metric and does not guarantee event outcomes.
            </p>

            <button
              onClick={() => setShowHealthModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
