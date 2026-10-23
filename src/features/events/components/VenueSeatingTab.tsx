'use client';

import React, { useState } from 'react';
import {
  Building2,
  Users,
  Accessibility,
  CloudRain,
  MapPin,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface VenueSeatingTabProps {
  event: any;
}

export default function VenueSeatingTab({ event }: VenueSeatingTabProps) {
  const tables = event.seatingTables || [];
  const pref = event.preference;
  const [selectedZone, setSelectedZone] = useState('ALL');

  const filteredTables = tables.filter((t: any) => {
    if (selectedZone === 'ALL') return true;
    return t.zone.toUpperCase() === selectedZone.toUpperCase();
  });

  const totalSeats = tables.reduce((sum: number, t: any) => sum + t.capacity, 0);
  const assignedGuests = tables.reduce((sum: number, t: any) => sum + (t.guests?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Venue Architecture & Rain Contingency Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-coral-500/20 text-coral-400 border border-coral-500/30">
              Primary Venue
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
              <CloudRain className="w-3 h-3" /> Rain Standby Secured
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            {event.venueName || 'The Maratha Heritage Lawns & Grand Ballroom'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-coral-400" />
            {event.location} — Capacity: 400 Pax (Fire Clearance Verified)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 max-w-sm text-xs">
          <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Accessibility className="w-4 h-4 text-emerald-400" />
            Zero-Step ADA & Elder Access
          </p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Wooden anti-slip ramps installed to stage. Golf cart shuttles stationed at drop-off gate.
          </p>
        </div>
      </div>

      {/* Seating Layout Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel text-xs">
          <p className="text-slate-400 font-medium">Configured Tables</p>
          <p className="text-xl font-bold text-white mt-0.5">{tables.length} Tables</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel text-xs">
          <p className="text-slate-400 font-medium">Seating Capacity</p>
          <p className="text-xl font-bold text-white mt-0.5">{totalSeats} Seats</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel text-xs">
          <p className="text-slate-400 font-medium">Assigned Guests</p>
          <p className="text-xl font-bold text-coral-400 mt-0.5">{assignedGuests} Placed</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel text-xs">
          <p className="text-slate-400 font-medium">Unseated / Open</p>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{totalSeats - assignedGuests} Available</p>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex items-center gap-2 text-xs">
        {['ALL', 'VIP', 'MAIN_HALL', 'OUTDOOR'].map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors ${
              selectedZone === zone
                ? 'bg-coral-500 text-white font-semibold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {zone === 'ALL' ? 'All Floor Zones' : zone.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table Floor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((table: any) => {
          const seatedCount = table.guests?.length || 0;
          const isFull = seatedCount >= table.capacity;

          return (
            <div
              key={table.id}
              className="p-5 rounded-3xl glass-panel bg-midnight-900/80 border border-white/10 hover:border-coral-500/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-coral-500/20 text-coral-300 flex items-center justify-center font-mono text-xs font-bold">
                      {table.tableNumber}
                    </span>
                    {table.tableName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      table.zone === 'VIP'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    {table.zone}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <span>Shape: {table.shape}</span>
                  <span className={isFull ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {seatedCount} / {table.capacity} Seats Filled
                  </span>
                </div>

                {/* Seating Progress */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-coral-500 to-violet-500 rounded-full"
                    style={{ width: `${(seatedCount / table.capacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Assigned Guests List on Table */}
              <div className="pt-3 border-t border-white/5">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Placed Attendees</p>
                {seatedCount === 0 ? (
                  <p className="text-xs text-slate-500 italic">No guests currently assigned to this table.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {table.guests.map((g: any) => (
                      <span
                        key={g.id}
                        className="px-2 py-1 rounded-lg bg-white/5 text-[11px] text-slate-200 border border-white/5"
                      >
                        {g.firstName} {g.lastName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
