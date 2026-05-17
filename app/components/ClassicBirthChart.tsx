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

const SIGN_MEANINGS: Record<string, string> = {
  'Aries': 'The pioneer of the zodiac. Represents individual courage, sudden bursts of energy, and absolute directness. Aries is fire in its most primal, initiatory form.',
  'Taurus': 'The steadfast builder. Represents earthly endurance, grounded pleasure, and material security. Taurus brings abstract concepts into tangible reality.',
  'Gemini': 'The curious messenger. Governs communication, mutable intellect, and the gathering of diverse information. Gemini bridges disparate concepts and ideas.',
  'Cancer': 'The psychic emotional core. Represents the origin point of safety, deep emotional memory, and maternal nurturing. It is the sanctuary of the soul.',
  'Leo': 'The radiant sovereign. Governs self-expression, joyous creativity, and heart-centered leadership. Leo shines its individual light into the collective.',
  'Virgo': 'The analytical servant. Represents process optimization, purity, and the integration of spirit through daily physical routines and helpfulness.',
  'Libra': 'The mirror of relationship. Seeks absolute equilibrium, aesthetic harmony, and intellectual bridging. Libra learns the self through the reflection of the other.',
  'Scorpio': 'The alchemical transformer. Rules deep psychological truth, the mysteries of birth and death, and intense emotional bonding. Scorpio deals with power and rebirth.',
  'Sagittarius': 'The seeker of wisdom. Represents the outward expansion of the mind, long journeys, higher philosophy, and the arrow of truth aimed at the divine.',
  'Capricorn': 'The mountain climber. Governs structure, time, karmic legacy, and immense discipline. Capricorn achieves mastery through patient, sustained effort.',
  'Aquarius': 'The cosmic visionary. Represents the collective future, sudden awakening, networks, and rebellious liberation from outdated structures.',
  'Pisces': 'The cosmic ocean. Dissolves all boundaries representing universal empathy, mysticism, and the point where the finite self merges with the infinite.'
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Identity, physical appearance, first impressions, and the self you project to the world. It is the ascendant point of physical incarnation.',
  2: 'Personal values, material possessions, personal finances, and the foundational sense of self-worth.',
  3: 'Immediate environment, siblings, short journeys, early education, and the initial gathering and sharing of information.',
  4: 'Roots, family psyche, inner emotional security, the home, and the deep past. It represents the foundation of the subjective self.',
  5: 'Joy, romance, personal creativity, children, and spontaneous self-expression. The spark of creation for the sake of play.',
  6: 'Daily routines, physical health, service to others, pets, and the refinement of skills. Where spirit meets the reality of labor.',
  7: 'One-on-one partnerships, marriage, contracts, and known enemies. The descent into learning yourself via an equal counterpart.',
  8: 'Shared resources, intimacy, death, psychological transformation, and the occult. Where boundaries merge and power dynamics occur.',
  9: 'Higher learning, belief systems, long-distance travel, and the expansion of the conceptual horizon toward meaning.',
  10: 'Career, public reputation, authority, and life achievements. The highest visible point revealing how you function in society.',
  11: 'Friendships, networks, future hopes, group affiliations, and the realization of collective, humanitarian ideals.',
  12: 'The unconscious, isolation, hidden karma, hospitals, and spiritual dissolution. The final stage before returning to the womb of existence.'
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
    <div className="w-full h-full flex items-center justify-center bg-[#fdfbf6] text-[#333] font-serif p-0 md:p-8 rounded-none md:rounded-[2.5rem] relative overflow-hidden group">
      {/* Decorative stars / static texture background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      <svg width="800" height="800" viewBox="0 0 800 800" className="max-w-full max-h-full drop-shadow-xl z-10" style={{ filter: 'sepia(0.1)' }}>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Wheel background */}
        <motion.circle 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx={centerX} cy={centerY} r={radiusOuter} fill="#fff" stroke="#d6cfbc" strokeWidth="1" 
        />
        <circle cx={centerX} cy={centerY} r={radiusInner} fill="none" stroke="#d6cfbc" strokeWidth="1" />
        <motion.circle 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          cx={centerX} cy={centerY} r={radiusHouses} fill="#faf8f2" stroke="#d6cfbc" strokeWidth="1" 
        />
        
        {/* Zodiac Signs with colored segments */}
        {SIGN_NAMES.map((sign, i) => {
          const startDegree = i * 30;
          const endDegree = (i + 1) * 30;
          const midDegree = startDegree + 15;
          const isActive = activeInfo?.type === 'sign' && activeInfo?.name === sign;
          
          // Path for segment
          const startAngle = getAngleForDegree(startDegree);
          const endAngle = getAngleForDegree(endDegree);
          const x1 = centerX + Math.cos(startAngle) * radiusOuter;
          const y1 = centerY + Math.sin(startAngle) * radiusOuter;
          const x2 = centerX + Math.cos(endAngle) * radiusOuter;
          const y2 = centerY + Math.sin(endAngle) * radiusOuter;
          const x3 = centerX + Math.cos(endAngle) * radiusInner;
          const y3 = centerY + Math.sin(endAngle) * radiusInner;
          const x4 = centerX + Math.cos(startAngle) * radiusInner;
          const y4 = centerY + Math.sin(startAngle) * radiusInner;
          
          const path = `M ${x1} ${y1} A ${radiusOuter} ${radiusOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${radiusInner} ${radiusInner} 0 0 0 ${x4} ${y4} Z`;
          
          const midPos = getPos(radiusOuter - 30, midDegree);
          
          return (
            <g key={sign}>
              <motion.path 
                d={path}
                fill={isActive ? '#faf1d3' : 'transparent'}
                stroke="#d6cfbc"
                strokeWidth="0.5"
                whileHover={{ fill: 'rgba(217, 119, 6, 0.05)' }}
                onClick={() => handleInteractiveClick('sign', { name: sign, index: i })}
                className="cursor-pointer transition-colors"
                onMouseEnter={() => setHoveredElement({ type: 'sign', name: sign })}
                onMouseLeave={() => setHoveredElement(null)}
              />
              <g 
                className="pointer-events-none"
              >
                <text 
                  x={midPos.x} 
                  y={midPos.y} 
                  fontSize="28" 
                  fill={isActive || hoveredElement?.name === sign ? '#d97706' : '#887c63'} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="transition-colors duration-300 select-none"
                >
                  {SIGN_SYMBOLS[sign]}
                </text>
              </g>
            </g>
          );
        })}

        {/* Houses with Highlighted boundaries */}
        {Array.from({ length: 12 }).map((_, i) => {
          const startDegree = i * 30;
          const endDegree = (i + 1) * 30;
          const midDegree = startDegree + 15;
          const startPosInnerRing = getPos(radiusInner, startDegree);
          const startPosCenter = getPos(80, startDegree);
          const midPos = getPos(radiusHouses - 15, midDegree);
          const isAscDesc = i === 0 || i === 6;
          const isMcIc = i === 3 || i === 9;
          const isActive = activeInfo?.type === 'house' && activeInfo?.number === (i + 1);

          // Boundaries for highlighting
          const startA = getAngleForDegree(startDegree);
          const endA = getAngleForDegree(endDegree);
          const rH = radiusHouses;
          const hX1 = centerX + Math.cos(startA) * rH;
          const hY1 = centerY + Math.sin(startA) * rH;
          const hX2 = centerX + Math.cos(endA) * rH;
          const hY2 = centerY + Math.sin(endA) * rH;
          const hPath = `M ${centerX} ${centerY} L ${hX1} ${hY1} A ${rH} ${rH} 0 0 1 ${hX2} ${hY2} Z`;
          
          return (
            <g key={`house-${i}`}>
              <motion.path 
                d={hPath}
                fill={isActive ? 'rgba(217, 119, 6, 0.03)' : 'transparent'}
                onClick={() => handleInteractiveClick('house', { number: i + 1 })}
                className="cursor-pointer transition-colors"
              />
              <motion.line 
                x1={startPosCenter.x} y1={startPosCenter.y} 
                x2={startPosInnerRing.x} y2={startPosInnerRing.y} 
                stroke={isAscDesc || isMcIc ? "#d97706" : "#e6e1d3"} 
                strokeWidth={isAscDesc || isMcIc ? "2" : "0.5"} 
                strokeDasharray={!(isAscDesc || isMcIc) ? "4 4" : "none"}
                animate={{ opacity: isActive ? 1 : (isAscDesc || isMcIc ? 0.8 : 0.4) }}
              />
              <g 
                className="cursor-pointer"
                onClick={() => handleInteractiveClick('house', { number: i + 1 })}
              >
                <text 
                   x={midPos.x} y={midPos.y} 
                   fontSize="12" fill={isActive ? "#d97706" : "#a39b89"} 
                   fontWeight={isActive ? "bold" : "normal"}
                   textAnchor="middle" dominantBaseline="middle"
                   className="transition-colors font-sans"
                >
                  {i + 1}
                </text>
              </g>
            </g>
          );
        })}

        {/* Aspects (Lines) with motion */}
        {chartAspects.map((aspect: any, idx: number) => {
          const p1 = allBodies?.find((p: any) => p.name === aspect.planet1);
          const p2 = allBodies?.find((p: any) => p.name === aspect.planet2);
          if (!p1 || !p2) return null;
          
          const pos1 = getPos(radiusHouses, SIGN_NAMES.indexOf(p1.sign) * 30 + p1.degree);
          const pos2 = getPos(radiusHouses, SIGN_NAMES.indexOf(p2.sign) * 30 + p2.degree);
          
          const isRelated = hoveredElement?.name === p1.name || hoveredElement?.name === p2.name || 
                           activeInfo?.name === p1.name || activeInfo?.name === p2.name;
          
          return (
            <motion.g key={`aspect-group-${idx}`}>
              <motion.line 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: isRelated ? 0.8 : 0.2,
                  strokeWidth: isRelated ? 3 : 0.4
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                x1={pos1.x} y1={pos1.y}
                x2={pos2.x} y2={pos2.y}
                stroke={ASPECT_COLORS[aspect.type] || '#ccc'}
                strokeDasharray={aspect.type === 'opposition' || aspect.type === 'square' ? '6 3' : 'none'}
                style={{ filter: isRelated ? 'url(#glow)' : 'none' }}
              />
              {isRelated && (
                <motion.circle
                  animate={{ offset: [0, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  r="2"
                  fill={ASPECT_COLORS[aspect.type] || '#ccc'}
                >
                  <animateMotion 
                    path={`M ${pos1.x} ${pos1.y} L ${pos2.x} ${pos2.y}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </motion.circle>
              )}
            </motion.g>
          );
        })}

        {/* Planets */}
        <AnimatePresence>
          {allBodies.map((planet: any, i: number) => {
            const absoluteDegree = SIGN_NAMES.indexOf(planet.sign) * 30 + planet.degree;
            const planetRadius = radiusInner - 25 - (i % 2 === 0 ? 0 : 25); 
            const pos = getPos(planetRadius, absoluteDegree);
            const lineTarget = getPos(radiusInner, absoluteDegree);
            
            const isHovered = hoveredElement?.name === planet.name;
            const isActive = activeInfo?.name === planet.name;

            return (
              <motion.g 
                key={planet.name}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.05 }}
              >
                <line x1={pos.x} y1={pos.y} x2={lineTarget.x} y2={lineTarget.y} stroke={PLANET_COLORS[planet.name] || '#999'} strokeWidth="0.5" strokeDasharray="2 2" />
                
                <g 
                  className="cursor-pointer transition-transform duration-300"
                  onMouseEnter={() => setHoveredElement(planet)}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleInteractiveClick('planet', planet)}
                >
                  <motion.circle 
                    animate={{ 
                      r: isHovered || isActive ? 18 : 14,
                      strokeWidth: isHovered || isActive ? 2 : 1 
                    }}
                    cx={pos.x} cy={pos.y} fill="#fff" stroke={PLANET_COLORS[planet.name] || '#333'} 
                    style={{ boxPadding: '4px' }}
                  />
                  <text 
                    x={pos.x} y={pos.y + 1} 
                    fontSize={isHovered || isActive ? "20" : "16"} 
                    fill={PLANET_COLORS[planet.name] || '#333'} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="font-bold transition-all duration-300 select-none"
                  >
                    {PLANET_SYMBOLS[planet.name] || '?'}
                  </text>
                </g>

                {(isHovered || isActive) && (
                  <motion.text 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    x={pos.x + 20} y={pos.y - 15} 
                    fontSize="12" fill="#333" 
                    className="font-sans font-bold select-none pointer-events-none"
                  >
                    {Math.floor(planet.degree)}° {planet.sign}
                  </motion.text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Axis Labels */}
        {[
          { text: 'AC', x: centerX - radiusOuter - 25, y: centerY, anchor: 'end' },
          { text: 'DC', x: centerX + radiusOuter + 25, y: centerY, anchor: 'start' },
          { text: 'MC', x: centerX, y: centerY - radiusOuter - 25, anchor: 'middle', pos: 'auto' },
          { text: 'IC', x: centerX, y: centerY + radiusOuter + 25, anchor: 'middle', pos: 'hanging' }
        ].map(label => (
          <text 
            key={label.text}
            x={label.x} y={label.y} 
            fontSize="18" fill="#d97706" 
            textAnchor={label.anchor as any} 
            dominantBaseline={label.pos as any || 'middle'} 
            className="font-bold tracking-widest select-none"
          >
            {label.text}
          </text>
        ))}
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
                    {SIGN_MEANINGS[activeInfo.name] || `${activeInfo.name} represents a specific archetypal energy in the cosmos. It rules particular themes, modalities, and elements of the human experience.`}
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
                    {HOUSE_MEANINGS[activeInfo.number] || `The ${activeInfo.number}${activeInfo.number === 1 ? 'st' : activeInfo.number === 2 ? 'nd' : activeInfo.number === 3 ? 'rd' : 'th'} House governs a specific area of life, showing WHERE the planetary energies play out.`}
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
