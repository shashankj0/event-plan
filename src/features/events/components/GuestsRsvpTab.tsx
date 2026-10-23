'use client';

import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Accessibility,
  UtensilsCrossed,
  Search,
  AlertTriangle,
  Send,
} from 'lucide-react';

interface GuestsRsvpTabProps {
  event: any;
  onRefresh: () => void;
}

export default function GuestsRsvpTab({ event, onRefresh }: GuestsRsvpTabProps) {
  const guests = event.guests || [];
  const tables = event.seatingTables || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // New guest state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [household, setHousehold] = useState('');
  const [dietary, setDietary] = useState('Vegetarian');
  const [accessibility, setAccessibility] = useState('None');
  const [plusOneAllowed, setPlusOneAllowed] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute metrics
  const totalGuests = guests.length;
  const acceptedCount = guests.filter((g: any) => g.rsvp?.status === 'ACCEPTED').length;
  const pendingCount = guests.filter((g: any) => !g.rsvp || g.rsvp.status === 'PENDING').length;
  const vegCount = guests.filter((g: any) => g.dietary && g.dietary.toLowerCase().includes('veg')).length;
  const accessCount = guests.filter(
    (g: any) => g.accessibility && !g.accessibility.toLowerCase().includes('none')
  ).length;

  // Filter guests
  const filteredGuests = guests.filter((g: any) => {
    const matchesSearch =
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.household && g.household.toLowerCase().includes(searchQuery.toLowerCase()));

    const status = g.rsvp?.status || 'PENDING';
    const matchesRsvp = rsvpFilter === 'ALL' || status === rsvpFilter;

    return matchesSearch && matchesRsvp;
  });

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          household: household.trim() || null,
          dietary: dietary || null,
          accessibility: accessibility !== 'None' ? accessibility : null,
          plusOneAllowed,
          tableId: selectedTableId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to add guest');
      } else {
        setShowAddModal(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRsvp = async (guestId: string, newStatus: string) => {
    try {
      await fetch(`/api/events/${event.id}/guests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, rsvpStatus: newStatus }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    const parsedRows: any[] = [];

    // Parse simple CSV (First,Last,Email,Phone,Dietary)
    lines.forEach((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        parsedRows.push({
          firstName: cols[0],
          lastName: cols[1],
          email: cols[2] || undefined,
          phone: cols[3] || undefined,
          dietary: cols[4] || 'Vegetarian',
        });
      }
    });

    if (parsedRows.length === 0) {
      setImportStatus('No valid guest rows detected.');
      return;
    }

    try {
      const res = await fetch(`/api/events/${event.id}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: parsedRows }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportStatus(
          `Successfully added ${data.addedCount} guests! (${data.skippedDuplicates} duplicate records safely skipped).`
        );
        setTimeout(() => {
          setShowImportModal(false);
          setCsvText('');
          setImportStatus(null);
          onRefresh();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setImportStatus('Error importing CSV.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Metric Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Invited Headcount</p>
          <p className="text-2xl font-bold text-white mt-1">{totalGuests}</p>
          <span className="text-[10px] text-slate-400">Total invitees</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Confirmed RSVPs</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{acceptedCount}</p>
          <span className="text-[10px] text-emerald-400">
            {totalGuests > 0 ? Math.round((acceptedCount / totalGuests) * 100) : 0}% acceptance rate
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Dietary Requirements</p>
          <p className="text-2xl font-bold text-coral-400 mt-1">{vegCount} Pure Veg</p>
          <span className="text-[10px] text-slate-400">Includes Jain options</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Accessibility Requests</p>
          <p className="text-2xl font-bold text-violet-400 mt-1">{accessCount} Priority</p>
          <span className="text-[10px] text-slate-400">Ramps & ground floor</span>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, household..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-panel bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <a
            href={`/api/events/${event.id}/export?format=guests-csv`}
            download
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Import CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white font-semibold text-xs shadow-lg shadow-coral-500/20 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Guest Roster Table */}
      <div className="rounded-3xl glass-panel bg-midnight-900 border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-coral-400" />
            Guest Directory & RSVP Tracker
          </h3>

          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'ACCEPTED', 'PENDING', 'TENTATIVE', 'DECLINED'].map((st) => (
              <button
                key={st}
                onClick={() => setRsvpFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                  rsvpFilter === st
                    ? 'bg-coral-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No matching guests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02]">
                  <th className="py-3 px-5 font-semibold">Guest Name</th>
                  <th className="py-3 px-4 font-semibold">Household</th>
                  <th className="py-3 px-4 font-semibold">RSVP Status</th>
                  <th className="py-3 px-4 font-semibold">Dietary & Allergens</th>
                  <th className="py-3 px-4 font-semibold">Accessibility</th>
                  <th className="py-3 px-4 font-semibold">Seating Table</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGuests.map((g: any) => {
                  const status = g.rsvp?.status || 'PENDING';
                  return (
                    <tr key={g.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-white">
                          {g.firstName} {g.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400">{g.email || g.phone || 'No direct contact'}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{g.household || 'Individual'}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={status}
                          onChange={(e) => handleUpdateRsvp(g.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border focus:outline-none ${
                            status === 'ACCEPTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          <option value="ACCEPTED" className="bg-midnight-900">ACCEPTED</option>
                          <option value="PENDING" className="bg-midnight-900">PENDING</option>
                          <option value="TENTATIVE" className="bg-midnight-900">TENTATIVE</option>
                          <option value="DECLINED" className="bg-midnight-900">DECLINED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-coral-400" />
                          {g.dietary || 'Standard Veg'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {g.accessibility && !g.accessibility.toLowerCase().includes('none') ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1 w-fit">
                            <Accessibility className="w-3 h-3" />
                            {g.accessibility}
                          </span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {g.table ? `Table ${g.table.tableNumber} - ${g.table.tableName}` : 'Unassigned'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-3xl glass-panel bg-midnight-900 border border-white/15 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-coral-400" />
                Add New Guest
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dietary Preference</label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Jain Vegetarian">Jain Vegetarian</option>
                    <option value="Nut-Free Vegetarian">Nut-Free Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Accessibility</label>
                  <select
                    value={accessibility}
                    onChange={(e) => setAccessibility(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Wheelchair Ramp Access">Wheelchair Ramp Access</option>
                    <option value="Elderly Priority Seating">Elderly Priority Seating</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assign to Seating Table</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                >
                  <option value="">Unassigned (Decide Later)</option>
                  {tables.map((t: any) => (
                    <option key={t.id} value={t.id} className="bg-midnight-900">
                      Table {t.tableNumber} - {t.tableName} ({t.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 text-white font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-3xl glass-panel bg-midnight-900 border border-white/15 max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-coral-400" />
                Batch Import Guests via CSV
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Paste comma-separated rows in format:{' '}
              <code className="text-coral-300">FirstName, LastName, Email, Phone, Dietary</code>.
              Duplicates will be automatically detected and safely skipped.
            </p>

            <form onSubmit={handleCsvImport} className="space-y-4 text-xs">
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Dattatray, Patil, dattatray@gmail.com, +9198221, Jain Vegetarian\nSunita, Kulkarni, sunita@yahoo.com, +9198224, Nut-Free Vegetarian\nAmey, Joshi, amey@gmail.com, +9198225, Vegetarian`}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono placeholder-slate-500 focus:outline-none"
              />

              {importStatus && (
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {importStatus}
                </p>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 text-white font-semibold"
                >
                  Process & Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
