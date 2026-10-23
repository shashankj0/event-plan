'use client';

import React, { useState } from 'react';
import {
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Flag,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface TimelineTasksTabProps {
  event: any;
  onRefresh: () => void;
}

export default function TimelineTasksTab({ event, onRefresh }: TimelineTasksTabProps) {
  const tasks = event.tasks || [];
  const timelineItems = event.timelineItems || [];

  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('VENUE');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [isCritical, setIsCritical] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle task completion status
  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await fetch(`/api/events/${event.id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: nextStatus }),
      });
      onRefresh();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim() || null,
          category: taskCategory,
          priority: taskPriority,
          isCriticalPath: isCritical,
          dueDate: taskDueDate || null,
          status: 'TODO',
        }),
      });

      if (res.ok) {
        setShowTaskModal(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskDueDate('');
        setIsCritical(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered task list
  const filteredTasks = tasks.filter((t: any) => {
    if (filterMode === 'CRITICAL') return t.isCriticalPath;
    if (filterMode === 'PENDING') return t.status !== 'COMPLETED';
    if (filterMode === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const criticalCount = tasks.filter((t: any) => t.isCriticalPath).length;
  const completedCount = tasks.filter((t: any) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Milestone Banner */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-coral-400" />
            Dynamic Timeline & Critical-Path Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Tracking {tasks.length} total tasks with {criticalCount} critical-path milestones locking vendor contracts.
          </p>
        </div>

        <button
          onClick={() => setShowTaskModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white font-semibold text-xs shadow-lg shadow-coral-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Timeline Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { key: 'ALL', label: `All Tasks (${tasks.length})` },
          { key: 'CRITICAL', label: `Critical Path (${criticalCount})` },
          { key: 'PENDING', label: `Incomplete (${tasks.length - completedCount})` },
          { key: 'COMPLETED', label: `Completed (${completedCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterMode(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors ${
              filterMode === tab.key
                ? 'bg-coral-500 text-white font-semibold shadow-md shadow-coral-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List Table / Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-xs text-slate-400">
            No tasks match the selected filter.
          </div>
        ) : (
          filteredTasks.map((task: any) => {
            const isDone = task.status === 'COMPLETED';
            const dueDateFormatted = task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Flexible';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl glass-panel border transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? 'bg-white/[0.02] border-white/5 opacity-70'
                    : 'bg-midnight-900/80 border-white/10 hover:border-coral-500/30'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-500 hover:border-coral-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h4>

                      {task.isCriticalPath && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-coral-500/20 text-coral-400 border border-coral-500/30 flex items-center gap-1">
                          <Flag className="w-3 h-3 text-coral-400" /> Critical Path
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-500/20 text-rose-400'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-400">
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 text-xs">
                  <p className="text-slate-400 font-medium">Due {dueDateFormatted}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{task.assignedTo || 'Unassigned'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule of the Day / Run of Show Milestones */}
      {timelineItems.length > 0 && (
        <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-coral-400" />
            Official Day-of-Event Run of Show Schedule
          </h3>
          <div className="space-y-3">
            {timelineItems.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg font-mono font-bold bg-coral-500/10 text-coral-300 border border-coral-500/20 whitespace-nowrap">
                    {item.timeSlot}
                  </span>
                  <div>
                    <p className="font-bold text-white text-sm">{item.title}</p>
                    <p className="text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 self-start sm:self-auto">
                  {item.stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-3xl glass-panel bg-midnight-900 border border-white/15 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-coral-400" />
                Add Milestone Task
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Confirm backup indoor AC ballroom reservation"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Add specific vendor or delivery details..."
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="VENUE">VENUE</option>
                    <option value="CATERING">CATERING</option>
                    <option value="DECOR">DECOR</option>
                    <option value="GUESTS">GUESTS</option>
                    <option value="MUSIC">MUSIC</option>
                    <option value="LOGISTICS">LOGISTICS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="critical-path-checkbox"
                    checked={isCritical}
                    onChange={(e) => setIsCritical(e.target.checked)}
                    className="w-4 h-4 rounded text-coral-500 bg-white/10 border-white/10 focus:ring-0"
                  />
                  <label htmlFor="critical-path-checkbox" className="font-semibold text-white">
                    Critical Path Milestone
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 text-white font-semibold"
                >
                  {isSubmitting ? 'Adding...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
