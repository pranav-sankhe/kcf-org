"use client";

import { motion } from "framer-motion";

/* ── Photo data ───────────────────────────────────────────────────────── */

const photos = [
  { src: "/GroupPictures/web/gp-1.jpg", alt: "KCF Group — Comedy Night",   rotate: -2.5 },
  { src: "/GroupPictures/web/gp-4.jpg", alt: "KCF Group — Road Trip",      rotate: -1.5 },
  { src: "/GroupPictures/web/gp-3.jpg", alt: "KCF Group — Diwali",         rotate:  2   },
  { src: "/GroupPictures/web/gp-0.jpg", alt: "KCF Group",                  rotate: -2   },
  { src: "/GroupPictures/web/gp-2.jpg", alt: "KCF Group — Train Station",  rotate:  1.5 },
];

/* ── Drift keyframes per photo (px) ──────────────────────────────────── */

const DRIFTS = [
  { x: [0,  8, -5,  6,  0], y: [0, -7,  4, -5,  0], dur: 16 },
  { x: [0, -6,  8, -4,  0], y: [0,  6, -8,  5,  0], dur: 18 },
  { x: [0,  5, -8,  4,  0], y: [0, -5,  7, -6,  0], dur: 15 },
  { x: [0, -7,  4, -6,  0], y: [0,  8, -5,  7,  0], dur: 20 },
  { x: [0,  6, -5,  8,  0], y: [0, -8,  6, -4,  0], dur: 17 },
];

/* ── Drifting photo card ─────────────────────────────────────────────── */

function DriftingPhotoCard({
  src, alt, rotate, index,
}: {
  src: string; alt: string; rotate: number; index: number;
}) {
  const { x, y, dur } = DRIFTS[index % DRIFTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: "easeOut" as const }}
    >
      <motion.div
        animate={{ x, y }}
        transition={{
          duration: dur,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: 1 + index * 0.5,
        }}
        style={{ rotate }}
        className="overflow-hidden rounded-sm shadow-[0_8px_40px_rgba(0,0,0,0.55)] will-change-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block w-full h-auto" />
      </motion.div>
    </motion.div>
  );
}

/* ── Text fragment ───────────────────────────────────────────────────── */

function TextFragment({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.14, duration: 0.6, ease: "easeOut" as const }}
    >
      {children}
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="bg-navy overflow-x-hidden">

      {/* ── MOBILE layout (< md) ───────────────────────────────────── */}
      <div className="md:hidden px-5 py-10 space-y-8">

        {/* Both texts together at top */}
        <div className="space-y-6">
          <TextFragment index={0}>
            <p className="text-xl font-semibold text-white leading-relaxed">
              KCF was created in{" "}
              <span className="text-gold font-bold">2020</span> to ensure
              Kraken family stays together after graduating from college.
            </p>
          </TextFragment>
          <TextFragment index={1}>
            <p className="text-xl font-semibold text-white leading-relaxed">
              In <span className="text-gold font-bold">2026</span>, as Kraken
              family grows we recommit ourselves to it.
            </p>
          </TextFragment>
        </div>

        {/* Photos below */}
        {photos.map((p, i) => (
          <DriftingPhotoCard key={p.src} src={p.src} alt={p.alt} rotate={p.rotate} index={i + 2} />
        ))}

        <div className="h-8" />
      </div>

      {/* ── DESKTOP layout (≥ md) ──────────────────────────────────── */}
      <div className="hidden md:block relative w-full" style={{ height: "1520px" }}>

        {/* Text block — top left, both paragraphs together */}
        <div className="absolute" style={{ left: "2%", top: 40, width: "34%" }}>
          <TextFragment index={0}>
            <p className="text-[1.65rem] font-semibold text-white leading-snug">
              KCF was created in{" "}
              <span className="text-gold font-bold">2020</span> to ensure
              Kraken family stays together after graduating from college.
            </p>
          </TextFragment>
          <div className="mt-7">
            <TextFragment index={1}>
              <p className="text-[1.65rem] font-semibold text-white leading-snug">
                In <span className="text-gold font-bold">2026</span>, as Kraken
                family grows we recommit ourselves to it.
              </p>
            </TextFragment>
          </div>
        </div>

        {/* Photo 1 — top right, wide landscape */}
        <div className="absolute" style={{ left: "40%", top: 30, width: "56%" }}>
          <DriftingPhotoCard src={photos[0].src} alt={photos[0].alt} rotate={photos[0].rotate} index={2} />
        </div>

        {/* Photo 3 — portrait, left middle */}
        <div className="absolute" style={{ left: "2%", top: 480, width: "20%" }}>
          <DriftingPhotoCard src={photos[2].src} alt={photos[2].alt} rotate={photos[2].rotate} index={3} />
        </div>

        {/* Photo 2 — right middle */}
        <div className="absolute" style={{ left: "26%", top: 460, width: "44%" }}>
          <DriftingPhotoCard src={photos[1].src} alt={photos[1].alt} rotate={photos[1].rotate} index={4} />
        </div>

        {/* Photo 5 — bottom left */}
        <div className="absolute" style={{ left: "2%", top: 920, width: "44%" }}>
          <DriftingPhotoCard src={photos[4].src} alt={photos[4].alt} rotate={photos[4].rotate} index={5} />
        </div>

        {/* Photo 4 — bottom right */}
        <div className="absolute" style={{ left: "50%", top: 970, width: "44%" }}>
          <DriftingPhotoCard src={photos[3].src} alt={photos[3].alt} rotate={photos[3].rotate} index={6} />
        </div>

        {/* Footer */}
        <p
          className="absolute text-xs text-white/20 tracking-widest uppercase"
          style={{ bottom: 40, left: "50%", transform: "translateX(-50%)" }}
        >
          KCF Group · Est. 2020
        </p>
      </div>

    </div>
  );
}
