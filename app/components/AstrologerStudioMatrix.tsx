import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CosmicData } from '../types';

interface AstrologerStudioMatrixProps {
  data: CosmicData;
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹'
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
  opposition: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
  square: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
  trine: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
  sextile: 'text-sky-400 bg-sky-500/20 border-sky-500/40'
};

export const AstrologerStudioMatrix: React.FC<AstrologerStudioMatrixProps> = ({ data }) => {
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Midheaven'];
  const activePlanets = data.planets?.map(p => p.name) || planets;

  const getAspect = (p1: string, p2: string) => {
    return data.aspects?.find(a => 
      (a.planet1 === p1 && a.planet2 === p2) || (a.planet1 === p2 && a.planet2 === p1)
    );
  };

  const [hoveredAspect, setHoveredAspect] = React.useState<any>(null);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-black/40 rounded-xl border border-white/10 p-4">
      <div className="flex gap-2 mb-2 w-full justify-between items-center">
         <span className="text-xs text-white/50 font-mono uppercase tracking-widest">Astrologer Studio Matrix</span>
         <div className="flex gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Harmonious</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">Challenging</span>
         </div>
      </div>
      
      <div className="overflow-auto w-full h-full no-scrollbar pt-2">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${activePlanets.length}, minmax(36px, 1fr))` }}>
            
            {/* Header Row */}
            <div className="h-8 w-8"></div>
            {activePlanets.map((colPlanet) => (
              <div key={`col-${colPlanet}`} className="flex h-8 items-center justify-center font-bold text-[10px] uppercase text-white/50 truncate px-1">
                {colPlanet.slice(0, 3)}
              </div>
            ))}

            {/* Grid Rows */}
            {activePlanets.map((rowPlanet, rowIndex) => (
              <React.Fragment key={`row-${rowPlanet}`}>
                {/* Row Label */}
                <div className="flex h-10 w-8 items-center justify-start font-bold text-[10px] uppercase text-white/50 px-1">
                  {rowPlanet.slice(0, 3)}
                </div>

                {/* Cells */}
                {activePlanets.map((colPlanet, colIndex) => {
                  if (colIndex >= rowIndex) {
                    return <div key={`${rowPlanet}-${colPlanet}`} className="bg-white/5 rounded-md h-10" />
                  }

                  const aspect = getAspect(rowPlanet, colPlanet);

                  if (!aspect) {
                    return <div key={`${rowPlanet}-${colPlanet}`} className="flex h-10 items-center justify-center border border-white/5 bg-white/5 rounded-md" />
                  }

                  const type = aspect.type.toLowerCase();
                  const styles = ASPECT_COLORS[type] || 'text-white bg-white/10 border-white/20';
                  const symbol = ASPECT_SYMBOLS[type] || '●';

                  return (
                    <motion.div
                      key={`${rowPlanet}-${colPlanet}`}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                      onHoverStart={() => setHoveredAspect({ ...aspect, p1: rowPlanet, p2: colPlanet })}
                      onHoverEnd={() => setHoveredAspect(null)}
                      className={`flex h-10 flex-col items-center justify-center border transition-colors cursor-pointer rounded-md w-full relative ${styles}`}
                    >
                      <span className="text-lg font-bold leading-none mb-0.5 drop-shadow-md">{symbol}</span>
                    </motion.div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredAspect && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl z-50 w-64 pointer-events-none"
          >
            <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold border-b border-white/10 pb-1 mb-1">
               {hoveredAspect.p1} & {hoveredAspect.p2}
            </div>
            <div className="text-sm font-serif text-white capitalize mb-1">
               {hoveredAspect.type}
            </div>
            <p className="text-[10px] text-stone-300 font-light leading-snug line-clamp-3">
               {hoveredAspect.meaning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
