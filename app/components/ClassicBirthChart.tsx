import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_SYMBOLS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
  'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
  'North Node': '☊', 'South Node': '☋', 'Chiron': '⚷', 'Lilith': '⚸'
};

const PLANET_COLORS: Record<string, string> = {
  'Sun': '#FDB813', 'Moon': '#E2E8F0', 'Mercury': '#A5A5A5', 'Venus': '#E3BB76', 'Mars': '#E27B58',
  'Jupiter': '#D39C7E', 'Saturn': '#C5AB6E', 'Uranus': '#BBE1E4', 'Neptune': '#6081FF', 'Pluto': '#8b5cf6',
  'North Node': '#10b981', 'South Node': '#f43f5e', 'Chiron': '#8b5cf6', 'Lilith': '#000000'
};

const ASPECT_COLORS: Record<string, string> = {
  'conjunction': '#fcd34d',
  'opposition': '#fb7185',
  'trine': '#34d399',
  'square': '#f87171',
  'sextile': '#60a5fa'
};

const PLANET_MEANINGS: Record<string, string> = {
  'Sun': 'Your core essence and ego. The "I AM" that drives your purpose and vitality.',
  'Moon': 'Your emotional landscape and subconscious needs. How you respond and nurture.',
  'Mercury': 'Your mind and communication style. How you process information and logic.',
  'Venus': 'What you love and value. Governs relationships, beauty, and social harmony.',
  'Mars': 'Your drive and assertion. How you take action, compete, and go after what you want.',
  'Jupiter': 'Expansion and abundance. Where you find growth, luck, and your higher philosophy.',
  'Saturn': 'Karma and structure. Your lessons, boundaries, responsibilities, and discipline.',
  'Uranus': 'Innovation and liberation. Where you seek uniqueness and sudden transformation.',
  'Neptune': 'Spirituality and dreams. Governs intuition, creativity, and the dissolution of boundaries.',
  'Pluto': 'Power and rebirth. Where you experience deep psychological transformation and intensity.',
  'North Node': 'Your soul\'s mission. The direction of growth and destiny in this lifetime.',
  'South Node': 'Karmic background. Talents and habits brought from past experiences.',
  'Chiron': 'The "Wounded Healer." Represents our deepest pain and our capacity to transform it into wisdom.',
  'Lilith': 'The Shadow Self. Represents repressed desires and raw, unpolluted feminine power.'
};

export const ClassicBirthChart = ({ data, selectedPlanet, onPlanetClick }: any) => {
  const [hoveredElement, setHoveredElement] = useState<any>(null);
  const [activeInfo, setActiveInfo] = useState<any>(null);
  
  // Setup all bodies
  const allBodies = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.planets || []),
      data.nodes?.north && { ...data.nodes.north, name: 'North Node' },
      data.nodes?.south && { ...data.nodes.south, name: 'South Node' },
      data.points?.chiron && { ...data.points.chiron, name: 'Chiron' },
      data.points?.blackMoonLilith && { ...data.points.blackMoonLilith, name: 'Lilith' }
    ].filter(Boolean);
  }, [data]);

  const chartAspects = useMemo(() => {
    if (!allBodies.length) return [];
    
    const getPlanetAbsDegree = (p: any) => SIGN_NAMES.indexOf(p.sign) * 30 + p.degree;
    const calculatedAspects: any[] = [];
    const aspectTypes = [
      { name: 'conjunction', angle: 0, orb: 8 },
      { name: 'opposition', angle: 180, orb: 8 },
      { name: 'trine', angle: 120, orb: 8 },
      { name: 'square', angle: 90, orb: 8 },
      { name: 'sextile', angle: 60, orb: 6 }
    ];

    for (let i = 0; i < allBodies.length; i++) {
      for (let j = i + 1; j < allBodies.length; j++) {
        const p1 = allBodies[i];
        const p2 = allBodies[j];
        const deg1 = getPlanetAbsDegree(p1);
        const deg2 = getPlanetAbsDegree(p2);
        
        let diff = Math.abs(deg1 - deg2);
        if (diff > 180) diff = 360 - diff;
        
        for (const aspect of aspectTypes) {
           if (Math.abs(diff - aspect.angle) <= aspect.orb) {
             calculatedAspects.push({
               planet1: p1.name,
               planet2: p2.name,
               type: aspect.name,
             });
             break;
           }
        }
      }
    }
    
    // Merge meanings from the API if provided
    calculatedAspects.forEach(ca => {
      const existing = data.aspects?.find((a: any) => 
        (a.planet1 === ca.planet1 && a.planet2 === ca.planet2) ||
        (a.planet1 === ca.planet2 && a.planet2 === ca.planet1)
      );
      if (existing) {
        ca.meaning = existing.meaning;
      }
    });

    return calculatedAspects;
  }, [allBodies, data]);

  // If a selectedPlanet prop comes in, set it as activeInfo
  useMemo(() => {
    if (selectedPlanet) setActiveInfo({ type: 'planet', ...selectedPlanet });
  }, [selectedPlanet]);

  const centerX = 400;
  const centerY = 400;
  const radiusOuter = 320;
  const radiusInner = 260;
  const radiusHouses = 200;

  // We rotate everything so Ascendant (Aries or 0 deg) starts at the left (180 degrees in standard polar coords)
  // Standard astrology chart starts Ascendant on the left, advancing counter-clockwise.
  // 0 degree math (Aries 0) = 180 screen degrees.
  const getAngleForDegree = (absoluteDegree: number) => {
    // In SVG, Y axis goes down. 
    // To go counter-clockwise (visually) starting from the left edge (180 deg), 
    // the Y value needs to become positive (move down).
    // sin(150) = 0.5 (positive Y).
    // Thus we subtract the absolute degree.
    const deg = 180 - absoluteDegree;
    return (deg * Math.PI) / 180;
  };

  const getPos = (radius: number, absoluteDegree: number) => {
    const angle = getAngleForDegree(absoluteDegree);
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const handleInteractiveClick = (type: string, payload: any) => {
    setActiveInfo({ type, ...payload });
    if (type === 'planet' && onPlanetClick) {
      onPlanetClick(payload);
    } else if (onPlanetClick) {
      onPlanetClick(null);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#fdfbf6] text-[#333] font-serif p-4 rounded-[2.5rem] relative overflow-hidden">
      
      <svg width="800" height="800" viewBox="0 0 800 800" className="max-w-full max-h-full drop-shadow-xl" style={{ filter: 'sepia(0.2)' }}>
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Wheel background */}
        <circle cx={centerX} cy={centerY} r={radiusOuter} fill="#fff" stroke="#333" strokeWidth="2" />
        <circle cx={centerX} cy={centerY} r={radiusInner} fill="none" stroke="#333" strokeWidth="2" />
        <circle cx={centerX} cy={centerY} r={radiusHouses} fill="#faf8f2" stroke="#333" strokeWidth="2" />
        <circle cx={centerX} cy={centerY} r={60} fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />

        {/* Zodiac Signs */}
        {SIGN_NAMES.map((sign, i) => {
          const startDegree = i * 30;
          const midDegree = startDegree + 15;
          const startPosOuter = getPos(radiusOuter, startDegree);
          const startPosInner = getPos(radiusInner, startDegree);
          const midPos = getPos(radiusOuter - 30, midDegree);
          
          return (
            <g key={sign}>
              <line x1={startPosInner.x} y1={startPosInner.y} x2={startPosOuter.x} y2={startPosOuter.y} stroke="#333" strokeWidth="1" />
              <g 
                className="cursor-pointer transition-all hover:opacity-70"
                onClick={() => handleInteractiveClick('sign', { name: sign, index: i })}
                onMouseEnter={() => setHoveredElement({ type: 'sign', name: sign })}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <text 
                  x={midPos.x} 
                  y={midPos.y} 
                  fontSize="28" 
                  fill={hoveredElement?.name === sign ? '#d97706' : '#555'} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                >
                  {SIGN_SYMBOLS[sign]}
                </text>
              </g>
            </g>
          );
        })}

        {/* Degree markers */}
        {Array.from({ length: 360 }).map((_, i) => {
          const isTenth = i % 10 === 0;
          const r1 = radiusOuter;
          const r2 = isTenth ? radiusOuter - 10 : radiusOuter - 5;
          const pos1 = getPos(r1, i);
          const pos2 = getPos(r2, i);
          return <line key={`tick-${i}`} x1={pos1.x} y1={pos1.y} x2={pos2.x} y2={pos2.y} stroke="#999" strokeWidth={isTenth ? "2" : "1"} />;
        })}

        {/* Houses (Simplified as equal 30 degree blocks aligned with signs for now, or true houses if available) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const startDegree = i * 30;
          const midDegree = startDegree + 15;
          const startPosHouses = getPos(radiusHouses, startDegree);
          const startPosCenter = getPos(60, startDegree);
          const midPos = getPos(radiusHouses - 15, midDegree);
          const isAscDesc = i === 0 || i === 6;
          const isMcIc = i === 3 || i === 9;
          
          return (
            <g key={`house-${i}`}>
              <line 
                x1={startPosCenter.x} y1={startPosCenter.y} 
                x2={startPosHouses.x} y2={startPosHouses.y} 
                stroke={isAscDesc || isMcIc ? "#d97706" : "#ddd"} 
                strokeWidth={isAscDesc || isMcIc ? "2" : "1"} 
              />
              <g 
                className="cursor-pointer"
                onClick={() => handleInteractiveClick('house', { number: i + 1 })}
              >
                <text 
                   x={midPos.x} y={midPos.y} 
                   fontSize="14" fill="#888" 
                   textAnchor="middle" dominantBaseline="middle"
                >
                  {i + 1}
                </text>
              </g>
            </g>
          );
        })}

        {/* Aspects (Lines) */}
        {chartAspects.map((aspect: any, idx: number) => {
          const p1 = allBodies?.find((p: any) => p.name === aspect.planet1);
          const p2 = allBodies?.find((p: any) => p.name === aspect.planet2);
          if (!p1 || !p2) return null;
          
          const getPlanetAbsDegree = (p: any) => SIGN_NAMES.indexOf(p.sign) * 30 + p.degree;
          const deg1 = getPlanetAbsDegree(p1);
          const deg2 = getPlanetAbsDegree(p2);
          
          const pos1 = getPos(radiusHouses, deg1);
          const pos2 = getPos(radiusHouses, deg2);
          
          return (
            <line 
              key={`aspect-${idx}`}
              x1={pos1.x} y1={pos1.y}
              x2={pos2.x} y2={pos2.y}
              stroke={ASPECT_COLORS[aspect.type] || '#ccc'}
              strokeWidth={hoveredElement?.name === p1.name || hoveredElement?.name === p2.name ? "3" : "1"}
              strokeOpacity="0.8"
              strokeDasharray={aspect.type === 'opposition' || aspect.type === 'square' ? '4 2' : 'none'}
            />
          );
        })}

        {/* Planets */}
        {allBodies.map((planet: any, i: number) => {
          const absoluteDegree = SIGN_NAMES.indexOf(planet.sign) * 30 + planet.degree;
          // Offset distance from center based on planet to avoid overlap, or simple stagger
          const planetRadius = radiusInner - 25 - (i % 2 === 0 ? 0 : 25); 
          const pos = getPos(planetRadius, absoluteDegree);
          const lineTarget = getPos(radiusInner, absoluteDegree);
          
          const isHovered = hoveredElement?.name === planet.name;
          const isActive = activeInfo?.name === planet.name;

          return (
            <g key={planet.name}>
              {/* Pointer line to exact degree */}
              <line x1={pos.x} y1={pos.y} x2={lineTarget.x} y2={lineTarget.y} stroke={PLANET_COLORS[planet.name] || '#666'} strokeWidth="1" strokeDasharray="2 2" />
              
              <g 
                className="cursor-pointer transition-transform duration-300"
                style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transform: isHovered || isActive ? 'scale(1.4)' : 'scale(1)' }}
                onMouseEnter={() => setHoveredElement(planet)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleInteractiveClick('planet', planet)}
              >
                <circle cx={pos.x} cy={pos.y} r="14" fill="#fff" stroke={PLANET_COLORS[planet.name] || '#333'} strokeWidth="1" />
                <text 
                  x={pos.x} y={pos.y + 1} 
                  fontSize="16" 
                  fill={PLANET_COLORS[planet.name] || '#333'} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="font-bold"
                >
                  {PLANET_SYMBOLS[planet.name] || '?'}
                </text>
              </g>

              {/* Mini degree text */}
              {(isHovered || isActive) && (
                <text 
                  x={pos.x + 20} y={pos.y - 15} 
                  fontSize="12" fill="#333" 
                  className="font-sans font-bold bg-white"
                >
                  {Math.floor(planet.degree)}° {planet.sign}
                </text>
              )}
            </g>
          );
        })}

        {/* ASC / DESC text */}
        <text x={centerX - radiusOuter - 20} y={centerY} fontSize="18" fill="#d97706" textAnchor="end" dominantBaseline="middle" className="font-bold tracking-widest">AC</text>
        <text x={centerX + radiusOuter + 20} y={centerY} fontSize="18" fill="#d97706" textAnchor="start" dominantBaseline="middle" className="font-bold tracking-widest">DC</text>
        <text x={centerX} y={centerY - radiusOuter - 20} fontSize="18" fill="#d97706" textAnchor="middle" dominantBaseline="auto" className="font-bold tracking-widest">MC</text>
        <text x={centerX} y={centerY + radiusOuter + 20} fontSize="18" fill="#d97706" textAnchor="middle" dominantBaseline="hanging" className="font-bold tracking-widest">IC</text>

      </svg>

      {/* Information Panel */}
      <AnimatePresence>
        {activeInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#fffcf5] border-2 border-[#e6decc] rounded-xl p-6 w-[500px] shadow-2xl max-h-[40vh] overflow-y-auto"
            style={{ 
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 20px 0 rgba(217, 119, 6, 0.05)',
              borderTopWidth: '4px',
              borderTopColor: '#d97706'
            }}
          >
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveInfo(null); 
                if (onPlanetClick) onPlanetClick(null); 
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors"
            >
              <X size={20} />
            </button>
            
            {activeInfo.type === 'planet' && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl text-[#d97706] drop-shadow-sm">{PLANET_SYMBOLS[activeInfo.name]}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800">{activeInfo.name}</h3>
                    <p className="text-sm font-sans tracking-wide text-stone-500 uppercase">
                      {Math.floor(activeInfo.degree)}° {activeInfo.sign} • in House {activeInfo.house}
                    </p>
                  </div>
                </div>
                
                <div className="prose prose-stone prose-sm">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#d97706] mb-2">Meaning</h4>
                  <p className="leading-relaxed text-stone-700 bg-stone-100 p-4 rounded-lg">
                    {activeInfo.meaning || PLANET_MEANINGS[activeInfo.name]}
                  </p>
                  
                  {/* Aspects to this planet */}
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#d97706] mt-6 mb-2">Aspects</h4>
                  <div className="space-y-1">
                    {chartAspects.filter((a: any) => a.planet1 === activeInfo.name || a.planet2 === activeInfo.name).map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-stone-600 bg-white border border-stone-200 px-3 py-2 rounded">
                        <span style={{ color: ASPECT_COLORS[a.type] || '#ccc' }}>●</span>
                        <span className="font-bold underline decoration-stone-300">{a.type.charAt(0).toUpperCase() + a.type.slice(1)}</span>
                        <span>with</span>
                        <span className="font-bold text-stone-800">{a.planet1 === activeInfo.name ? a.planet2 : a.planet1}</span>
                      </div>
                    ))}
                    {chartAspects.filter((a: any) => a.planet1 === activeInfo.name || a.planet2 === activeInfo.name).length === 0 && (
                      <p className="text-stone-500 italic">No major aspects found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeInfo.type === 'sign' && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl text-[#d97706] drop-shadow-sm">{SIGN_SYMBOLS[activeInfo.name]}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800">{activeInfo.name}</h3>
                    <p className="text-sm font-sans tracking-wide text-stone-500 uppercase">
                      Zodiac Sign Insight
                    </p>
                  </div>
                </div>
                <div className="prose prose-stone prose-sm">
                  <p className="leading-relaxed text-stone-700 bg-stone-100 p-4 rounded-lg">
                    {activeInfo.name} represents a specific archetypal energy in the cosmos. It rules particular themes, modalities, and elements of the human experience.
                  </p>
                </div>
              </div>
            )}

            {activeInfo.type === 'house' && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl text-[#d97706] font-sans italic opacity-80">{activeInfo.number}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800">House {activeInfo.number}</h3>
                    <p className="text-sm font-sans tracking-wide text-stone-500 uppercase">
                      Realm of Experience
                    </p>
                  </div>
                </div>
                <div className="prose prose-stone prose-sm">
                  <p className="leading-relaxed text-stone-700 bg-stone-100 p-4 rounded-lg">
                    The {activeInfo.number}{activeInfo.number === 1 ? 'st' : activeInfo.number === 2 ? 'nd' : activeInfo.number === 3 ? 'rd' : 'th'} House governs a specific area of life, showing WHERE the planetary energies play out.
                  </p>
                  {/* List planets in this house */}
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#d97706] mt-6 mb-2">Occupants</h4>
                  <div className="flex gap-2 flex-wrap">
                    {allBodies.filter((p: any) => p.house === activeInfo.number).map((p: any) => (
                      <div key={p.name} className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-bold text-[#d97706] shadow-sm">
                        {PLANET_SYMBOLS[p.name]} {p.name}
                      </div>
                    ))}
                    {allBodies.filter((p: any) => p.house === activeInfo.number).length === 0 && (
                      <p className="text-stone-500 italic text-sm">This house is empty in your chart.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
