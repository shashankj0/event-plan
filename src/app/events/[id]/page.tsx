'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Compass,
  Sparkles,
  Zap,
  Bot,
  Building2,
  Printer,
  ShieldCheck,
  Layers,
  AlertCircle,
} from 'lucide-react';
import WorkspaceHeader from '@/features/events/components/WorkspaceHeader';
import HealthOverviewTab from '@/features/events/components/HealthOverviewTab';
import BudgetTab from '@/features/events/components/BudgetTab';
import TimelineTasksTab from '@/features/events/components/TimelineTasksTab';
import GuestsRsvpTab from '@/features/events/components/GuestsRsvpTab';
import VenueSeatingTab from '@/features/events/components/VenueSeatingTab';
import VendorsTab from '@/features/events/components/VendorsTab';
import CreativeStudioTab from '@/features/events/components/CreativeStudioTab';
import ScenarioSimulatorTab from '@/features/events/components/ScenarioSimulatorTab';
import CopilotTab from '@/features/events/components/CopilotTab';
import CollaborationTab from '@/features/events/components/CollaborationTab';
import RunOfShowTab from '@/features/events/components/RunOfShowTab';
import { calculateEventHealth } from '@/lib/ai/health';

const TABS = [
  { id: 'overview', label: 'Health Overview', icon: TrendingUp },
  { id: 'budget', label: 'Adaptive Budget', icon: DollarSign },
  { id: 'timeline', label: 'Timeline & Tasks', icon: Clock },
  { id: 'guests', label: 'Guests & RSVPs', icon: Users },
  { id: 'venue', label: 'Venue & Seating', icon: Building2 },
  { id: 'vendors', label: 'Vendors & Quotes', icon: Compass },
  { id: 'studio', label: 'Creative Studio', icon: Sparkles },
  { id: 'scenarios', label: 'Scenario Simulator', icon: Zap },
  { id: 'copilot', label: 'Event Copilot', icon: Bot },
  { id: 'collaboration', label: 'Collaboration', icon: ShieldCheck },
  { id: 'runofshow', label: 'Run of Show & Print', icon: Printer },
];

export default function EventWorkspacePage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [eventData, setEventData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('ORGANIZER');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventWorkspace();
  }, [eventId]);

  const fetchEventWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);

      // Read current demo user id from localStorage if present
      const userId = localStorage.getItem('eventverse-user-id');
      const headers: Record<string, string> = {};
      if (userId) headers['x-user-id'] = userId;

      const res = await fetch(`/api/events/${eventId}`, { headers });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load event workspace.');
      }

      setEventData(data.event);
      setUserRole(data.userRole || 'ORGANIZER');
    } catch (err: any) {
      console.error('Workspace fetch error:', err);
      setError(err.message || 'Error connecting to event workspace.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Sparkles className="w-8 h-8 text-coral-400 mx-auto mb-3 animate-spin" />
        <h2 className="text-xl font-serif font-bold text-white">Loading Event Workspace...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Synchronizing budget charts, critical-path dependencies, and AI copilot context.
        </p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl glass-panel border border-rose-500/30 bg-rose-500/10 space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied or Event Not Found</h2>
          <p className="text-xs text-rose-200">{error || 'Unable to open this event workspace.'}</p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/events')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Return to Events Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic health score
  const health = calculateEventHealth({
    budgetTotal: eventData.budgetTotal,
    guestCount: eventData.guestCount,
    budgetCategories: eventData.budget?.categories,
    tasks: eventData.tasks,
    vendors: eventData.vendors,
    guests: eventData.guests,
    risks: eventData.risks,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Workspace Header */}
      <WorkspaceHeader
        event={eventData}
        health={health}
        userRole={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 no-print border-b border-white/10">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-coral-500 to-rose-600 text-white shadow-lg shadow-coral-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <HealthOverviewTab event={eventData} health={health} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'budget' && (
          <BudgetTab event={eventData} onRefresh={fetchEventWorkspace} />
        )}
        {activeTab === 'timeline' && (
          <TimelineTasksTab event={eventData} onRefresh={fetchEventWorkspace} />
        )}
        {activeTab === 'guests' && (
          <GuestsRsvpTab event={eventData} onRefresh={fetchEventWorkspace} />
        )}
        {activeTab === 'venue' && (
          <VenueSeatingTab event={eventData} />
        )}
        {activeTab === 'vendors' && (
          <VendorsTab event={eventData} onRefresh={fetchEventWorkspace} />
        )}
        {activeTab === 'studio' && (
          <CreativeStudioTab event={eventData} />
        )}
        {activeTab === 'scenarios' && (
          <ScenarioSimulatorTab event={eventData} onRefresh={fetchEventWorkspace} />
        )}
        {activeTab === 'copilot' && (
          <CopilotTab event={eventData} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'collaboration' && (
          <CollaborationTab event={eventData} onRefresh={fetchEventWorkspace} />
        )}
        {activeTab === 'runofshow' && (
          <RunOfShowTab event={eventData} />
        )}
      </div>
    </div>
  );
}
