import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2">
      <motion.div
        className="h-3 w-3 rounded-full bg-primary"
        animate={{
          y: ["0%", "-50%", "0%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0,
        }}
      />
      <motion.div
        className="h-3 w-3 rounded-full bg-primary"
        animate={{
          y: ["0%", "-50%", "0%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="h-3 w-3 rounded-full bg-primary"
        animate={{
          y: ["0%", "-50%", "0%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.4,
        }}
      />
    </div>
  );
}
