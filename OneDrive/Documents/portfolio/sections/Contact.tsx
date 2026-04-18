"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import RevealHeading from "@/components/RevealHeading";
import { PERSONAL, SOCIALS } from "@/lib/constants";

const GlobeScene = dynamic(() => import("@/components/three/GlobeScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

type FormData = { name: string; email: string; message: string };

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const [toast, setToast] = useState(false);

  const onSubmit = (data: FormData) => {
    // No backend: log + mailto fallback
    console.log("Contact submission:", data);
    const subject = encodeURIComponent(`Portfolio contact from ${data.name}`);
    const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
    window.location.href = `mailto:${PERSONAL.email}?subject=${subject}&body=${body}`;
    setToast(true);
    reset();
    setTimeout(() => setToast(false), 3500);
  };

  return (
    <section id="contact" className="section relative">
      <div className="blob -top-20 right-0 h-[500px] w-[500px] bg-accent-purple/25" />

      <div className="text-center">
        <span className="mb-4 inline-block rounded-full border border-accent-pink/30 bg-accent-pink/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent-pink">
          Get in touch
        </span>
        <RevealHeading
          text="Contact."
          className="text-6xl md:text-9xl gradient-text"
        />
      </div>

      <div className="mt-16 grid items-center gap-10 md:grid-cols-2">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-white/50">
                Your Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent-purple focus:bg-white/[0.06]"
              />
              {errors.name && (
                <span className="text-xs text-red-400">{errors.name.message}</span>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-white/50">
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                placeholder="you@awesome.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent-pink focus:bg-white/[0.06]"
              />
              {errors.email && (
                <span className="text-xs text-red-400">{errors.email.message}</span>
              )}
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-widest text-white/50">
                Message
              </label>
              <textarea
                {...register("message", { required: "Message is required" })}
                rows={5}
                placeholder="Tell me about your project…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent-cyan focus:bg-white/[0.06]"
              />
              {errors.message && (
                <span className="text-xs text-red-400">{errors.message.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-purple/40 transition hover:shadow-accent-pink/60 hover:scale-[1.01]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center gap-2">
                Send Message
                <Send className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </button>
          </form>

          <div className="mt-8 flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-1 hover:border-accent-purple hover:text-white hover:shadow-lg hover:shadow-accent-purple/40"
                data-cursor-hover
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1 }}
          className="relative h-[400px] md:h-[520px]"
        >
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-accent-cyan/20" />
          <GlobeScene />
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-300 backdrop-blur"
          >
            <CheckCircle2 className="h-4 w-4" />
            Message drafted — your mail client is opening.
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
