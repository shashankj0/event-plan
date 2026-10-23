'use client';

import React, { useState } from 'react';
import {
  Compass,
  PlusCircle,
  Star,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Building2,
  UtensilsCrossed,
  Music,
  Camera,
  Sparkles,
} from 'lucide-react';

interface VendorsTabProps {
  event: any;
  onRefresh: () => void;
}

export default function VendorsTab({ event, onRefresh }: VendorsTabProps) {
  const vendors = event.vendors || [];
  const currencySymbol = event.currency === 'INR' ? '₹' : event.currency === 'USD' ? '$' : '€';

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Decor & Mandap');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteInclusions, setQuoteInclusions] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState('4.8');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status update
  const handleUpdateStatus = async (vendorId: string, newStatus: string) => {
    try {
      await fetch(`/api/events/${event.id}/vendors`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vendorName.trim(),
          category: vendorCategory,
          contactName: contactName.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          rating: Number(rating) || 4.8,
          quoteAmount: quoteAmount ? Number(quoteAmount) : undefined,
          quoteInclusions: quoteInclusions.trim() || undefined,
          notes: notes.trim() || null,
          status: 'DISCOVERED',
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setVendorName('');
        setContactName('');
        setPhone('');
        setEmail('');
        setQuoteAmount('');
        setQuoteInclusions('');
        setNotes('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVendors = vendors.filter((v: any) => {
    if (categoryFilter === 'ALL') return true;
    return v.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const bookedCount = vendors.filter((v: any) => v.status === 'BOOKED').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-coral-400" />
            Vendor Intelligence & Quotation Matrix
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Tracking {vendors.length} vendor categories with {bookedCount} confirmed contracts signed.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white font-semibold text-xs shadow-lg shadow-coral-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'Decor', 'Catering', 'Photography', 'Music'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-coral-500 text-white font-semibold shadow-md shadow-coral-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {cat === 'ALL' ? 'All Vendors' : cat}
          </button>
        ))}
      </div>

      {/* Vendors Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVendors.map((vendor: any) => {
          const latestQuote = vendor.quotes?.[0];
          const isBooked = vendor.status === 'BOOKED';

          return (
            <div
              key={vendor.id}
              className={`p-6 rounded-3xl glass-panel border transition-all flex flex-col justify-between space-y-4 ${
                isBooked
                  ? 'bg-midnight-900/90 border-emerald-500/30'
                  : 'bg-midnight-900/80 border-white/10 hover:border-coral-500/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-coral-500/20 text-coral-300 border border-coral-500/30">
                      {vendor.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{vendor.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{vendor.rating}</span>
                  </div>
                </div>

                {/* Contact information */}
                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  {vendor.contactName && (
                    <p className="font-medium text-white">Lead: {vendor.contactName}</p>
                  )}
                  {vendor.phone && (
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3 h-3 text-coral-400" /> {vendor.phone}
                    </p>
                  )}
                  {vendor.email && (
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3 h-3 text-coral-400" /> {vendor.email}
                    </p>
                  )}
                </div>

                {/* Quotation Details */}
                {latestQuote && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Estimated Quotation</span>
                      <span className="font-bold text-coral-400 text-sm">
                        {currencySymbol}{latestQuote.amount.toLocaleString()}
                      </span>
                    </div>
                    {latestQuote.inclusions && (
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        Deliverables: {latestQuote.inclusions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Status Selector & Notes */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Booking Pipeline Status
                  </label>
                  <select
                    value={vendor.status}
                    onChange={(e) => handleUpdateStatus(vendor.id, e.target.value)}
                    className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl border focus:outline-none ${
                      isBooked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/5 text-slate-200 border-white/10'
                    }`}
                  >
                    <option value="DISCOVERED" className="bg-midnight-900">DISCOVERED</option>
                    <option value="CONTACTED" className="bg-midnight-900">CONTACTED</option>
                    <option value="QUOTED" className="bg-midnight-900">QUOTED</option>
                    <option value="SHORTLISTED" className="bg-midnight-900">SHORTLISTED</option>
                    <option value="BOOKED" className="bg-midnight-900">BOOKED & SIGNED</option>
                    <option value="DECLINED" className="bg-midnight-900">DECLINED</option>
                  </select>
                </div>

                {isBooked && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Scope Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-3xl glass-panel bg-midnight-900 border border-white/15 max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-coral-400" />
                Add Vendor Profile
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Vendor / Studio Name</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Sanskriti Mandap"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Decor & Mandap">Decor & Mandap</option>
                    <option value="Catering">Catering</option>
                    <option value="Photography">Photography</option>
                    <option value="Music & Audio">Music & Audio</option>
                    <option value="Attire & Styling">Attire & Styling</option>
                    <option value="Venue">Venue</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Lead</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Suresh Kadam"
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
                  <label className="block font-semibold text-slate-300 mb-1">Quote Amount (₹)</label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="120000"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Verified Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Scope & Deliverables</label>
                <textarea
                  rows={2}
                  value={quoteInclusions}
                  onChange={(e) => setQuoteInclusions(e.target.value)}
                  placeholder="e.g. Marigold mandap, stage brass diyas, 2 welcome arches..."
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                />
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
                  {isSubmitting ? 'Adding...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
