"use client";

import { useEffect, useState } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

type Piece = { id: number; x: number; color: string; delay: number; rot: number };

const COLORS = ["#a855f7", "#ec4899", "#06b6d4", "#fde047", "#34d399"];

export default function KonamiConfetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[index];
      if (e.key === expected) {
        const next = index + 1;
        if (next === SEQUENCE.length) {
          fire();
          setIndex(0);
        } else {
          setIndex(next);
        }
      } else {
        setIndex(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  function fire() {
    const arr: Piece[] = Array.from({ length: 120 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.4,
      rot: Math.random() * 360,
    }));
    setPieces(arr);
    setTimeout(() => setPieces([]), 4000);
  }

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9997] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.x}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
          className="absolute top-[-20px] h-3 w-2 rounded-sm"
        >
          <style jsx>{`
            span {
              animation: fall 3.5s ease-in forwards;
            }
            @keyframes fall {
              to {
                transform: translateY(110vh) rotate(720deg);
                opacity: 0;
              }
            }
          `}</style>
        </span>
      ))}
    </div>
  );
}
