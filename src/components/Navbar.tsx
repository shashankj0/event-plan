'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  PlusCircle,
  Sun,
  Moon,
  Users,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { DEMO_USERS } from '@/lib/auth/session';

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('eventverse-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // Check saved user
    const savedUserId = localStorage.getItem('eventverse-user-id');
    if (savedUserId) {
      const u = DEMO_USERS.find((x) => x.id === savedUserId);
      if (u) setCurrentUser(u);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('eventverse-theme', nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
  };

  const switchUser = (user: (typeof DEMO_USERS)[0]) => {
    setCurrentUser(user);
    localStorage.setItem('eventverse-user-id', user.id);
    setShowUserMenu(false);
    // Reload page to reflect user permissions
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral-500 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-coral-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-white via-ivory-100 to-coral-400 bg-clip-text text-transparent">
                EventVerse
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-coral-500/10 text-coral-400 border border-coral-500/20">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Intelligent Event Copilot
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/events"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              pathname === '/events'
                ? 'bg-white/10 text-coral-400 border border-white/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events Dashboard
          </Link>
          <Link
            href="/events/event_wedding_pune_01"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              pathname.includes('event_wedding_pune_01')
                ? 'bg-white/10 text-coral-400 border border-white/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            Pune Wedding Demo
          </Link>
          <Link
            href="/events/new"
            className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white shadow-lg shadow-coral-500/25 flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            Plan New Event
          </Link>
        </nav>

        {/* Right Controls: Theme Toggle & User Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* User Persona Switcher (For IDOR & Role demonstration) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-coral-500 flex items-center justify-center text-white text-[10px] font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-medium text-white truncate max-w-[100px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl glass-panel bg-midnight-900 border border-white/15 shadow-2xl p-2 z-50 animate-slide-up">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Switch Planner Persona
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Test RBAC & IDOR authorization rules</p>
                </div>
                <div className="mt-1 space-y-1">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-coral-500/20 text-coral-300 font-semibold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {u.role} ({u.email})
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
