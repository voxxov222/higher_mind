import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, Download, Loader2 } from 'lucide-react';

const PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
];

export const MissionPatchGenerator = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string>("Mars");
  const [isGenerating, setIsGenerating] = useState(false);
  const [patchImage, setPatchImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePatch = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planet: selectedPlanet })
      });
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else if (data.imageUrl) {
        setPatchImage(data.imageUrl);
      }
    } catch (err) {
      setError("Failed to generate patch.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start p-2 text-white">
      <div className="text-center mb-3 border-b border-white/5 pb-2 w-full">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-300 flex items-center justify-center gap-1">
          <Rocket className="w-3 h-3 text-blue-400" />
          Mission Patch
        </h2>
      </div>

      <div className="flex flex-wrap gap-1 justify-center mb-3">
        {PLANETS.map(planet => (
          <button
            key={planet}
            onClick={() => setSelectedPlanet(planet)}
            className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider transition-colors ${
              selectedPlanet === planet 
              ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50' 
              : 'bg-white/5 text-stone-400 hover:bg-white/10 border border-transparent'
            }`}
          >
            {planet}
          </button>
        ))}
      </div>

      <button
        onClick={generatePatch}
        disabled={isGenerating}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/30 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:from-blue-800/60 hover:to-indigo-800/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
      >
        {isGenerating ? (
          <><Loader2 className="w-3 h-3 animate-spin" /> ENGAGING...</>
        ) : (
          <><Sparkles className="w-3 h-3" /> INITIALIZE</>
        )}
      </button>

      {error && (
        <div className="mt-2 w-full p-2 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-[9px] font-mono text-center">
          {error}
        </div>
      )}

      <AnimatePresence>
        {patchImage && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-3 flex flex-col items-center gap-2 w-full"
          >
            <div className="relative group rounded-full overflow-hidden border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <img src={patchImage} alt={`Mission Patch for ${selectedPlanet}`} referrerPolicy="no-referrer" className="w-32 h-32 object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <a href={patchImage} download={`${selectedPlanet.toLowerCase()}-mission-patch.png`} className="p-2 bg-blue-500/30 rounded-full hover:bg-blue-500/50 text-blue-200 transition-colors border border-blue-500/50">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
            <span className="text-[7px] text-blue-300/50 uppercase tracking-[0.2em] font-mono">
              DESIGN ACQUIRED
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
