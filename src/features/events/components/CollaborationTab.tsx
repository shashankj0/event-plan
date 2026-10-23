'use client';

import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  ShieldCheck,
  Send,
  Clock,
  CheckCircle2,
  UserPlus,
  History,
} from 'lucide-react';

interface CollaborationTabProps {
  event: any;
  onRefresh: () => void;
}

export default function CollaborationTab({ event, onRefresh }: CollaborationTabProps) {
  const comments = event.comments || [];
  const memberships = event.memberships || [];
  const auditLogs = event.auditLogs || [];

  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        setNewComment('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-coral-400" />
            Collaboration Workspace & Audit Trail
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Enforced server-side role permissions, real-time planner annotations, and activity audit logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Co-Planners & Team Roles */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Planning Team Members
              </h3>
              <span className="text-xs text-slate-400">{memberships.length + 1} Planners</span>
            </div>

            <div className="space-y-3">
              {/* Event Owner */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-coral-500 flex items-center justify-center text-white font-bold text-xs">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Ananya Sharma (Owner)</p>
                  <p className="text-[10px] text-slate-400">ananya@eventverse.ai</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-coral-500/20 text-coral-300">
                  ORGANIZER
                </span>
              </div>

              {/* Memberships */}
              {memberships.map((m: any) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                    {m.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{m.userName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{m.userEmail}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-white/5">
              Switch between users in the top-right navbar menu to verify role permissions and IDOR security controls.
            </p>
          </div>

          {/* Audit Log Feed */}
          <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-coral-400" />
              Activity Audit Trail
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No recent logged actions.</p>
              ) : (
                auditLogs.map((log: any) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">By: {log.performedBy}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Collaborative Planner Comments Feed */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
              <MessageSquare className="w-4 h-4 text-coral-400" />
              Planning Team Notes & Comments
            </h3>

            {/* Comments List */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  No comments posted yet. Leave an update for your co-planners below.
                </p>
              ) : (
                comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{comment.authorName}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/10 text-slate-300">
                          {comment.authorRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Comment Input */}
          <form onSubmit={handlePostComment} className="pt-4 border-t border-white/10 flex items-center gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave an operational note or update for co-planners..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isPosting || !newComment.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Post</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
