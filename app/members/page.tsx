"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  paid: boolean;
  photoUrl?: string;
  role?: string;
}

function Avatar({ name, photoUrl, paid }: { name: string; photoUrl?: string; paid: boolean }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={`w-20 h-20 rounded-full object-cover mx-auto border-2 ${
          paid ? "border-gold" : "border-gray-200"
        }`}
      />
    );
  }

  return (
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto ${
        paid
          ? "bg-gold/20 text-navy border-2 border-gold/40"
          : "bg-gray-100 text-gray-400 border-2 border-transparent"
      }`}
    >
      {initials}
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "members"), (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const togglePayment = async (m: Member) => {
    await updateDoc(doc(db, "members", m.id), { paid: !m.paid });
  };

  const paidCount = members.filter((m) => m.paid).length;

  return (
    <div className="bg-cream min-h-full">

      {/* Header */}
      <div className="bg-navy px-4 pt-8 pb-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold/50 text-xs font-semibold tracking-[0.3em] uppercase mb-2">
            Our People
          </p>
          <h1 className="text-white text-2xl font-bold">Members</h1>
          {!loading && (
            <p className="text-white/40 text-sm mt-1">
              {paidCount} of {members.length} have paid this year
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4 pb-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500 font-medium">No members found.</p>
            <p className="text-sm text-gray-400 mt-1">
              Add documents to the{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">members</code>{" "}
              Firestore collection with{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">name</code>,{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">paid</code>, and optionally{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">photoUrl</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {members.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease: "easeOut" }}
                className={`bg-white rounded-2xl p-5 text-center shadow-sm border-2 transition-all ${
                  m.paid ? "border-gold/30" : "border-transparent"
                }`}
              >
                <div className="mb-3">
                  <Avatar name={m.name} photoUrl={m.photoUrl} paid={m.paid} />
                </div>

                <p className="font-semibold text-navy text-sm truncate">{m.name}</p>
                {m.role && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{m.role}</p>
                )}

                <button
                  onClick={() => togglePayment(m)}
                  className={`mt-3 w-full text-xs font-semibold py-1.5 rounded-full transition-all active:scale-95 ${
                    m.paid
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {m.paid ? "✓ Paid" : "Pending"}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {members.length > 0 && (
          <p className="text-center text-xs text-gray-300 mt-6">
            Add a{" "}
            <code className="bg-gray-200/60 px-1 rounded">photoUrl</code> field to each Firestore member document to show their photo.
          </p>
        )}
      </div>
    </div>
  );
}
