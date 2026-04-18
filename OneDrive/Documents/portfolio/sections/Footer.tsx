"use client";

import { Heart, Coffee } from "lucide-react";
import { PERSONAL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 mt-10">
      <div className="section !py-10 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="h-display text-2xl gradient-text font-bold">
          {PERSONAL.name}.
        </div>
        <p className="flex items-center gap-1.5 text-xs text-white/50">
          Built with <Heart className="h-3 w-3 text-accent-pink" /> and lots of{" "}
          <Coffee className="h-3 w-3 text-amber-400" /> using Next.js & Three.js
        </p>
        <div className="text-xs text-white/40">
          © {new Date().getFullYear()} {PERSONAL.name}
        </div>
      </div>
    </footer>
  );
}
