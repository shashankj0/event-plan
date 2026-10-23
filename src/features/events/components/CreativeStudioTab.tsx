'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Palette,
  UtensilsCrossed,
  Mail,
  Copy,
  Check,
  Music,
  Camera,
  Share2,
  Bookmark,
} from 'lucide-react';

interface CreativeStudioTabProps {
  event: any;
}

export default function CreativeStudioTab({ event }: CreativeStudioTabProps) {
  const [studioData, setStudioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchStudioAssets();
  }, [event.id]);

  const fetchStudioAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${event.id}/studio`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.studioAssets) {
        setStudioData(data.studioAssets);
      }
    } catch (err) {
      console.error('Error fetching creative studio assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 glass-panel rounded-3xl animate-pulse">
        <Sparkles className="w-6 h-6 text-coral-400 mx-auto mb-2 animate-spin" />
        Curating personalized creative studio assets...
      </div>
    );
  }

  if (!studioData) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coral-400" />
            AI Creative Event Studio
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Personalized color palettes, multi-course menus, invitation drafts, and social media kits.
          </p>
        </div>
      </div>

      {/* 1. Curated Color Palette */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
        <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-coral-400" />
          Harmonious Event Color Palette
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {studioData.colorPalette?.map((color: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2.5 flex flex-col justify-between"
            >
              <div
                className="w-full h-16 rounded-xl shadow-inner border border-white/10"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <p className="text-xs font-bold text-white truncate">{color.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{color.role}</p>
              </div>
              <button
                onClick={() => copyToClipboard(color.hex, `hex-${idx}`)}
                className="text-[10px] font-mono font-semibold text-slate-300 hover:text-coral-300 flex items-center justify-between pt-1 border-t border-white/5"
              >
                <span>{color.hex}</span>
                {copiedKey === `hex-${idx}` ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Tailored Multi-Course Menu */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
        <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-coral-400" />
          Tailored Culinary Tasting & Feast Menu
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studioData.curatedMenu?.map((course: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-coral-400 uppercase tracking-wider">
                {course.course}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {course.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Invitation Drafts */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
        <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-coral-400" />
          Invitation Drafts with RSVP Callouts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studioData.invitations?.map((inv: any, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-4 text-xs"
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300">
                  {inv.style}
                </span>
                <h4 className="font-serif font-bold text-white text-sm mt-2">{inv.heading}</h4>
                <p className="text-slate-300 mt-2 leading-relaxed">{inv.content}</p>
                {inv.dressCode && (
                  <p className="text-[11px] text-amber-300 mt-3 font-medium">Dress: {inv.dressCode}</p>
                )}
              </div>

              <button
                onClick={() =>
                  copyToClipboard(`${inv.heading}\n\n${inv.content}\n\nDress Code: ${inv.dressCode}`, `inv-${idx}`)
                }
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedKey === `inv-${idx}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Invitation Text</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Social Media Kit & Photo Booth Concept */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Booth */}
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-3 text-xs">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-coral-400" />
            Photo Booth & Props Concept
          </h3>
          <p className="font-bold text-coral-300">{studioData.photoBoothConcept?.title}</p>
          <p className="text-slate-300 leading-relaxed">{studioData.photoBoothConcept?.description}</p>
        </div>

        {/* Music Playlist Vibes */}
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-3 text-xs">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-coral-400" />
            Acoustic Playlist & Ragas
          </h3>
          <div className="space-y-2">
            {studioData.playlistVibes?.map((pl: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <p className="font-bold text-white text-[11px]">{pl.phase}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{pl.genre}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
