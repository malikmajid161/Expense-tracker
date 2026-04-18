"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#tech", label: "Tech" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.4, duration: 0.6 }}
      className={cn(
        "fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full px-4 py-2 transition-all",
        scrolled ? "glass" : "bg-transparent"
      )}
    >
      <nav className="flex items-center gap-1 text-sm">
        <a
          href="#home"
          className="mr-2 px-3 py-1 h-display gradient-text font-bold"
        >
          AM.
        </a>
        <ul className="hidden md:flex gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-4 py-2 text-white/70 hover:text-white transition"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
}
