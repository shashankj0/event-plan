'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface CopilotTabProps {
  event: any;
  setActiveTab: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: string[];
  timestamp: string;
}

const PRESET_QUERIES = [
  'What are my three most urgent tasks?',
  'How much money remains in the budget?',
  'What happens if 25 additional guests attend?',
  'What is our rain and weather contingency plan?',
  'Which decisions are still pending with vendors?',
];

export default function CopilotTab({ event, setActiveTab }: CopilotTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hello! I am your **EventVerse AI Copilot** grounded strictly in **${event.title}**.\n\nI have complete authorized visibility into your **₹${(event.budgetTotal / 100000).toFixed(1)} Lakh budget**, **${event.tasks?.length || 0} timeline tasks**, **${event.guestCount} guests**, and vendor contracts.\n\nWhat would you like to review or solve today?`,
      suggestedActions: [
        'What are my three most urgent tasks?',
        'How much money remains in the budget?',
      ],
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const assistantMsg: ChatMessage = {
          id: data.messageId || `ast_${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          suggestedActions: data.suggestedActions || [],
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to receive response.');
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue querying the event context. Please try again.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-coral-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              EventVerse Grounded Copilot
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Authorized Event Context
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Grounded strictly in {event.title}&apos;s live database state. Zero cross-user data leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {PRESET_QUERIES.map((query, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(query)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl glass-panel bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors text-left flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-coral-400 flex-shrink-0" />
            <span>{query}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel bg-midnight-900/80 border border-white/10 min-h-[420px] max-h-[550px] overflow-y-auto space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coral-500 to-rose-600 flex items-center justify-center text-white font-bold flex-shrink-0 mt-1 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-coral-500 to-rose-600 text-white font-medium rounded-br-none shadow-lg shadow-coral-500/10'
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              {msg.content}

              {/* Suggested Follow-up Actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-coral-400">
                    Suggested Next Actions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(act)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3 text-coral-400" />
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-coral-400 animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Event Copilot analyzing database context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-2 rounded-2xl glass-panel bg-midnight-900 border border-white/15 flex items-center gap-2 focus-within:border-coral-500/60 transition-colors shadow-2xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about budget, tasks, guests, vendors, or weather contingencies..."
          className="w-full bg-transparent px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white font-semibold text-xs shadow-md shadow-coral-500/20 flex items-center gap-1.5 disabled:opacity-50 transition-all"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
