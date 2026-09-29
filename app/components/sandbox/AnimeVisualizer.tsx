import React from 'react';

export const AnimeVisualizer: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden bg-black/80 rounded-2xl flex items-center justify-center">
      <div className="z-10 pointer-events-none text-center p-8 bg-black/60 backdrop-blur-md rounded-xl border border-white/20">
        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-500 to-rose-500 uppercase tracking-[0.3em] mb-2 pointer-events-none">Anime.js Sandbox (Disabled)</h3>
        <p className="text-xs text-stone-300 font-light pointer-events-none">Requires animejs fix.</p>
      </div>
    </div>
  );
};
