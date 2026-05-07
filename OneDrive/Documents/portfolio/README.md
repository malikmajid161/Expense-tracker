# Abdul Majid — 3D Animated Portfolio

A premium, cinematic, single-page developer portfolio built with Next.js 14, Three.js, Framer Motion, GSAP, and Tailwind CSS. Dark theme, glowing gradient accents, programmatic 3D scenes (developer character, interactive keyboard, rotating globe), live GitHub integration, smooth Lenis scrolling, and a Konami-code confetti easter egg.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Drop in your assets

- `public/profile.png` → your transparent-background profile photo (used in Hero + About). A placeholder SVG is included; replace it for your real face.
- `public/cv.pdf` → optional; linked from the **Download CV** button.

### GitHub integration

Projects are fetched live from `https://api.github.com/users/malikmajid161/repos`. If the API is rate-limited or unreachable the site falls back to the curated list in `lib/constants.ts`. Change the username there if this is a fork.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with a custom dark theme
- **three.js** + `@react-three/fiber` + `@react-three/drei`
- **framer-motion** for scroll, stagger, and hover animations
- **gsap** available for advanced scroll timelines (installed; used inline where needed)
- **lenis** for smooth scrolling
- **react-hook-form** for the contact form (mailto fallback — no backend)
- **react-parallax-tilt** for 3D card hover
- **react-type-animation** for the rotating hero word
- **lucide-react** + **react-icons**

## Project structure

```
portfolio/
├── app/
│   ├── globals.css       # theme, cursor, glow utilities
│   ├── layout.tsx        # fonts + metadata
│   └── page.tsx          # section composition
├── components/
│   ├── three/
│   │   ├── DeveloperScene.tsx   # floating character at a desk
│   │   ├── KeyboardScene.tsx    # pressable 3D keycap grid
│   │   └── GlobeScene.tsx       # rotating Earth + starfield
│   ├── AmbientBlobs.tsx
│   ├── BackToTop.tsx
│   ├── Cursor.tsx               # blurred purple aura + dot
│   ├── KonamiConfetti.tsx       # ↑↑↓↓←→←→BA
│   ├── Loader.tsx               # char-by-char name reveal
│   ├── Navbar.tsx
│   ├── RevealHeading.tsx        # word-by-word heading reveal
│   └── SmoothScroll.tsx         # Lenis wrapper
├── sections/
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── TechStack.tsx
│   ├── Projects.tsx
│   ├── GithubStats.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── lib/
│   ├── cn.ts
│   └── constants.ts             # personal info, services, keycaps, fallbacks
├── public/
│   └── profile.svg              # replace with profile.png
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.js
```

## Notes & design decisions

- **No external 3D model files.** The developer character, keyboard, and globe are built programmatically in Three.js — zero copyright risk, zero asset hunting, fully offline. Want a Sketchfab GLB instead? Drop it in `public/models/` and swap the `<mesh>` tree in `DeveloperScene.tsx` for `useGLTF('/models/yourfile.glb')`.
- **Cursor is hidden** on desktop in favor of the custom glowing one. On touch/coarse pointers the native cursor returns automatically.
- **Contact form** posts via `mailto:` — no API route needed. Swap `onSubmit` for a fetch to `/api/contact` if you want server-side handling.
- **Lighthouse**: the 3D canvases are lazy-loaded via `next/dynamic({ ssr: false })` and only mount client-side.

## Deploy

```bash
# Vercel
vercel

# or any Node host
npm run build && npm start
```

## Easter egg

Type **↑ ↑ ↓ ↓ ← → ← → B A** anywhere on the page. 🎉

---

Built with ❤️ and lots of ☕.
