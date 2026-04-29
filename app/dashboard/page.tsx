"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useAccess } from "@/app/AccessProvider";

interface Member {
  id: string;
  name: string;
  paid: boolean;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
}

const SUBSCRIPTION = 5000;

/* ── SVG Donut Chart ─────────────────────────────────────── */
function DonutChart({ value, total, label }: { value: number; total: number; label: string }) {
  const R = 36;
  const C = 2 * Math.PI * R;
  const arc = total > 0 ? (value / total) * C : 0;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke="#c8a84b"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${C - arc}`}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dasharray 1.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-navy leading-none">{value}</span>
          <span className="text-xs text-gray-400">of {total}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-gold">{pct}%</p>
      </div>
    </div>
  );
}

/* ── Animated Bar ────────────────────────────────────────── */
function Bar({
  label,
  value,
  max,
  colorClass,
  textClass,
  delay = 0,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
  textClass: string;
  delay?: number;
}) {
  const pct = max > 0 ? Math.min((Math.abs(value) / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className={`text-xs font-bold ${textClass}`}>
          ₹{Math.abs(value).toLocaleString("en-IN")}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const canEdit = useAccess() === "admin";

  useEffect(() => {
    const unsubM = onSnapshot(collection(db, "members"), (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
      setLoading(false);
    });
    const unsubE = onSnapshot(collection(db, "expenses"), (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense)));
    });
    return () => { unsubM(); unsubE(); };
  }, []);

  const paidCount = members.filter((m) => m.paid).length;
  const collected = paidCount * SUBSCRIPTION;
  const spent = expenses.reduce((a, b) => a + (b.amount ?? 0), 0);
  const balance = collected - spent;
  const totalPossible = members.length * SUBSCRIPTION;

  const togglePayment = async (m: Member) => {
    await updateDoc(doc(db, "members", m.id), { paid: !m.paid });
  };

  const addExpense = async () => {
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return;
    setAdding(true);
    await addDoc(collection(db, "expenses"), {
      amount: parsed,
      description: desc.trim() || "No description",
      timestamp: serverTimestamp(),
    });
    setAmount("");
    setDesc("");
    setAdding(false);
  };

  return (
    <div className="bg-cream min-h-full">

      {/* ── Hero stats ───────────────────────────────────── */}
      <div className="bg-navy px-4 pt-8 pb-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold/50 text-xs font-semibold tracking-[0.3em] uppercase mb-5">
            Fund Overview · 2024–25
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {[
              { label: "Collected", value: collected, sub: `${paidCount} members`, color: "text-gold" },
              { label: "Spent", value: spent, sub: `${expenses.length} expenses`, color: "text-red-300" },
              {
                label: "Balance",
                value: balance,
                sub: balance >= 0 ? "Healthy" : "Overspent",
                color: balance >= 0 ? "text-emerald-300" : "text-red-400",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-gold/40 text-xs tracking-widest uppercase mb-1">{s.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>
                  ₹{s.value.toLocaleString("en-IN")}
                </p>
                <p className="text-white/30 text-xs mt-1 hidden sm:block">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4 pb-8 space-y-5">

        {/* ── Analytics row ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Members donut */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-navy mb-5">Member Payments</h3>
            <div className="flex items-center gap-6 justify-center">
              <DonutChart value={paidCount} total={members.length} label="Paid" />
              <div className="flex-1 space-y-4 max-w-[140px]">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Paid</span>
                    <span className="text-gold font-semibold">{paidCount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: members.length > 0 ? `${(paidCount / members.length) * 100}%` : "0%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-amber-500 font-semibold">{members.length - paidCount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: members.length > 0 ? `${((members.length - paidCount) / members.length) * 100}%` : "0%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.55 }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-300 pt-1">
                  ₹{(paidCount * SUBSCRIPTION).toLocaleString("en-IN")} collected
                </p>
              </div>
            </div>
          </motion.div>

          {/* Fund allocation bars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-semibold text-navy mb-5">Fund Allocation</h3>
            <div className="space-y-4">
              <Bar label="Target" value={totalPossible} max={totalPossible} colorClass="bg-gray-300" textClass="text-gray-400" delay={0.3} />
              <Bar label="Collected" value={collected} max={totalPossible} colorClass="bg-gold" textClass="text-gold" delay={0.45} />
              <Bar label="Spent" value={spent} max={totalPossible} colorClass="bg-red-400" textClass="text-red-500" delay={0.55} />
              <Bar
                label="Balance"
                value={balance}
                max={totalPossible}
                colorClass={balance >= 0 ? "bg-emerald-400" : "bg-red-500"}
                textClass={balance >= 0 ? "text-emerald-600" : "text-red-600"}
                delay={0.65}
              />
            </div>
          </motion.div>
        </div>

        {/* ── Members list ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm">Members</h3>
            {!loading && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                {paidCount}/{members.length} paid
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              No members in Firestore yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        m.paid
                          ? "bg-gold/20 text-navy"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{m.name}</span>
                  </div>
                  {canEdit ? (
                    <button
                      onClick={() => togglePayment(m)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 ${
                        m.paid
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                    >
                      {m.paid ? "✓ Paid" : "Pending"}
                    </button>
                  ) : (
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      m.paid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {m.paid ? "✓ Paid" : "Pending"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Expense form + list ───────────────────────── */}
        <div className={`grid grid-cols-1 ${canEdit ? "sm:grid-cols-2" : ""} gap-4`}>

          {/* Add expense — admin only */}
          {canEdit && <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-navy text-sm">Add Expense</h3>
            </div>
            <div className="p-5 space-y-3">
              <input
                type="number"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 bg-gray-50"
              />
              <input
                type="text"
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExpense()}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 bg-gray-50"
              />
              <button
                onClick={addExpense}
                disabled={adding || !amount}
                className="w-full bg-navy hover:bg-navy-light disabled:opacity-40 text-gold font-semibold py-2.5 rounded-xl transition-colors text-sm tracking-wide"
              >
                {adding ? "Adding…" : "+ Add Expense"}
              </button>
            </div>
          </motion.div>}

          {/* Expense list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-navy text-sm">Expenses</h3>
              {expenses.length > 0 && (
                <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                  {expenses.length}
                </span>
              )}
            </div>
            {expenses.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No expenses yet.</p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {expenses.map((e) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <span className="text-sm text-gray-700 truncate mr-3">{e.description}</span>
                      <span className="text-sm font-semibold text-red-500 shrink-0">
                        −₹{(e.amount ?? 0).toLocaleString("en-IN")}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        <p className="text-center text-xs text-gray-300 pb-2">
          KCF Group · Est. 2020
        </p>
      </div>
    </div>
  );
}
