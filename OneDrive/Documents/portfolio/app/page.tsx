"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Loader from "@/components/Loader";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Services from "@/sections/Services";
import TechStack from "@/sections/TechStack";
import Projects from "@/sections/Projects";
import GithubStats from "@/sections/GithubStats";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";
import BackToTop from "@/components/BackToTop";
import KonamiConfetti from "@/components/KonamiConfetti";

export default function HomePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>{!ready && <Loader />}</AnimatePresence>}
      <SmoothScroll>
        <Cursor />
        <KonamiConfetti />
        <Navbar />
        <main className="relative">
          <Hero />
          <About />
          <Services />
          <TechStack />
          <Projects />
          <GithubStats />
          <Contact />
          <Footer />
        </main>
        <BackToTop />
      </SmoothScroll>
    </>
  );
}
