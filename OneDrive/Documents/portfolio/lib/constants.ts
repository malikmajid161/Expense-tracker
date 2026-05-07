import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Calculator,
  Code2,
  Cpu,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Palette,
  Smartphone,
} from "lucide-react";

export const PERSONAL = {
name: "Majid Ali",
  tagline: "Web & App Developer • ML/DL Engineer • UI Designer",
  location: "Attock, Pakistan",
  github: "https://github.com/malikmajid161",
  githubUser: "malikmajid161",
email: "hello@majidali.dev",
  linkedin: "https://linkedin.com/in/malikmajid161",
  whatsapp: "https://wa.me/923021651294",
  cv: "/cv.pdf",
};

export const STATS = [
  { label: "Projects", value: 15, suffix: "+" },
  { label: "Skills", value: 6, suffix: "+" },
  { label: "Experience", value: 2, suffix: "+ yrs" },
  { label: "Passion", value: 100, suffix: "%" },
];

export type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
};

export const SERVICES: Service[] = [
  {
    icon: Code2,
    title: "Web Development",
    desc: "Modern, responsive websites with Next.js & React",
    color: "#a855f7",
  },
  {
    icon: Smartphone,
    title: "App Development",
    desc: "Cross-platform mobile apps",
    color: "#ec4899",
  },
  {
    icon: Brain,
    title: "Machine Learning",
    desc: "Smart models that learn from data",
    color: "#06b6d4",
  },
  {
    icon: Cpu,
    title: "Deep Learning",
    desc: "Neural networks for vision & NLP",
    color: "#a855f7",
  },
  {
    icon: Calculator,
    title: "MATLAB Programming",
    desc: "Scientific computing & simulations",
    color: "#ec4899",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Figma, Canva & video editing",
    color: "#06b6d4",
  },
];

export type KeyCap = { label: string; color: string };

export const KEYCAPS: KeyCap[][] = [
  [
    { label: "HTML", color: "#e34f26" },
    { label: "CSS", color: "#1572b6" },
    { label: "JS", color: "#f7df1e" },
    { label: "TS", color: "#3178c6" },
    { label: "React", color: "#61dafb" },
    { label: "Next", color: "#ffffff" },
  ],
  [
    { label: "Tailwind", color: "#38bdf8" },
    { label: "Node", color: "#3c873a" },
    { label: "Flutter", color: "#02569b" },
    { label: "Firebase", color: "#ffca28" },
    { label: "Python", color: "#3776ab" },
    { label: "MATLAB", color: "#e1662a" },
  ],
  [
    { label: "TF", color: "#ff6f00" },
    { label: "PyTorch", color: "#ee4c2c" },
    { label: "Jupyter", color: "#f37626" },
    { label: "Git", color: "#f05032" },
    { label: "GitHub", color: "#aaaaaa" },
    { label: "VS Code", color: "#007acc" },
  ],
  [
    { label: "Figma", color: "#a259ff" },
    { label: "Canva", color: "#00c4cc" },
    { label: "Blender", color: "#f5792a" },
    { label: "Docker", color: "#2496ed" },
    { label: "AWS", color: "#ff9900" },
    { label: "Vercel", color: "#ffffff" },
  ],
];

export const SOCIALS = [
  { icon: Github, href: PERSONAL.github, label: "GitHub" },
  { icon: Linkedin, href: PERSONAL.linkedin, label: "LinkedIn" },
  { icon: MessageCircle, href: PERSONAL.whatsapp, label: "WhatsApp" },
  { icon: Mail, href: `mailto:${PERSONAL.email}`, label: "Email" },
];

export type FallbackProject = {
  name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
};

export const FALLBACK_PROJECTS: FallbackProject[] = [
  {
    name: "neural-style-transfer",
    description:
      "Deep learning model that blends content and style images using VGG19 features.",
    html_url: "https://github.com/malikmajid161",
    homepage: null,
    stargazers_count: 12,
    language: "Python",
    topics: ["deep-learning", "pytorch", "computer-vision"],
  },
  {
    name: "nextjs-dashboard",
    description: "Full-stack analytics dashboard with Next.js 14 and shadcn/ui.",
    html_url: "https://github.com/malikmajid161",
    homepage: null,
    stargazers_count: 8,
    language: "TypeScript",
    topics: ["nextjs", "tailwind", "shadcn"],
  },
  {
    name: "flutter-expense-tracker",
    description: "Cross-platform expense tracker with Firebase and clean architecture.",
    html_url: "https://github.com/malikmajid161",
    homepage: null,
    stargazers_count: 5,
    language: "Dart",
    topics: ["flutter", "firebase", "mobile"],
  },
  {
    name: "matlab-signal-toolkit",
    description: "Collection of MATLAB scripts for DSP, filtering and FFT analysis.",
    html_url: "https://github.com/malikmajid161",
    homepage: null,
    stargazers_count: 4,
    language: "MATLAB",
    topics: ["matlab", "dsp", "signal-processing"],
  },
  {
    name: "crop-disease-cnn",
    description: "EfficientNet-based CNN detecting plant diseases with ~99% accuracy.",
    html_url: "https://github.com/malikmajid161",
    homepage: null,
    stargazers_count: 9,
    language: "Python",
    topics: ["tensorflow", "cnn", "agri-tech"],
  },
  {
    name: "portfolio-3d",
    description: "This very portfolio — Next.js + Three.js + Framer Motion.",
    html_url: "https://github.com/malikmajid161",
    homepage: null,
    stargazers_count: 3,
    language: "TypeScript",
    topics: ["nextjs", "threejs", "portfolio"],
  },
];

export const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  Dart: "#00b4ab",
  MATLAB: "#e1662a",
  HTML: "#e34f26",
  CSS: "#1572b6",
  Java: "#f89820",
  "C++": "#00599c",
};
