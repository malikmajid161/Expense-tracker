"use client";

import RevealHeading from "@/components/RevealHeading";
import { STATS } from "@/lib/constants";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Tilt from "react-parallax-tilt";

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.floor(v));

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration: 1.8, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, mv, to]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export default function About() {
  return (
    <section id="about" className="section relative">
      <div className="blob -top-20 right-10 h-[400px] w-[400px] bg-accent-pink/30" />

      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <Tilt
            tiltMaxAngleX={14}
            tiltMaxAngleY={14}
            glareEnable
            glareMaxOpacity={0.25}
            glareColor="#a855f7"
            glarePosition="all"
            scale={1.03}
            transitionSpeed={1200}
            className="rounded-3xl"
          >
            <div className="glow-border rounded-3xl p-[2px]">
              <div className="relative flex h-[400px] w-[300px] items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-accent-purple/20 via-accent-pink/20 to-accent-cyan/20 p-6">
                <div className="absolute inset-0 bg-grid-pattern [background-size:30px_30px] opacity-20" />
                <img
                  src="/profile.png"
                  alt="Majid Ali"
                  className="relative z-10 h-full w-full object-contain object-bottom"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'><rect width='100%' height='100%' fill='%23a855f7' opacity='0.2'/><text x='50%' y='50%' text-anchor='middle' fill='white' font-size='20' font-family='sans-serif'>Drop profile.png</text></svg>";
                  }}
                />
              </div>
            </div>
          </Tilt>
        </motion.div>

        <div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-block rounded-full border border-accent-purple/30 bg-accent-purple/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-purple"
          >
            About Me
          </motion.span>
          <RevealHeading
            text="Code meets Design."
            className="text-5xl md:text-7xl text-white"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
          >
            I&apos;m a passionate developer from Pakistan who blends code with design.
            I build full-stack web apps, mobile apps, and train ML/DL models in
            MATLAB and Python — and I make them beautiful with Figma and Canva.
          </motion.p>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.6 }}
                className="glass rounded-2xl p-4"
              >
                <div className="text-3xl md:text-4xl h-display gradient-text">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
