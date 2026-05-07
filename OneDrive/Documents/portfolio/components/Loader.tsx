"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const TAGLINE = "Developer · Designer · ML Engineer";

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;
    const raf = requestAnimationFrame(function tick() {
      const p = Math.min(((Date.now() - start) / duration) * 100, 100);
      setProgress(Math.round(p));
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 200);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0e0e1a" }}
        >
          {/* Soft radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Profile avatar */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative mb-7"
          >
            {/* Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[5px] rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #a855f7, #ec4899, #06b6d4, #a855f7)",
                borderRadius: "9999px",
                padding: "2px",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500">
              <img
                src="/profile.png"
                alt="Majid Ali"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-1 text-3xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-space), system-ui, sans-serif" }}
          >
            Majid Ali
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-8 text-xs tracking-widest text-white/40 uppercase"
          >
            {TAGLINE}
          </motion.p>

          {/* Progress bar */}
          <div className="relative h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #a855f7, #ec4899, #06b6d4)",
              }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Percentage */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-[11px] tabular-nums text-white/30"
          >
            {progress}%
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
