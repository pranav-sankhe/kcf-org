"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  paid: boolean;
  role?: string;
}

// Maps Firestore name → processed photo in /public/processed/
const PHOTO_MAP: Record<string, string> = {
  "Ajay":      "/processed/Ajay.jpg",
  "Anant":     "/processed/Anant.jpg",
  "Anil":      "/processed/Anil.jpg",
  "Ashwini":   "/processed/Ashwini.jpg",
  "Deepesh":   "/processed/Deepesh.jpg",
  "Devesh":    "/processed/Devesh.jpg",
  "Ritik":     "/processed/Ritik.jpg",
  "Rohit":     "/processed/Rohit.jpg",
  "Sahas":     "/processed/Sahas.jpg",
  "Shreyansh": "/processed/Shreyansh.jpg",
  "Pranav":    "/processed/pranav.jpg",
  "Siddhant":  "/processed/siddhant.jpg",
};

function getPhoto(name: string): string | null {
  // Try exact match first, then first-name match (case-insensitive)
  if (PHOTO_MAP[name]) return PHOTO_MAP[name];
  const firstName = name.split(" ")[0];
  const key = Object.keys(PHOTO_MAP).find(
    (k) => k.toLowerCase() === firstName.toLowerCase()
  );
  return key ? PHOTO_MAP[key] : null;
}

function MemberCard({ member, index }: { member: Member; index: number }) {
  const photo = getPhoto(member.name);
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: "easeOut" }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      {/* Photo — full card width */}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={member.name}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-gold/15 flex items-center justify-center text-4xl font-bold text-navy">
          {initials}
        </div>
      )}

      {/* Name */}
      <div className="px-3 py-2.5 text-center">
        <p className="font-semibold text-navy text-sm leading-tight">{member.name}</p>
        {member.role && (
          <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
        )}
      </div>
    </motion.div>
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
            <p className="text-white/40 text-sm mt-1">{members.length} members</p>
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
              Firestore collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {members.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
