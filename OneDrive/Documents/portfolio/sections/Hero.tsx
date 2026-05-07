"use client";

import AmbientBlobs from "@/components/AmbientBlobs";
import { PERSONAL } from "@/lib/constants";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { TypeAnimation } from "react-type-animation";

const DeveloperScene = dynamic(() => import("@/components/three/DeveloperScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-28">
      <AmbientBlobs />
      <div className="absolute inset-0 bg-grid-pattern [background-size:60px_60px] opacity-[0.15]" />

      <div className="section relative grid min-h-[calc(100vh-7rem)] items-center gap-8 md:grid-cols-2">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.9, ease: "easeOut" }}
          className="relative z-10"
        >
          {/* Profile photo floater */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 2.7, type: "spring", stiffness: 180, damping: 14 }}
            className="mb-6 inline-flex"
          >
            <div className="glow-border rounded-full p-[3px]">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-accent-purple to-accent-pink">
                <img
                  src="/profile.png"
                  alt="Majid Ali"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
            <div className="ml-3 flex flex-col justify-center">
              <span className="text-xs text-white/50">Available for work</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Online
              </span>
            </div>
          </motion.div>

          <h1 className="h-display text-[12vw] md:text-[6.5vw] leading-[0.95]">
            <span className="block text-white">Hi, I&apos;m</span>
            <span className="block text-outline">Majid Ali</span>
            <span className="block gradient-text mt-1">
              <TypeAnimation
                sequence={[
                  "a Developer",
                  2000,
                  "a Creator",
                  2000,
                  "an ML Engineer",
                  2000,
                  "a Designer",
                  2000,
                ]}
                wrapper="span"
                speed={40}
                repeat={Infinity}
              />
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base md:text-lg text-white/70">
            {PERSONAL.tagline}. Based in {PERSONAL.location}, I craft premium digital
            experiences that blend code, design, and AI.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#work"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-purple/40 transition hover:scale-105 hover:shadow-accent-pink/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                View My Work
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
            <a
              href={PERSONAL.cv}
              download
              className="group relative rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-accent-purple hover:bg-accent-purple/10 hover:shadow-lg hover:shadow-accent-purple/40"
            >
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download CV
              </span>
            </a>
          </div>
        </motion.div>

        {/* Right: 3D scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.6, duration: 1.2 }}
          className="relative h-[420px] md:h-[560px]"
        >
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-accent-purple/20" />
          <DeveloperScene />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1">
          <div className="h-2 w-1 animate-scroll-down rounded-full bg-gradient-to-b from-accent-purple to-accent-pink" />
        </div>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
