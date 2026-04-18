"use client";

import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import RevealHeading from "@/components/RevealHeading";
import { SERVICES } from "@/lib/constants";

export default function Services() {
  return (
    <section id="services" className="section relative">
      <div className="blob left-0 top-20 h-[400px] w-[400px] bg-accent-cyan/20" />

      <div className="mb-12 flex flex-col items-start md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-4 inline-block rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-cyan">
            What I Do
          </span>
          <RevealHeading
            text="Services I offer."
            className="text-5xl md:text-7xl text-white"
          />
        </div>
        <p className="mt-4 max-w-sm text-white/60 md:mt-0">
          Six disciplines, one developer. End-to-end products from idea to launch.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <Tilt
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              glareEnable
              glareMaxOpacity={0.2}
              glareColor={s.color}
              glarePosition="all"
              scale={1.02}
              className="h-full rounded-3xl"
            >
              <div
                className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 transition hover:border-white/30"
                style={{
                  boxShadow: `0 0 0 0 ${s.color}00`,
                }}
                data-cursor-hover
              >
                <div
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
                  style={{ background: s.color }}
                />
                <div
                  className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${s.color}33, ${s.color}11)`,
                    border: `1px solid ${s.color}44`,
                  }}
                >
                  <s.icon className="h-7 w-7" style={{ color: s.color }} />
                </div>
                <h3 className="h-display text-2xl font-bold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{s.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40 transition group-hover:text-white">
                  Learn more
                  <span
                    className="inline-block h-px w-6 transition-all group-hover:w-10"
                    style={{ background: s.color }}
                  />
                </div>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
