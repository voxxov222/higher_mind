import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Compass, Layers, Info, HelpCircle, Brain } from 'lucide-react';
import { swarmEngine } from '../utils/swarmEngine';

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
  'Sun': '#d97706', 'Moon': '#475569', 'Mercury': '#0284c7', 'Venus': '#db2777', 'Mars': '#dc2626',
  'Jupiter': '#854d0e', 'Saturn': '#1e293b', 'Uranus': '#0891b2', 'Neptune': '#4f46e5', 'Pluto': '#7c3aed',
  'North Node': '#059669', 'South Node': '#e11d48', 'Chiron': '#b45309', 'Lilith': '#0f172a'
};

const ASPECT_COLORS: Record<string, string> = {
  'conjunction': '#d97706',
  'opposition': '#dc2626',
  'trine': '#16a34a',
  'square': '#e11d48',
  'sextile': '#2563eb'
};

const SIGN_MEANINGS: Record<string, string> = {
  'Aries': 'The pioneer of the zodiac representing core primal drive, courage, and individual agency. Operates through high-vitality fire initiating new pathways.',
  'Taurus': 'The core builder. Anchors spiritual concept into material permanence. Governs sensory resonance, physical comfort, steady endurance, and stability.',
  'Gemini': 'The versatile messenger. Builds intellectual bridges between ideas. Focuses on fluid communication, curiosity, rapid learning, and mental dexterity.',
  'Cancer': 'The emotional sanctuary. Governs soul memory, deep instinctual nurturing, safety, and ancestral roots. Represents the ocean of subjective feeling.',
  'Leo': 'The sovereign self. Expresses solar light through loving heart-centered leadership, pure creative self-expression, playfulness, and individual pride.',
  'Virgo': 'The dedicated alchemist of routine. Refines skills and operates through analytical service, pristine logic, physical integration, and continuous improvement.',
  'Libra': 'The mirror of equilibrium. Seeks relational harmony, aesthetics, social diplomacy, and understanding the self via reflection of the companion.',
  'Scorpio': 'The deep alchemical diver. Governs secrets of death, birth, intense psychological truth, hidden power dynamics, and absolute spiritual commitment.',
  'Sagittarius': 'The celestial archer seeking truth. Expands mental horizons through philosophy, exploration, higher wisdom, cosmic laws, and optimistic faith.',
  'Capricorn': 'The ultimate master of structure. Climbs mountains of destiny through sustained effort, timeline discipline, karmic duty, and executive authority.',
  'Aquarius': 'The visionary frequency coordinator. Revolutions outdated paradigms to support humanitarian advancement, community alignment, and unique freedom.',
  'Pisces': 'The universal ocean of dissolution. Merges the individual drop into the infinite spiritual expanse. Governs dreams, mysticism, and complete compassion.'
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Identity, physical path, first impressions, and the ASCENDANT point of physical incarnation. Shows HOW you greet the world.',
  2: 'Personal values, resources, individual possessions, financial frequency, security, and your fundamental sense of self-worth.',
  3: 'Immediate mind, daily syntax coding, communications, siblings, local geography, short travels, and information gatherers.',
  4: 'Soul foundations, home sanctuary, ancestral memory, domestic origins, and maternal roots. Represents the deepest subjective core (IC).',
  5: 'Spontaneous joy, creative play, romance, self-expression, children, speculative currents, and things that make the heart ring.',
  6: 'Daily physical labor, body temple health, practical service, animal items, routines, and refinement of skills in physical reality.',
  7: 'One-on-one equal alignments, business partners, contracts, marriage, and open mirrors (DESCENDANT). Shows yourself in contrast to another.',
  8: 'Shared physical resources, intimacy codes, esoteric systems, death, deep psychological transformation, and cellular regeneration.',
  9: 'Higher mind projection, foreign travel, systems of spiritual belief, universities, structured philosophy, and search for truth.',
  10: 'Cosmic authority, public reputation, career legacy, professional destiny, and visible contributions to society (MIDHEAVEN - MC).',
  11: 'Humanitarian networks, friendships, visionary groups, social ideals, and coordinate matrices of futuristic hope.',
  12: 'The unconscious mind, dream dimensions, solitude, karmic dissolution, spiritual retreat, hidden challenges, and universal oneness.'
};

const HOUSE_TIERS: Record<number, { title: string, element: string, quality: string }> = {
  1: { title: 'House of Presence', element: 'Fire', quality: 'Angular (Life)' },
  2: { title: 'House of Worth', element: 'Earth', quality: 'Succedent (Substance)' },
  3: { title: 'House of Expression', element: 'Air', quality: 'Cadent (Relationship)' },
  4: { title: 'House of Origins', element: 'Water', quality: 'Angular (Endings)' },
  5: { title: 'House of Radiance', element: 'Fire', quality: 'Succedent (Life)' },
  6: { title: 'House of Purification', element: 'Earth', quality: 'Cadent (Substance)' },
  7: { title: 'House of Mirroring', element: 'Air', quality: 'Angular (Relationship)' },
  8: { title: 'House of Rebirth', element: 'Water', quality: 'Succedent (Endings)' },
  9: { title: 'House of Revelation', element: 'Fire', quality: 'Cadent (Life)' },
  10: { title: 'House of Midheaven', element: 'Earth', quality: 'Angular (Substance)' },
  11: { title: 'House of Fellowship', element: 'Air', quality: 'Succedent (Relationship)' },
  12: { title: 'House of Transcendence', element: 'Water', quality: 'Cadent (Endings)' }
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

const SIGN_DETAILS: Record<string, { element: string, ruler: string, archetype: string }> = {
  'Aries': { element: 'Fire', ruler: 'Mars', archetype: 'The Pioneer' },
  'Taurus': { element: 'Earth', ruler: 'Venus', archetype: 'The Builder' },
  'Gemini': { element: 'Air', ruler: 'Mercury', archetype: 'The Messenger' },
  'Cancer': { element: 'Water', ruler: 'Moon', archetype: 'The Nurturer' },
  'Leo': { element: 'Fire', ruler: 'Sun', archetype: 'The Sovereign' },
  'Virgo': { element: 'Earth', ruler: 'Mercury', archetype: 'The Healer' },
  'Libra': { element: 'Air', ruler: 'Venus', archetype: 'The Diplomat' },
  'Scorpio': { element: 'Water', ruler: 'Pluto/Mars', archetype: 'The Alchemist' },
  'Sagittarius': { element: 'Fire', ruler: 'Jupiter', archetype: 'The Explorer' },
  'Capricorn': { element: 'Earth', ruler: 'Saturn', archetype: 'The Architect' },
  'Aquarius': { element: 'Air', ruler: 'Uranus', archetype: 'The Visionary' },
  'Pisces': { element: 'Water', ruler: 'Neptune', archetype: 'The Mystic' }
};

export const ClassicBirthChart = ({ data, selectedPlanet, onPlanetClick }: any) => {
  const [hoveredElement, setHoveredElement] = useState<any>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<number | null>(null);
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
    if (selectedPlanet) {
      setActiveInfo({ type: 'planet', ...selectedPlanet });
    }
  }, [selectedPlanet]);

  const centerX = 400;
  const centerY = 400;
  const radiusOuter = 320;
  const radiusInner = 265;
  const radiusHouses = 210;

  const getAngleForDegree = (absoluteDegree: number) => {
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
    }
  };

  const [investigating, setInvestigating] = useState<string | null>(null);

  // Synthesize custom descriptions on the fly
  const getDynamicPlanetInterpretation = (planetName: string, sign: string, houseNum: number) => {
    const detail = SIGN_DETAILS[sign];
    const ruler = detail?.ruler || 'its core governor';
    const element = detail?.element || 'pure celestial essence';
    const archetype = detail?.archetype || 'Cosmic Archetype';
    const houseTopic = HOUSE_MEANINGS[houseNum]?.split(',')[0] || 'your core legacy';

    return `This placement filters your ${planetName} energy—which handles your ${PLANET_MEANINGS[planetName]?.split('.')[0].toLowerCase()}—through the vibrational grid of ${sign}. Resonating with the archetype of "${archetype}" within the ${element} elements (governed by ${ruler}), this cosmic pressure releases directly into your ${houseNum}${houseNum === 1 ? 'st' : houseNum === 2 ? 'nd' : houseNum === 3 ? 'rd' : 'th'} House. This ensures that your evolutionary work manifests powerfully in the sector of your life governing ${houseTopic}. Here, you must learn to synthesize and express this unique alignment.`;
  };

  const handleInvestigate = (context: string) => {
     let cosmicString = "Unknown birth data";
     if (data?.natalChart) {
         cosmicString = `${data.natalChart.firstName || 'User'} born ${data.natalChart.date} at ${data.natalChart.time} in ${data.natalChart.location}`;
     }
     swarmEngine.startTargetedResearch(context, cosmicString);
     
     setInvestigating(context);
     setTimeout(() => setInvestigating(null), 3000);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center bg-[#fdfbf6] text-[#333] font-serif p-4 md:p-8 rounded-[2.5rem] relative overflow-hidden group border-4 border-[#e6decc] shadow-2xl">
      {/* Royal paper stardust texture background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />
      
      {/* Left Axis: The Sacred Geometry SVG Wheel */}
      <div className="relative w-full md:w-[60%] flex items-center justify-center p-2">
        <svg viewBox="0 0 800 800" className="w-full h-auto max-w-[650px] drop-shadow-2xl z-10 select-none">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="3" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background Foundations */}
          <motion.circle 
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            cx={centerX} cy={centerY} r={radiusOuter} fill="#fff" stroke="#d6cfbc" strokeWidth="2.5" 
          />
          <circle cx={centerX} cy={centerY} r={radiusInner} fill="none" stroke="#d6cfbc" strokeWidth="1" />
          <motion.circle 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            cx={centerX} cy={centerY} r={radiusHouses} fill="#faf8f2" stroke="#d6cfbc" strokeWidth="1" 
          />
          
          {/* Zodiac Sign Segments around the border */}
          {SIGN_NAMES.map((sign, i) => {
            const startDegree = i * 30;
            const endDegree = (i + 1) * 30;
            const midDegree = startDegree + 15;
            const isActive = activeInfo?.type === 'sign' && activeInfo?.name === sign;
            const isHovered = hoveredElement?.type === 'sign' && hoveredElement?.name === sign;
            
            // Generate path arc segment
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
            const midPos = getPos(radiusOuter - 28, midDegree);
            
            return (
              <g key={`sign-arc-${sign}`}>
                <motion.path 
                  d={path}
                  fill={isActive ? 'rgba(139, 92, 246, 0.08)' : isHovered ? 'rgba(217, 119, 6, 0.04)' : 'transparent'}
                  stroke="#d6cfbc"
                  strokeWidth="0.8"
                  whileHover={{ fill: 'rgba(217, 119, 6, 0.03)' }}
                  onClick={() => handleInteractiveClick('sign', { name: sign, index: i })}
                  onMouseEnter={() => setHoveredElement({ type: 'sign', name: sign })}
                  onMouseLeave={() => setHoveredElement(null)}
                  className="cursor-pointer transition-all duration-300"
                />
                <g className="pointer-events-none">
                  <text 
                    x={midPos.x} 
                    y={midPos.y} 
                    fontSize="24" 
                    fill={isActive || isHovered ? '#d97706' : '#887c63'} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="transition-colors duration-300 select-none font-serif"
                    style={{ textShadow: isActive || isHovered ? '0 0 8px rgba(217,119,6,0.2)' : 'none' }}
                  >
                    {SIGN_SYMBOLS[sign]}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Houses segments with highlighted boundaries */}
          {Array.from({ length: 12 }).map((_, i) => {
            const houseNumber = i + 1;
            const startDegree = i * 30;
            const endDegree = (i + 1) * 30;
            const midDegree = startDegree + 15;
            const startPosInnerRing = getPos(radiusInner, startDegree);
            const startPosCenter = getPos(80, startDegree);
            const midPos = getPos(radiusHouses - 15, midDegree);
            const isAscDesc = i === 0 || i === 6;
            const isMcIc = i === 3 || i === 9;
            const isActive = activeInfo?.type === 'house' && activeInfo?.number === houseNumber;
            const isHovered = hoveredHouse === houseNumber;

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
                  fill={isActive ? 'rgba(139, 92, 246, 0.08)' : isHovered ? 'rgba(139, 92, 246, 0.04)' : 'transparent'}
                  stroke={isHovered || isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent'}
                  strokeWidth="1"
                  onClick={() => handleInteractiveClick('house', { number: houseNumber })}
                  onMouseEnter={() => setHoveredHouse(houseNumber)}
                  onMouseLeave={() => setHoveredHouse(null)}
                  className="cursor-pointer transition-all duration-300"
                />
                
                {/* Standard boundaries */}
                <motion.line 
                  x1={startPosCenter.x} y1={startPosCenter.y} 
                  x2={startPosInnerRing.x} y2={startPosInnerRing.y} 
                  stroke={isActive || isHovered ? "#8b5cf6" : (isAscDesc || isMcIc ? "#d97706" : "#cbd5e1")} 
                  strokeWidth={isMcIc || isAscDesc ? "2" : (isActive || isHovered ? "1.5" : "0.5")} 
                  strokeDasharray={!(isAscDesc || isMcIc) ? "4 4" : "none"}
                  animate={{ opacity: isActive || isHovered ? 1 : (isAscDesc || isMcIc ? 0.85 : 0.3) }}
                  className="transition-all duration-300"
                />
                
                {/* Clickable Numeric Area */}
                <g 
                  className="cursor-pointer"
                  onClick={() => handleInteractiveClick('house', { number: houseNumber })}
                  onMouseEnter={() => setHoveredHouse(houseNumber)}
                  onMouseLeave={() => setHoveredHouse(null)}
                >
                  {(isActive || isHovered) && (
                    <circle cx={midPos.x} cy={midPos.y} r="10" fill="rgba(139, 92, 246, 0.08)" stroke="#8b5cf6" strokeWidth="0.8" />
                  )}
                  <text 
                     x={midPos.x} y={midPos.y} 
                     fontSize="11" 
                     fill={isActive ? "#d97706" : isHovered ? "#8b5cf6" : "#64748b"} 
                     fontWeight={isActive || isHovered ? "bold" : "normal"}
                     textAnchor="middle" dominantBaseline="middle"
                     className="transition-colors font-sans"
                  >
                    {houseNumber}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Aspect Lines between Planets */}
          {chartAspects.map((aspect: any, idx: number) => {
            const p1 = allBodies?.find((p: any) => p.name === aspect.planet1);
            const p2 = allBodies?.find((p: any) => p.name === aspect.planet2);
            if (!p1 || !p2) return null;
            
            const pos1 = getPos(radiusHouses, SIGN_NAMES.indexOf(p1.sign) * 30 + p1.degree);
            const pos2 = getPos(radiusHouses, SIGN_NAMES.indexOf(p2.sign) * 30 + p2.degree);
            
            const isRelated = hoveredElement?.name === p1.name || hoveredElement?.name === p2.name || 
                             activeInfo?.name === p1.name || activeInfo?.name === p2.name;
            const isHovered = hoveredAspect === idx;
            const midX = (pos1.x + pos2.x) / 2;
            const midY = (pos1.y + pos2.y) / 2;
            
            return (
              <g 
                key={`aspect-${idx}`}
                onMouseEnter={() => setHoveredAspect(idx)}
                onMouseLeave={() => setHoveredAspect(null)}
                className="cursor-pointer"
              >
                {/* Invisible thicker line for easier hovering */}
                <line
                  x1={pos1.x} y1={pos1.y}
                  x2={pos2.x} y2={pos2.y}
                  stroke="transparent"
                  strokeWidth="15"
                />
                <motion.line 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: isRelated || isHovered ? 0.95 : 0.12,
                    strokeWidth: isRelated || isHovered ? 3 : 0.5
                  }}
                  transition={{ duration: 1 }}
                  x1={pos1.x} y1={pos1.y}
                  x2={pos2.x} y2={pos2.y}
                  stroke={ASPECT_COLORS[aspect.type] || '#cbd5e1'}
                  strokeDasharray={aspect.type === 'opposition' || aspect.type === 'square' ? '5 3' : 'none'}
                  style={{ filter: isRelated || isHovered ? 'url(#glow)' : 'none' }}
                />
                {(isRelated || isHovered) && (
                  <circle r="3" fill={ASPECT_COLORS[aspect.type] || '#94a3b8'} style={{ filter: 'url(#glow)' }}>
                    <animateMotion 
                      path={`M ${pos1.x} ${pos1.y} L ${pos2.x} ${pos2.y}`} 
                      dur="2.5s" 
                      repeatCount="indefinite" 
                    />
                  </circle>
                )}
                {isHovered && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect x="-40" y="-12" width="80" height="24" rx="12" fill="white" stroke={ASPECT_COLORS[aspect.type]} strokeWidth="2" style={{ filter: 'url(#shadow)' }} />
                    <text x="0" y="1" fontSize="10" fill={ASPECT_COLORS[aspect.type]} textAnchor="middle" dominantBaseline="middle" className="font-bold uppercase tracking-widest font-sans">
                      {aspect.type}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Interactive connections specifically mapping focused/hovered Houses to occupant planets */}
          {allBodies.map((planet: any, i: number) => {
            const absoluteDegree = SIGN_NAMES.indexOf(planet.sign) * 30 + planet.degree;
            const planetRadius = radiusInner - 22 - (i % 2 === 0 ? 0 : 25); 
            const pPos = getPos(planetRadius, absoluteDegree);
            
            const isHouseActive = activeInfo?.type === 'house' && activeInfo?.number === planet.house;
            const isHouseHovered = hoveredHouse === planet.house;
            const isLinkActive = isHouseActive || isHouseHovered;
            
            if (!isLinkActive) return null;
            
            const midDegree = (planet.house - 1) * 30 + 15;
            const hPos = getPos(radiusHouses - 15, midDegree);
            
            return (
              <g key={`link-h-${planet.house}-p-${planet.name}`}>
                {/* Flow pathway line */}
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  x1={hPos.x} y1={hPos.y}
                  x2={pPos.x} y2={pPos.y}
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  style={{ filter: 'url(#glow)' }}
                />
                <circle r="4" fill="#d97706" style={{ filter: 'url(#glow)' }}>
                  <animateMotion 
                    path={`M ${hPos.x} ${hPos.y} L ${pPos.x} ${pPos.y}`}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Render Planet Symbols inside the Inner space */}
          {allBodies.map((planet: any, i: number) => {
            const absoluteDegree = SIGN_NAMES.indexOf(planet.sign) * 30 + planet.degree;
            const planetRadius = radiusInner - 22 - (i % 2 === 0 ? 0 : 25); 
            const pos = getPos(planetRadius, absoluteDegree);
            const lineTarget = getPos(radiusInner, absoluteDegree);
            
            const isHovered = hoveredElement?.name === planet.name;
            const isActive = activeInfo?.name === planet.name;
            const isHouseConnected = hoveredHouse === planet.house || (activeInfo?.type === 'house' && activeInfo?.number === planet.house);

            return (
              <g key={`planet-node-${planet.name}`}>
                {/* Core connector needle */}
                <line 
                  x1={pos.x} y1={pos.y} 
                  x2={lineTarget.x} y2={lineTarget.y} 
                  stroke={PLANET_COLORS[planet.name] || '#94a3b8'} 
                  strokeWidth="0.6" 
                  strokeDasharray="2 2" 
                />
                
                {/* Click target sphere */}
                <g 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredElement(planet)}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleInteractiveClick('planet', planet)}
                >
                  {/* Glowing halo for hovered/active elements or house connection matching */}
                  {(isHovered || isActive || isHouseConnected) && (
                    <motion.circle 
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      cx={pos.x} cy={pos.y} 
                      r="22" 
                      fill="none" 
                      stroke={PLANET_COLORS[planet.name] || '#d97706'} 
                      strokeWidth="1.5" 
                    />
                  )}
                  
                  <motion.circle 
                    animate={{ 
                      r: isHovered || isActive ? 17 : 13.5,
                      strokeWidth: isHovered || isActive ? 2 : 1 
                    }}
                    cx={pos.x} cy={pos.y} 
                    fill="#fff" 
                    stroke={PLANET_COLORS[planet.name] || '#333'} 
                    style={{ filter: 'url(#shadow)' }}
                  />
                  <text 
                    x={pos.x} y={pos.y + 1} 
                    fontSize={isHovered || isActive ? "18" : "14"} 
                    fill={PLANET_COLORS[planet.name] || '#333'} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="font-bold transition-all duration-300 select-none font-serif"
                  >
                    {PLANET_SYMBOLS[planet.name] || '?'}
                  </text>
                </g>

                {(isHovered || isActive) && (
                  <motion.g initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Visual degree readout */}
                    <rect x={pos.x + 18} y={pos.y - 25} width="65" height="18" rx="4" fill="#faf8f2" stroke="#d6cfbc" strokeWidth="0.5" style={{ filter: 'url(#shadow)' }} />
                    <text 
                      x={pos.x + 24} y={pos.y - 12} 
                      fontSize="9" fill="#1e293b" 
                      className="font-sans font-bold select-none pointer-events-none"
                    >
                      {Math.floor(planet.degree)}° {planet.sign.slice(0, 3).toUpperCase()}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}

          {/* Coordinate Axis Labels: AC, DC, MC, IC */}
          {[
            { text: 'AC', x: centerX - radiusOuter - 22, y: centerY, anchor: 'end' },
            { text: 'DC', x: centerX + radiusOuter + 22, y: centerY, anchor: 'start' },
            { text: 'MC', x: centerX, y: centerY - radiusOuter - 22, anchor: 'middle', pos: 'auto' },
            { text: 'IC', x: centerX, y: centerY + radiusOuter + 22, anchor: 'middle', pos: 'hanging' }
          ].map(label => (
            <text 
              key={label.text}
              x={label.x} y={label.y} 
              fontSize="16" fill="#d97706" 
              textAnchor={label.anchor as any} 
              dominantBaseline={label.pos as any || 'middle'} 
              className="font-bold tracking-widest select-none font-serif"
            >
              {label.text}
            </text>
          ))}
        </svg>
      </div>

      {/* Right Axis: Highly Explanatory, Animated Holy Parchment Scroll */}
      <div className="w-full md:w-[40%] h-full min-h-[500px] flex flex-col justify-start items-center bg-[#fbf9f4] border-t-4 md:border-t-0 md:border-l-4 border-[#e6decc] p-6 relative overflow-hidden">
        
        <div className="w-full mb-4 pb-3 border-b-2 border-[#e6decc]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="text-[#d97706] animate-pulse" size={20} />
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#887c63]">Sovereign Synthesis</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
        </div>

        <div className="w-full flex-grow overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {activeInfo ? (
              <motion.div 
                key={activeInfo.type + activeInfo.name + (activeInfo.number || '')}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {activeInfo.type === 'planet' && (
                  <div>
                    <div className="flex items-center gap-4 bg-[#fffcf5] p-4 rounded-2xl border border-[#e6decc] shadow-sm mb-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Sparkles size={40} className="text-[#d97706]" />
                      </div>
                      <div className="text-4xl text-[#d97706] font-serif border border-[#e6decc] rounded-xl px-2 bg-white drop-shadow-sm select-none">
                        {PLANET_SYMBOLS[activeInfo.name]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold font-serif text-[#1e293b] leading-tight flex items-center gap-2">
                          {activeInfo.name}
                        </h3>
                        <p className="text-[11px] font-sans tracking-widest text-[#d97706] uppercase font-bold mt-1">
                          {Math.floor(activeInfo.degree)}° {activeInfo.sign} • House {activeInfo.house}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1 flex items-center gap-1.5 font-sans"><Layers size={10} />Core Celestial Drive</h4>
                        <p className="text-stone-700 text-sm leading-relaxed">{PLANET_MEANINGS[activeInfo.name] || 'Active celestial frequency.'}</p>
                      </div>

                      <div className="bg-[#fffcf5] border-l-4 border-[#d97706] p-4 rounded-r-xl shadow-inner shadow-black/[0.01]">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#d97706] mb-2 flex items-center gap-1.5 font-sans"><Sparkles size={10} />Plenary Resonance Synthesis</h4>
                        <p className="text-stone-800 text-sm leading-relaxed font-serif italic">
                          {getDynamicPlanetInterpretation(activeInfo.name, activeInfo.sign, activeInfo.house)}
                        </p>
                      </div>

                      {/* Aspects details */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 font-serif">Aspect Harmonizer Links</h4>
                        <div className="space-y-2">
                          {chartAspects.filter((a: any) => a.planet1 === activeInfo.name || a.planet2 === activeInfo.name).map((a: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1 p-3 bg-white border border-[#e6decc]/50 rounded-xl hover:border-[#d97706] transition-colors shadow-sm">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold uppercase tracking-wider font-sans text-stone-800" style={{ color: ASPECT_COLORS[a.type] || '#d97706' }}>
                                  ● {a.type}
                                </span>
                                <span className="text-stone-400">with</span>
                                <span className="font-bold text-[#d97706] font-serif underline underline-offset-4 decoration-stone-200">
                                  {a.planet1 === activeInfo.name ? a.planet2 : a.planet1}
                                </span>
                              </div>
                              {a.meaning && (
                                <p className="text-[11px] text-stone-500 italic leading-relaxed mt-1 border-t border-stone-100 pt-1">
                                  {a.meaning}
                                </p>
                              )}
                            </div>
                          ))}
                          {chartAspects.filter((a: any) => a.planet1 === activeInfo.name || a.planet2 === activeInfo.name).length === 0 && (
                            <p className="text-stone-400 italic text-xs">No current major geometric aspect linkages mapped to this coordinate point.</p>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleInvestigate(`${activeInfo.name} in ${activeInfo.sign} in the ${activeInfo.house} house`)}
                        className={`w-full mt-4 py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${investigating === `${activeInfo.name} in ${activeInfo.sign} in the ${activeInfo.house} house` ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'}`}
                      >
                         <Brain size={14} className={investigating === `${activeInfo.name} in ${activeInfo.sign} in the ${activeInfo.house} house` ? 'animate-pulse' : ''} /> 
                         {investigating === `${activeInfo.name} in ${activeInfo.sign} in the ${activeInfo.house} house` ? 'SWARM AGENT DEPLOYED TO RESEARCH' : 'DEEP INVESTIGATE PLACEMENT'}
                      </button>
                    </div>
                  </div>
                )}

                {activeInfo.type === 'sign' && (
                  <div>
                    <div className="flex items-center gap-4 bg-[#fffcf5] p-4 rounded-2xl border border-[#e6decc] shadow-sm mb-4">
                      <div className="text-4xl text-[#d97706] font-serif border border-[#e6decc] rounded-xl px-2 bg-white drop-shadow-sm select-none">
                        {SIGN_SYMBOLS[activeInfo.name]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold font-serif text-[#1e293b]">{activeInfo.name}</h3>
                        <p className="text-[10px] font-sans tracking-widest text-[#d97706] uppercase font-bold mt-1">
                          {SIGN_DETAILS[activeInfo.name]?.element} • Ruler: {SIGN_DETAILS[activeInfo.name]?.ruler}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 flex items-center gap-1.5 font-sans"><Compass size={10} />Cosmic Archetype</h4>
                        <p className="text-stone-800 text-sm font-bold font-serif italic text-[#d97706]">"{SIGN_DETAILS[activeInfo.name]?.archetype || 'The Explorer'}"</p>
                      </div>

                      <div className="bg-[#fffcf5] border border-[#e6decc] p-4 rounded-xl shadow-inner">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-2 font-sans flex items-center gap-1.5"><Info size={10} />Vibrational Pattern</h4>
                        <p className="text-stone-700 text-sm leading-relaxed font-serif">
                          {SIGN_MEANINGS[activeInfo.name]}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleInvestigate(`${activeInfo.name} zodiac sign`)}
                        className={`w-full mt-4 py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${investigating === `${activeInfo.name} zodiac sign` ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'}`}
                      >
                         <Brain size={14} className={investigating === `${activeInfo.name} zodiac sign` ? 'animate-pulse' : ''} /> 
                         {investigating === `${activeInfo.name} zodiac sign` ? 'SWARM AGENT DEPLOYED TO RESEARCH' : 'DEEP INVESTIGATE ATTRIBUTES'}
                      </button>
                    </div>
                  </div>
                )}

                {activeInfo.type === 'house' && (
                  <div>
                    <div className="flex items-center gap-4 bg-[#fffcf5] p-4 rounded-2xl border border-[#e6decc] shadow-sm mb-4">
                      <div className="text-3xl text-[#d97706] font-bold font-serif border border-[#e6decc] rounded-xl px-3 bg-white drop-shadow-sm flex items-center justify-center">
                        {activeInfo.number}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-serif text-[#1e293b]">House {activeInfo.number}</h3>
                        <p className="text-[10px] font-sans tracking-widest text-[#d97706] uppercase font-bold mt-1">
                          {HOUSE_TIERS[activeInfo.number]?.title}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-stone-50 border border-stone-200 px-3 py-2.5 rounded-lg text-center">
                          <span className="text-[8px] text-stone-400 block uppercase tracking-wider font-sans">Triplicity</span>
                          <span className="text-xs text-[#d97706] font-bold font-serif">{HOUSE_TIERS[activeInfo.number]?.element} Element</span>
                        </div>
                        <div className="bg-stone-50 border border-stone-200 px-3 py-2.5 rounded-lg text-center">
                          <span className="text-[8px] text-stone-400 block uppercase tracking-wider font-sans">Quadruplicity</span>
                          <span className="text-xs text-stone-800 font-bold font-serif">{HOUSE_TIERS[activeInfo.number]?.quality}</span>
                        </div>
                      </div>

                      <div className="bg-[#fffcf5] border border-[#e6decc] p-4 rounded-xl shadow-inner">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-2 font-sans flex items-center gap-1.5"><Layers size={10} />Realm of Physical Experience</h4>
                        <p className="text-stone-700 text-sm leading-relaxed font-serif border-l-2 border-[#d97706]/40 pl-3">
                          {HOUSE_MEANINGS[activeInfo.number]}
                        </p>
                      </div>

                      {/* Display Occupant forces */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 font-serif flex items-center gap-1.5"><HelpCircle size={12} />Active Placements Represented</h4>
                        <div className="flex flex-wrap gap-2">
                          {allBodies.filter((p: any) => p.house === activeInfo.number).map((p: any) => (
                            <div 
                              key={p.name} 
                              className="px-3 py-1.5 bg-white border border-[#e6decc] rounded-full text-xs font-bold text-[#d97706] shadow-sm flex items-center gap-1.5 cursor-pointer hover:bg-amber-50 hover:border-amber-400 transition-colors"
                              onClick={() => handleInteractiveClick('planet', p)}
                            >
                              <span>{PLANET_SYMBOLS[p.name]}</span>
                              <span>{p.name}</span>
                              <span className="text-[9px] font-sans font-normal text-stone-400">({Math.floor(p.degree)}° {p.sign})</span>
                            </div>
                          ))}
                          {allBodies.filter((p: any) => p.house === activeInfo.number).length === 0 && (
                            <p className="text-stone-400 italic text-xs">This cosmic sector of your life experience is empty of principal planetary bodies. It is governed primarily by its cusp sign frequency.</p>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleInvestigate(`The ${activeInfo.number}${activeInfo.number === 1 ? 'st' : activeInfo.number === 2 ? 'nd' : activeInfo.number === 3 ? 'rd' : 'th'} House of ${HOUSE_TIERS[activeInfo.number]?.title.replace('House of ', '')}`)}
                        className={`w-full mt-4 py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${investigating === `The ${activeInfo.number}${activeInfo.number === 1 ? 'st' : activeInfo.number === 2 ? 'nd' : activeInfo.number === 3 ? 'rd' : 'th'} House of ${HOUSE_TIERS[activeInfo.number]?.title.replace('House of ', '')}` ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'}`}
                      >
                         <Brain size={14} className={investigating === `The ${activeInfo.number}${activeInfo.number === 1 ? 'st' : activeInfo.number === 2 ? 'nd' : activeInfo.number === 3 ? 'rd' : 'th'} House of ${HOUSE_TIERS[activeInfo.number]?.title.replace('House of ', '')}` ? 'animate-pulse' : ''} /> 
                         {investigating === `The ${activeInfo.number}${activeInfo.number === 1 ? 'st' : activeInfo.number === 2 ? 'nd' : activeInfo.number === 3 ? 'rd' : 'th'} House of ${HOUSE_TIERS[activeInfo.number]?.title.replace('House of ', '')}` ? 'SWARM AGENT DEPLOYED TO RESEARCH' : 'DEEP INVESTIGATE DOMAIN'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-[#d97706]/30 mx-auto text-amber-600 animate-pulse">
                  <Compass size={28} />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#1e293b]">Celestial Geometry Active</h3>
                <p className="text-stone-500 text-sm leading-relaxed font-serif max-w-[320px] mx-auto text-center">
                  Click any **Planet, House wedge, or Zodiac symbol** on the left chart to initiate deep psychological synthesis and pathway diagnostics.
                </p>
                <div className="pt-4 flex flex-col gap-2 max-w-[280px] mx-auto text-left text-xs text-stone-500 border-t border-[#e6decc]/40">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                    <span>Gold paths show House to Planet link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Trines represent effortless talents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    <span>Squares highlight dynamic tension</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeInfo && (
          <div className="w-full mt-4 pt-4 border-t border-[#e6decc]/60 text-center">
            <button
              onClick={() => setActiveInfo(null)}
              className="text-[10px] text-stone-400 uppercase tracking-widest font-sans font-bold hover:text-stone-800 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              Reset Selection <X size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
