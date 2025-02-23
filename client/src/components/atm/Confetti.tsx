import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiProps {
  isVisible: boolean;
}

export function Confetti({ isVisible }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; color: string }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate 50 confetti particles with random colors
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            top: '50%',
            left: '50%',
          }}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1, 1, 0],
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            times: [0, 0.2, 0.8, 1],
          }}
        />
      ))}
    </div>
  );
}
