"use client";

import RevealHeading from "@/components/RevealHeading";
import { motion } from "framer-motion";
import { Brain, Calculator, Code2, Cpu, Palette, Smartphone } from "lucide-react";
import dynamic from "next/dynamic";

const KeyboardScene = dynamic(() => import("@/components/three/KeyboardScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-white/40">
      Loading keyboard…
    </div>
  ),
});

const techCategories = [
  {
    title: "Frontend",
    skills: [
      { name: "React", level: 95, icon: Code2, color: "#61dafb" },
      { name: "Next.js", level: 90, icon: Code2, color: "#000" },
      { name: "TypeScript", level: 85, icon: Code2, color: "#3178c6" },
      { name: "Tailwind", level: 95, icon: Palette, color: "#38bdf8" },
    ],
  },
  {
    title: "Backend & Mobile",
    skills: [
      { name: "Node.js", level: 80, icon: Code2, color: "#3c873a" },
      { name: "Flutter", level: 85, icon: Smartphone, color: "#02569b" },
      { name: "Firebase", level: 80, icon: Brain, color: "#ffca28" },
    ],
  },
  {
    title: "ML/DL & Tools",
    skills: [
      { name: "TensorFlow", level: 90, icon: Brain, color: "#ff6f00" },
      { name: "PyTorch", level: 85, icon: Brain, color: "#ee4c2c" },
      { name: "MATLAB", level: 95, icon: Calculator, color: "#e1662a" },
      { name: "Python", level: 90, icon: Code2, color: "#3776ab" },
    ],
  },
  {
    title: "Design & Deploy",
    skills: [
      { name: "Figma", level: 90, icon: Palette, color: "#a259ff" },
      { name: "Vercel", level: 90, icon: Cpu, color: "#000" },
      { name: "Docker", level: 70, icon: Cpu, color: "#2496ed" },
    ],
  },
];

export default function TechStack() {
  return (
    <section id="tech" className="section relative">
      <div className="blob right-10 top-40 h-[500px] w-[500px] bg-accent-purple/25" />

      <div className="text-center mb-20">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 inline-block rounded-full border border-accent-pink/30 bg-accent-pink/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-pink"
        >
          Tech Stack
        </motion.span>
        <RevealHeading
          text="Press a key."
          className="text-5xl md:text-7xl text-white"
          as="h2"
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-3 text-sm text-white/50"
        >
          Hover keys to see proficiency. Real-time animated tech overview.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1 }}
        className="relative mb-20 h-[480px] md:h-[600px]"
      >
        <div className="absolute inset-0 animate-pulse-glow rounded-3xl bg-accent-purple/15" />
        <KeyboardScene />
      </motion.div>

      {/* Tech Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {techCategories.map((category, catIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIndex * 0.1 }}
            className="space-y-6"
          >
            <motion.h3 
              className="text-lg font-bold text-white uppercase tracking-wide"
              whileHover={{ scale: 1.05, color: '#ec4899' }}
            >
              {category.title}
            </motion.h3>
            {category.skills.map((skill, skillIndex) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={skill.name}
                  className="group relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (catIndex * 0.2) + (skillIndex * 0.05) }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      className="p-2 rounded-lg bg-white/10 backdrop-blur-sm"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: skill.color }} />
                    </motion.div>
                    <span className="font-semibold text-white group-hover:text-accent-cyan">
                      {skill.name}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan shadow-glow"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <motion.span 
                    className="absolute -top-8 right-0 text-xs text-white/50 font-mono"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1, scale: 1.2 }}
                  >
                    {skill.level}%
                  </motion.span>
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
