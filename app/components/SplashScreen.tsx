import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <div className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4">
            HIGHER <span className="text-purple-500">🧠</span> MIND
          </div>
          <div className="text-sm font-mono text-purple-300/60 uppercase tracking-[0.3em]">
            Initializing Consciousness...
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
