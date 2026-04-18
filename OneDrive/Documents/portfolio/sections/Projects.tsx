"use client";

import RevealHeading from "@/components/RevealHeading";
import {
  FALLBACK_PROJECTS,
  LANG_COLORS,
  PERSONAL,
  type FallbackProject,
} from "@/lib/constants";
import { motion } from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";

type Repo = FallbackProject;

export default function Projects() {
  const [repos, setRepos] = useState<Repo[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${PERSONAL.githubUser}/repos?sort=updated&per_page=12`
        );
        if (!res.ok) throw new Error("GitHub API error");
        const data = await res.json();
        if (cancel) return;
        const cleaned: Repo[] = (data as any[])
          .filter((r) => !r.fork)
          .slice(0, 6)
          .map((r) => ({
            name: r.name,
            description: r.description ?? "No description provided.",
            html_url: r.html_url,
            homepage: r.homepage || null,
            stargazers_count: r.stargazers_count ?? 0,
            language: r.language,
            topics: r.topics ?? [],
          }));
        if (cleaned.length) setRepos(cleaned);
      } catch {
        // keep fallback
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <section id="work" className="section relative">
      <div className="blob left-10 bottom-0 h-[400px] w-[400px] bg-accent-purple/20" />

      <div className="mb-12">
        <span className="mb-4 inline-block rounded-full border border-accent-purple/30 bg-accent-purple/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-purple">
          My Work
        </span>
        <RevealHeading
          text="Selected Projects."
          className="text-5xl md:text-7xl text-white"
        />
        <p className="mt-4 max-w-xl text-white/60">
          A live feed of my latest GitHub work. {loading ? "Fetching…" : "Updated just now."}
        </p>
      </div>

      <motion.ul 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {repos.map((r, i) => {
          const langColor = r.language ? LANG_COLORS[r.language] ?? "#a855f7" : "#a855f7";
          return (
            <motion.li
              key={r.name + i}
              variants={itemVariants}
              className="h-full"
            >
              <Tilt
                tiltMaxAngleX={12}
                tiltMaxAngleY={12}
                tiltMaxAngleZ={5}
                scale={1.05}
                gyroScope={true}
                glareEnable
                glareMaxOpacity={0.2}
                glareColor={langColor}
                className="h-full rounded-3xl"
              >
                <motion.div
                  className="group relative h-full flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:border-white/50 hover:shadow-2xl hover:shadow-accent-purple/50 hover:-translate-y-4"
                  data-cursor-hover
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Mockup header */}
                  <div
                    className="relative flex h-40 items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${langColor}44, ${langColor}11, #05050a)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-grid-pattern [background-size:30px_30px] opacity-20" />
                    <motion.div 
                      className="relative flex items-center gap-1 text-[7rem] font-black leading-none text-white/10 h-display"
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </motion.div>
                    <div className="absolute left-4 top-4 flex gap-1.5">
                      <motion.span className="h-2.5 w-2.5 rounded-full bg-red-500/80 animate-pulse" />
                      <motion.span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 animate-pulse" transition={{ delay: 0.2 }} />
                      <motion.span className="h-2.5 w-2.5 rounded-full bg-green-500/80 animate-pulse" transition={{ delay: 0.4 }} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <motion.h3 
                      className="h-display text-xl font-bold text-white group-hover:text-accent-purple transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      {r.name}
                    </motion.h3>
                    <motion.p 
                      className="mt-2 line-clamp-2 text-sm text-white/60"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {r.description}
                    </motion.p>

                    {r.topics.length > 0 && (
                      <motion.div 
                        className="mt-4 flex flex-wrap gap-1.5"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {r.topics.slice(0, 3).map((t, j) => (
                          <motion.span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70 hover:bg-accent-pink hover:text-white transition-all duration-200 cursor-pointer"
                            whileHover={{ scale: 1.1, backgroundColor: '#ec4899' }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.1 }}
                          >
                            {t}
                          </motion.span>
                        ))}
                      </motion.div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-6">
                      <motion.div 
                        className="flex items-center gap-3 text-xs text-white/60"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {r.language && (
                          <span className="flex items-center gap-1.5">
                            <motion.span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: langColor }}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            {r.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {r.stargazers_count}
                        </span>
                      </motion.div>
                      <div className="flex gap-2">
                        {r.homepage && (
                          <motion.a
                            href={r.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-accent-purple hover:text-white hover:scale-110"
                            aria-label="Live demo"
                            whileHover={{ rotate: 360 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </motion.a>
                        )}
                        <motion.a
                          href={r.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-accent-pink hover:text-white hover:scale-110"
                          aria-label="Source"
                          whileHover={{ rotate: -360 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github className="h-3.5 w-3.5" />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Tilt>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
