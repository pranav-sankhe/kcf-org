"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "./Nav";

export type Role = "viewer" | "admin";

const AccessContext = createContext<Role | null>(null);
export const useAccess = () => useContext(AccessContext);

const CODES: Record<string, Role> = {
  kcf:    "viewer",
  kcfkey: "admin",
};

const STORAGE_KEY = "kcf-access-v2";

function AnchorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" stroke="currentColor"
      strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="14" r="9" />
      <line x1="50" y1="23" x2="50" y2="106" />
      <line x1="16" y1="42" x2="84" y2="42" />
      <path d="M50 106 L20 84" />
      <path d="M50 106 L80 84" />
      <path d="M20 84 Q6 86 8 98 Q10 110 20 108" />
      <path d="M80 84 Q94 86 92 98 Q90 110 80 108" />
    </svg>
  );
}

function AccessGate({ onSuccess }: { onSuccess: (role: Role) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const enter = () => {
    const role = CODES[code.trim()];
    if (role) {
      onSuccess(role);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <AnchorIcon className="w-20 h-20 text-gold mx-auto mb-5 drop-shadow-lg" />
          <h1 className="text-5xl font-bold text-gold tracking-[0.15em]">KCF GROUP</h1>
          <p className="text-gold/40 text-xs tracking-[0.4em] uppercase mt-2">Est. 2020</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
            <div className="flex-1 h-px bg-gold/20" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4">
          <p className="text-center text-gold/60 text-sm">Enter access code to continue</p>
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && enter()}
            placeholder="••••••••••••"
            autoFocus
            className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-sm text-gold placeholder-gold/20 outline-none transition-all focus:ring-2 ${
              error ? "border-red-400/60 focus:ring-red-400/30" : "border-white/20 focus:ring-gold/30"
            }`}
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs text-center"
              >
                Incorrect code. Please try again.
              </motion.p>
            )}
          </AnimatePresence>
          <button
            onClick={enter}
            className="w-full bg-gold hover:bg-gold-light active:scale-95 text-navy font-bold py-3 rounded-xl transition-all text-sm tracking-widest uppercase"
          >
            Enter
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AccessProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Role | null;
    if (stored === "viewer" || stored === "admin") setRole(stored);
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!role) {
    return (
      <AccessGate
        onSuccess={(r) => {
          localStorage.setItem(STORAGE_KEY, r);
          setRole(r);
        }}
      />
    );
  }

  return (
    <AccessContext.Provider value={role}>
      <Nav />
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </AccessContext.Provider>
  );
}
