import { useState, useCallback } from "react";

export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle";
  rotate: number;
  rotateSpeed: number;
  delay: number;
  duration: number;
}

export function useCelebration() {
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = useCallback(() => {
    const colors = ["#00a8ff", "#00d2d3", "#ff9f43", "#10ac84", "#5f27cd", "#ff6b6b", "#e1b12c"];
    const shapes: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];

    const newParticles: ConfettiParticle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: 50,
      y: 50,
      vx: (Math.random() - 0.5) * 28,
      vy: (Math.random() - 0.8) * 24,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotate: Math.random() * 360,
      rotateSpeed: (Math.random() - 0.5) * 25,
      delay: Math.random() * 0.1,
      duration: Math.random() * 1.5 + 1.8,
    }));

    setConfettiParticles(newParticles);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3500);
  }, []);

  return {
    confettiParticles,
    showConfetti,
    triggerConfetti,
  };
}
