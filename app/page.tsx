"use client";

import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const firebaseConfig = {
  apiKey: "AIzaSyCWdcPq5XG4f9HxDhu9yg0T0uY62YG5CEw",
  authDomain: "kcf-org.firebaseapp.com",
  projectId: "kcf-org",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const ACCESS_CODE = "kcf-fund-8842";
const SUBSCRIPTION = 5000;

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

export default function Home() {
  const [access, setAccess] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!access) return;

    const unsubMembers = onSnapshot(collection(db, "members"), (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
      setLoading(false);
    });

    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense)));
    });

    return () => {
      unsubMembers();
      unsubExpenses();
    };
  }, [access]);

  const collected = members.filter((m) => m.paid).length * SUBSCRIPTION;
  const spent = expenses.reduce((a, b) => a + (b.amount ?? 0), 0);
  const balance = collected - spent;

  const enter = () => {
    if (code === ACCESS_CODE) {
      setAccess(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  };

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

  if (!access) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">KCF Fund</h1>
            <p className="text-sm text-gray-400 mt-1">Enter access code to continue</p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={code}
              onChange={(e) => { setCode(e.target.value); setCodeError(false); }}
              onKeyDown={(e) => e.key === "Enter" && enter()}
              placeholder="Access code"
              autoFocus
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
                codeError ? "border-red-400 bg-red-50 text-red-800" : "border-gray-200 bg-gray-50"
              }`}
            />
            <AnimatePresence>
              {codeError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-500 pl-1"
                >
                  Incorrect code. Try again.
                </motion.p>
              )}
            </AnimatePresence>
            <button
              onClick={enter}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Enter
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const paidCount = members.filter((m) => m.paid).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base">KCF Fund</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">2024–25</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Collected", value: collected, colorClass: "text-emerald-600", bgClass: "bg-emerald-50" },
            { label: "Spent", value: spent, colorClass: "text-rose-500", bgClass: "bg-rose-50" },
            { label: "Balance", value: balance, colorClass: balance >= 0 ? "text-indigo-600" : "text-red-600", bgClass: balance >= 0 ? "bg-indigo-50" : "bg-red-50" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl p-3.5 text-center shadow-sm border border-gray-100"
            >
              <p className="text-xs text-gray-400 font-medium mb-1.5">{stat.label}</p>
              <p className={`text-base font-bold leading-tight ${stat.colorClass}`}>
                ₹{stat.value.toLocaleString("en-IN")}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Members */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Members</h2>
            {!loading && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {paidCount}/{members.length} paid
              </span>
            )}
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center">
              <div className="inline-block w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No members yet. Add them to your Firestore <code className="bg-gray-100 px-1 rounded text-xs">members</code> collection.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-800 font-medium">{m.name}</span>
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
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Add Expense */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Add Expense</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                min="1"
              />
              <input
                type="text"
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExpense()}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
              />
            </div>
            <button
              onClick={addExpense}
              disabled={adding || !amount}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-200 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {adding ? "Adding…" : "Add Expense"}
            </button>
          </div>
        </motion.section>

        {/* Expenses List */}
        {expenses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">Expenses</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {expenses.length} total
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              <AnimatePresence initial={false}>
                {expenses.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm text-gray-700 truncate mr-3">{e.description}</span>
                    <span className="text-sm font-semibold text-rose-500 shrink-0">
                      −₹{(e.amount ?? 0).toLocaleString("en-IN")}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        <p className="text-center text-xs text-gray-300 py-2">
          KCF · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
