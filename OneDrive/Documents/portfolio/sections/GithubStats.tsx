"use client";

import { motion } from "framer-motion";
import RevealHeading from "@/components/RevealHeading";
import { PERSONAL } from "@/lib/constants";

export default function GithubStats() {
  const cards = [
    {
      src: `https://github-readme-stats.vercel.app/api?username=${PERSONAL.githubUser}&show_icons=true&theme=tokyonight&hide_border=true&bg_color=0a0a0f`,
      alt: "GitHub stats",
    },
    {
      src: `https://github-readme-streak-stats.herokuapp.com/?user=${PERSONAL.githubUser}&theme=tokyonight&hide_border=true&background=0a0a0f`,
      alt: "GitHub streak",
    },
    {
      src: `https://github-readme-stats.vercel.app/api/top-langs/?username=${PERSONAL.githubUser}&layout=compact&theme=tokyonight&hide_border=true&bg_color=0a0a0f`,
      alt: "Top languages",
    },
  ];

  return (
    <section className="section relative">
      <div className="text-center">
        <span className="mb-4 inline-block rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-cyan">
          Open-source
        </span>
        <RevealHeading
          text="GitHub at a glance."
          className="text-5xl md:text-7xl text-white"
        />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.a
            key={c.alt}
            href={PERSONAL.github}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="glass relative overflow-hidden rounded-2xl p-4 transition hover:scale-[1.02] hover:border-accent-purple/40"
          >
            <img
              src={c.src}
              alt={c.alt}
              className="w-full rounded-xl"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
