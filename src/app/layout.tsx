import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'EventVerse AI — Your Intelligent Event Planning Copilot',
  description:
    'Transform natural-language event ideas into production-ready event workspaces with dynamic budgets, timelines, guest RSVP tracking, vendor comparisons, and scenario simulators.',
  keywords: [
    'AI Event Planner',
    'Wedding Planning',
    'Corporate Event Management',
    'EventVerse AI',
    'Pune Wedding Planner',
    'Budget Intelligence',
    'Scenario Simulator',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-midnight-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-coral-500/30 selection:text-coral-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 glass-panel py-8 mt-20 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-slate-200">EventVerse AI</span>
              <span>— Intelligent Event Planning Platform</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Security-First Architecture</span>
              <span>Deterministic Demo Engine</span>
              <span>WCAG 2.2 AA Compliant</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
