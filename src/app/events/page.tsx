'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  PlusCircle,
  Sparkles,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  eventType: string;
  location: string;
  venueName?: string | null;
  startDate: string;
  guestCount: number;
  budgetTotal: number;
  currency: string;
  status: string;
  healthScore: number;
  coverImage?: string | null;
  budget?: {
    categories: { id: string; name: string; allocatedAmount: number; actualSpent: number }[];
  } | null;
  tasks?: { id: string; status: string; priority: string }[];
  guests?: { id: string; rsvp?: { status: string } }[];
  _count?: { tasks: number; guests: number; vendors: number };
}

export default function EventsDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.eventType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || ev.eventType.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Aggregate stats
  const totalBudget = events.reduce((sum, e) => sum + e.budgetTotal, 0);
  const totalGuests = events.reduce((sum, e) => sum + e.guestCount, 0);
  const avgHealth =
    events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.healthScore, 0) / events.length) : 85;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-coral-400" />
            Events Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor, plan, and orchestrate all active events across your organization.
          </p>
        </div>
        <Link
          href="/events/new"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-coral-500/25 flex items-center gap-2 self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Architect New Event
        </Link>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="p-5 rounded-2xl glass-panel">
          <p className="text-xs text-slate-400 font-medium">Active Events</p>
          <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Synchronized
          </span>
        </div>
        <div className="p-5 rounded-2xl glass-panel">
          <p className="text-xs text-slate-400 font-medium">Budget Managed</p>
          <p className="text-2xl font-bold text-white mt-1">₹{(totalBudget / 100000).toFixed(1)} Lakh</p>
          <span className="text-[10px] text-slate-400">Across all categories</span>
        </div>
        <div className="p-5 rounded-2xl glass-panel">
          <p className="text-xs text-slate-400 font-medium">Total Guest Headcount</p>
          <p className="text-2xl font-bold text-white mt-1">{totalGuests.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">With dietary tracking</span>
        </div>
        <div className="p-5 rounded-2xl glass-panel">
          <p className="text-xs text-slate-400 font-medium">Average Health Score</p>
          <p className="text-2xl font-bold text-coral-400 mt-1">{avgHealth} / 100</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Optimal Readiness
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, location, type..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-panel bg-white/5 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-coral-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'Wedding', 'Corporate', 'Birthday', 'College Festival'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === type
                  ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl glass-panel animate-pulse bg-white/5" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass-panel border border-dashed border-white/15 p-8">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No matching events found</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or create a new event with our natural-language architect.
          </p>
          <Link
            href="/events/new"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral-500 text-white font-semibold text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const currencySymbol = ev.currency === 'INR' ? '₹' : ev.currency === 'USD' ? '$' : '€';
            const spent = ev.budget?.categories.reduce((sum, c) => sum + c.actualSpent, 0) || 0;
            const pctSpent = ev.budgetTotal > 0 ? Math.round((spent / ev.budgetTotal) * 100) : 0;
            const completedTasks = ev.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;
            const totalTasks = ev.tasks?.length || ev._count?.tasks || 0;

            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="group rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between overflow-hidden border border-white/10 hover:border-coral-500/40"
              >
                {/* Event Image Cover */}
                <div className="h-44 w-full relative bg-slate-900 overflow-hidden">
                  <img
                    src={ev.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/30 to-transparent" />

                  {/* Badges on Cover */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10">
                      {ev.eventType}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-midnight-900/90 text-coral-400 border border-coral-500/30 backdrop-blur-md flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-coral-400" />
                      <span>{ev.healthScore} / 100</span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-coral-300 transition-colors line-clamp-1">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-coral-400" />
                      {ev.venueName ? `${ev.venueName}, ` : ''}{ev.location}
                    </p>
                  </div>
                </div>

                {/* Event Body Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Budget & Guests summary */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-slate-400 text-[10px] uppercase font-semibold">Budget</p>
                      <p className="font-bold text-white text-sm mt-0.5">
                        {currencySymbol}{ev.budgetTotal.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{pctSpent}% committed</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-slate-400 text-[10px] uppercase font-semibold">Guests</p>
                      <p className="font-bold text-white text-sm mt-0.5">{ev.guestCount} invited</p>
                      <p className="text-[10px] text-emerald-400 mt-0.5">RSVP active</p>
                    </div>
                  </div>

                  {/* Tasks progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span>Tasks Milestone Progress</span>
                      <span className="font-medium text-white">
                        {completedTasks} / {totalTasks} ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-coral-500 to-violet-500 rounded-full"
                        style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 20}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Enter Button */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-coral-400 group-hover:text-coral-300">
                    <span>Open AI Event Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
