'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  PieChart,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface BudgetTabProps {
  event: any;
  onRefresh: () => void;
}

export default function BudgetTab({ event, onRefresh }: BudgetTabProps) {
  const budget = event.budget;
  const categories = budget?.categories || [];
  const currencySymbol = event.currency === 'INR' ? '₹' : event.currency === 'USD' ? '$' : '€';

  // Compute totals
  const totalAllocated = categories.reduce((sum: number, c: any) => sum + c.allocatedAmount, 0);
  const totalSpent = categories.reduce((sum: number, c: any) => sum + c.actualSpent, 0);
  const remainingBudget = Math.max(0, event.budgetTotal - totalSpent);
  const percentSpent = event.budgetTotal > 0 ? Math.round((totalSpent / event.budgetTotal) * 100) : 0;

  // Flatten all expenses
  const allExpenses: any[] = [];
  categories.forEach((cat: any) => {
    if (cat.expenses) {
      cat.expenses.forEach((exp: any) => {
        allExpenses.push({ ...exp, categoryName: cat.name });
      });
    }
  });

  // Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [expenseName, setExpenseName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contingency slider state
  const [contingencyPercent, setContingencyPercent] = useState(budget?.contingencyPercent || 10);
  const [isUpdatingContingency, setIsUpdatingContingency] = useState(false);

  // Check overspending
  const overspentCategories = categories.filter((c: any) => c.actualSpent > c.allocatedAmount);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim() || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          name: expenseName.trim(),
          estimatedCost: Number(estimatedCost) || 0,
          actualCost: Number(actualCost) || 0,
          paymentStatus,
          dueDate: dueDate || null,
        }),
      });

      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseName('');
        setEstimatedCost('');
        setActualCost('');
        onRefresh();
      }
    } catch (err) {
      console.error('Error logging expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContingencyChange = async (val: number) => {
    setContingencyPercent(val);
    setIsUpdatingContingency(true);
    try {
      await fetch(`/api/events/${event.id}/budget`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contingencyPercent: val }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingContingency(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Financial Dashboard Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Total Target Budget</p>
          <p className="text-2xl font-bold text-white mt-1">
            {currencySymbol}{event.budgetTotal.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Guaranteed budget ceiling</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Actual Committed/Paid</p>
          <p className="text-2xl font-bold text-coral-400 mt-1">
            {currencySymbol}{totalSpent.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">{percentSpent}% of total spent</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Remaining Uncommitted</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {currencySymbol}{remainingBudget.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400">Healthy liquidity</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Emergency Contingency</p>
          <p className="text-2xl font-bold text-violet-400 mt-1">
            {currencySymbol}{(budget?.contingencyReserve || 80000).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">{contingencyPercent}% safety reserve</span>
        </div>
      </div>

      {/* Overspending & Trade-Offs Alert if needed */}
      {overspentCategories.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Overspending Detected in {overspentCategories.map((c: any) => c.name).join(', ')}
          </div>
          <p>
            Actual commitments exceed planned allocations. AI recommends executing budget trade-offs:
            substitute imported blooms with local marigolds (-₹20,000), or adjust dessert counters.
          </p>
        </div>
      )}

      {/* Contingency Reserve Configurator & Action Bar */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              Adjust Contingency Reserve Buffer ({contingencyPercent}%)
            </span>
            <span className="text-violet-300">
              {currencySymbol}{Math.round((event.budgetTotal * contingencyPercent) / 100).toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={1}
            value={contingencyPercent}
            onChange={(e) => handleContingencyChange(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            Allocates 5% to 20% to absorb weather migrations or sudden attendance increases.
          </p>
        </div>

        <button
          onClick={() => setShowExpenseModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 hover:to-rose-700 text-white font-semibold text-xs shadow-lg shadow-coral-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Log New Expense
        </button>
      </div>

      {/* Categories Grid */}
      <div>
        <h3 className="text-lg font-serif font-bold text-white mb-4">
          Allocated Categories & Spend Variance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => {
            const catPct = cat.allocatedAmount > 0 ? Math.round((cat.actualSpent / cat.allocatedAmount) * 100) : 0;
            const isOver = cat.actualSpent > cat.allocatedAmount;

            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl glass-panel bg-midnight-900/80 border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{cat.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOver
                          ? 'bg-rose-500/20 text-rose-400'
                          : catPct >= 75
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {catPct}% Spent
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3 text-xs">
                    <span className="text-slate-400">Allocated</span>
                    <span className="font-semibold text-white">
                      {currencySymbol}{cat.allocatedAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1 text-xs">
                    <span className="text-slate-400">Actual Spent</span>
                    <span className={`font-semibold ${isOver ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                      {currencySymbol}{cat.actualSpent.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-coral-500 to-violet-500'
                      }`}
                      style={{ width: `${Math.min(100, catPct)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[180px]">{cat.notes || 'Standard category'}</span>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowExpenseModal(true);
                    }}
                    className="text-coral-400 hover:text-coral-300 font-medium"
                  >
                    + Add Bill
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense History Ledger */}
      <div className="p-6 rounded-3xl glass-panel bg-midnight-900 border border-white/10 space-y-4">
        <h3 className="text-lg font-serif font-bold text-white flex items-center justify-between">
          <span>Expense Ledger & Invoices</span>
          <span className="text-xs text-slate-400 font-normal">{allExpenses.length} entries recorded</span>
        </h3>

        {allExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No individual expenses logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-3 font-semibold">Expense Name</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Estimated</th>
                  <th className="pb-3 font-semibold">Actual Cost</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allExpenses.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-medium text-white">{exp.name}</td>
                    <td className="py-3 text-slate-300">{exp.categoryName}</td>
                    <td className="py-3 text-slate-400">
                      {currencySymbol}{exp.estimatedCost.toLocaleString()}
                    </td>
                    <td className="py-3 font-semibold text-coral-400">
                      {currencySymbol}{exp.actualCost.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          exp.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : exp.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {exp.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 truncate max-w-xs">{exp.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="rounded-3xl glass-panel bg-midnight-900 border border-white/15 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-coral-400" />
                Log Event Expense
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                >
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id} className="bg-midnight-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Expense Name</label>
                <input
                  type="text"
                  required
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="e.g. Venue Advance Deposit or Drone Videographer"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimated Cost</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Actual Cost</label>
                  <input
                    type="number"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 text-white font-semibold"
                >
                  {isSubmitting ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
