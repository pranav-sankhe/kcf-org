"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "gallery"), (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Photo)));
      setLoading(false);
    });
    return unsub;
  }, []);

  /* Keyboard navigation for lightbox */
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightbox(null); return; }
      const idx = photos.findIndex((p) => p.id === lightbox.id);
      if (e.key === "ArrowRight" && idx < photos.length - 1) setLightbox(photos[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) setLightbox(photos[idx - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, photos]);

  const addPhoto = async () => {
    if (!newUrl.trim()) return;
    setAdding(true);
    await addDoc(collection(db, "gallery"), {
      url: newUrl.trim(),
      caption: newCaption.trim() || null,
      timestamp: serverTimestamp(),
    });
    setNewUrl("");
    setNewCaption("");
    setAdding(false);
    setShowForm(false);
  };

  const lightboxIdx = lightbox ? photos.findIndex((p) => p.id === lightbox.id) : -1;

  return (
    <div className="bg-cream min-h-full">

      {/* Header */}
      <div className="bg-navy px-4 pt-8 pb-10">
        <div className="max-w-5xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-gold/50 text-xs font-semibold tracking-[0.3em] uppercase mb-2">
              Memories
            </p>
            <h1 className="text-white text-2xl font-bold">Gallery</h1>
            {!loading && (
              <p className="text-white/40 text-sm mt-1">{photos.length} photos</p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gold hover:bg-gold-light active:scale-95 text-navy text-xs font-bold px-4 py-2 rounded-xl transition-all tracking-wide"
          >
            + Add Photo
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4 pb-8 space-y-4">

        {/* Add photo form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
                <h3 className="font-semibold text-navy text-sm">Add Photo</h3>
                <input
                  type="url"
                  placeholder="Image URL (https://...)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/30 bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPhoto()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/30 bg-gray-50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addPhoto}
                    disabled={adding || !newUrl.trim()}
                    className="flex-1 bg-navy hover:bg-navy-light disabled:opacity-40 text-gold font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {adding ? "Adding…" : "Add"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-5 text-gray-400 hover:text-gray-600 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-5xl mb-4">📷</p>
            <p className="text-gray-500 font-medium">No photos yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click &ldquo;+ Add Photo&rdquo; to add the first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="relative group cursor-pointer aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-sm"
                onClick={() => setLightbox(photo)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || ""}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 ring-2 ring-inset ring-white/0 group-hover:ring-white/20 rounded-2xl transition-all" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            {/* Close */}
            <button
              className="absolute top-5 right-5 text-white/60 hover:text-white text-3xl leading-none z-10"
              onClick={() => setLightbox(null)}
            >
              ×
            </button>

            {/* Prev */}
            {lightboxIdx > 0 && (
              <button
                className="absolute left-4 sm:left-8 text-white/50 hover:text-white text-5xl leading-none z-10 p-2"
                onClick={(e) => { e.stopPropagation(); setLightbox(photos[lightboxIdx - 1]); }}
              >
                ‹
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightbox.id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl w-full flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.url}
                alt={lightbox.caption || ""}
                className="max-h-[78vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              {lightbox.caption && (
                <p className="text-white/60 text-sm text-center">{lightbox.caption}</p>
              )}
              <p className="text-white/20 text-xs">
                {lightboxIdx + 1} / {photos.length}
              </p>
            </motion.div>

            {/* Next */}
            {lightboxIdx < photos.length - 1 && (
              <button
                className="absolute right-4 sm:right-8 text-white/50 hover:text-white text-5xl leading-none z-10 p-2"
                onClick={(e) => { e.stopPropagation(); setLightbox(photos[lightboxIdx + 1]); }}
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
