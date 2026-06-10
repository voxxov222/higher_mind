import React, { ReactNode } from "react";
import { motion } from "motion/react";

interface HUDPanelProps {
  children: ReactNode;
  title: string;
  idLabel?: string;
  solfeggioFreq?: number;
  className?: string;
}

const getFreqColor = (freq: number) => {
  switch (freq) {
    case 174:
      return "text-rose-500 border-rose-500 shadow-rose-500/50";
    case 285:
      return "text-orange-500 border-orange-500 shadow-orange-500/50";
    case 396:
      return "text-yellow-500 border-yellow-500 shadow-yellow-500/50";
    case 417:
      return "text-emerald-500 border-emerald-500 shadow-emerald-500/50";
    case 528:
      return "text-emerald-400 border-emerald-400 shadow-emerald-400/50";
    case 639:
      return "text-cyan-500 border-cyan-500 shadow-cyan-500/50";
    case 741:
      return "text-violet-500 border-violet-500 shadow-violet-500/50";
    case 852:
      return "text-purple-400 border-purple-400 shadow-purple-400/50";
    case 963:
      return "text-purple-300 border-purple-300 shadow-purple-300/50";
    default:
      return "text-hud-cyan border-hud-cyan shadow-hud-cyan/50";
  }
};

const getFreqColorHex = (freq: number) => {
  switch (freq) {
    case 174:
      return "#f43f5e";
    case 285:
      return "#f97316";
    case 396:
      return "#eab308";
    case 417:
      return "#10b981";
    case 528:
      return "#34d399";
    case 639:
      return "#06b6d4";
    case 741:
      return "#8b5cf6";
    case 852:
      return "#c084fc";
    case 963:
      return "#d8b4fe";
    default:
      return "#00d4ff";
  }
};

export const HUDPanel: React.FC<HUDPanelProps> = ({
  children,
  title,
  idLabel = "SYS.PNL.01",
  solfeggioFreq = 528,
  className = "",
}) => {
  const activeColorClass = getFreqColor(solfeggioFreq);
  const activeHexColor = getFreqColorHex(solfeggioFreq);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
        filter: "blur(10px) hue-rotate(90deg)",
      }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px) hue-rotate(0deg)" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative bg-black/40 backdrop-blur-md rounded-lg overflow-hidden flex flex-col p-4 border border-white/5 border-l-2 border-r-2 animate-glitch-in ${className}`}
      style={{
        borderLeftColor: activeHexColor,
        borderRightColor: activeHexColor,
        boxShadow: `inset 0 0 20px ${activeHexColor}10, 0 0 10px ${activeHexColor}20`,
      }}
    >
      {/* Scan Line Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 w-full">
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-hud-cyan)] to-transparent opacity-50 animate-scanline"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* Corner Decorators */}
      <div
        className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl border-t-${activeHexColor} border-l-${activeHexColor}`}
        style={{ borderColor: activeHexColor }}
      />
      <div
        className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr border-t-${activeHexColor} border-r-${activeHexColor}`}
        style={{ borderColor: activeHexColor }}
      />
      <div
        className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl border-b-${activeHexColor} border-l-${activeHexColor}`}
        style={{ borderColor: activeHexColor }}
      />
      <div
        className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br border-b-${activeHexColor} border-r-${activeHexColor}`}
        style={{ borderColor: activeHexColor }}
      />

      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4 relative z-20">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: activeHexColor,
              boxShadow: `0 0 8px ${activeHexColor}`,
            }}
          />
          <h3 className="font-orbitron font-bold text-sm tracking-[0.1em] text-white uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            {title}
          </h3>
        </div>
        <div className="font-share text-[10px] uppercase tracking-[0.3em] opacity-60 text-hud-cyan text-right">
          {idLabel} // {solfeggioFreq}HZ
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-20 flex-1 w-full h-full">{children}</div>
    </motion.div>
  );
};
