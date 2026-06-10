import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Star, Compass, Activity, Globe, Sparkles, Navigation, Layers, Flame, Droplets, Wind, Hexagon, Info } from 'lucide-react';
import { CosmicData } from '../types';
import { ProjectableWidget } from './ProjectableWidget';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AstrologyReferenceModal } from './AstrologyReferenceModal';

interface AstrologyDashboardProps {
  data: CosmicData;
  onDeepDive: (title: string, content: string) => void;
}

export const AstrologyDashboard: React.FC<AstrologyDashboardProps> = ({ data, onDeepDive }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'planets' | 'houses' | 'aspects'>('overview');
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  // Elemental balance
  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  data.planets.forEach(p => {
    if (fireSigns.includes(p.sign)) elements.Fire++;
    if (earthSigns.includes(p.sign)) elements.Earth++;
    if (airSigns.includes(p.sign)) elements.Air++;
    if (waterSigns.includes(p.sign)) elements.Water++;
  });

  const dominantElement = Object.entries(elements).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  const ELEMENT_COLORS: any = { Fire: '#f87171', Earth: '#fbbf24', Air: '#60a5fa', Water: '#34d399' };
  
  const getElementColor = (sign: string) => {
    if (fireSigns.includes(sign)) return ELEMENT_COLORS.Fire;
    if (earthSigns.includes(sign)) return ELEMENT_COLORS.Earth;
    if (airSigns.includes(sign)) return ELEMENT_COLORS.Air;
    if (waterSigns.includes(sign)) return ELEMENT_COLORS.Water;
    return '#a855f7';
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-4 h-4 text-red-400" />;
      case 'Water': return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'Air': return <Wind className="w-4 h-4 text-blue-400" />;
      case 'Earth': return <Hexagon className="w-4 h-4 text-amber-400" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  // Find sun, moon, ascendant if possible (Ascendant isn't explicitly in planents usually, maybe house 1 cusp? Let's check for Sun/Moon)
  const sun = data.planets.find(p => p.name === 'Sun');
  const moon = data.planets.find(p => p.name === 'Moon');
  const ascendant = data.planets.find(p => p.name === 'Ascendant' || p.name === 'Rising') || { name: 'Ascendant', sign: data.houses?.[0]?.sign || 'Unknown', degree: 0, house: 1, meaning: "The mask you wear." };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Sub Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Compass },
            { id: 'planets', label: 'Planets', icon: Moon },
            { id: 'houses', label: 'Houses', icon: Globe },
            { id: 'aspects', label: 'Aspects', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap ${activeSubTab === tab.id ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowReferenceModal(true)}
          className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:text-white transition-all text-xs font-bold tracking-widest uppercase"
          title="Astrology Reference Guide"
        >
          <Info className="w-4 h-4" />
          <span className="hidden md:inline">Glossary</span>
        </button>
      </div>

      <AstrologyReferenceModal 
        isOpen={showReferenceModal} 
        onClose={() => setShowReferenceModal(false)}
        initialTab={activeSubTab === 'overview' ? 'planets' : activeSubTab}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* The Big Three */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => onDeepDive('Sun Sign', sun?.meaning || '')} className="cursor-pointer bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 rounded-3xl group hover:border-amber-500/40 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Sun className="w-16 h-16 text-amber-500" /></div>
                  <h3 className="text-[10px] text-amber-400 uppercase tracking-[0.2em] mb-1 font-bold">The Core Identity</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-5 h-5 text-amber-300" />
                    <span className="text-3xl font-light text-white">{sun?.sign || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-3 italic leading-relaxed relative z-10">{sun?.meaning}</p>
                </div>

                <div onClick={() => onDeepDive('Moon Sign', moon?.meaning || '')} className="cursor-pointer bg-gradient-to-br from-slate-300/10 to-blue-400/10 border border-slate-400/20 p-6 rounded-3xl group hover:border-slate-400/40 transition-all hover:shadow-[0_0_30px_rgba(148,163,184,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Moon className="w-16 h-16 text-slate-300" /></div>
                  <h3 className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1 font-bold">Inner Emotional World</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="w-5 h-5 text-slate-300" />
                    <span className="text-3xl font-light text-white">{moon?.sign || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-3 italic leading-relaxed relative z-10">{moon?.meaning}</p>
                </div>

                <div onClick={() => onDeepDive('Rising Sign', ascendant?.meaning || '')} className="cursor-pointer bg-gradient-to-br from-fuchsia-500/10 to-purple-600/10 border border-fuchsia-500/20 p-6 rounded-3xl group hover:border-fuchsia-500/40 transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Navigation className="w-16 h-16 text-fuchsia-500" /></div>
                  <h3 className="text-[10px] text-fuchsia-400 uppercase tracking-[0.2em] mb-1 font-bold">The Outer Mask</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="w-5 h-5 text-fuchsia-300" />
                    <span className="text-3xl font-light text-white">{ascendant?.sign || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-3 italic leading-relaxed relative z-10">{ascendant?.meaning}</p>
                </div>
              </div>

              {/* Elemental Balance */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 flex">
                  {(Object.entries(elements) as [string, number][]).map(([el, count]) => (
                    <div key={el} style={{ flexGrow: count, backgroundColor: ELEMENT_COLORS[el] }} className="h-full"></div>
                  ))}
                </div>
                
                <h3 className="text-sm font-light text-white mb-6 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Elemental Signature</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Object.entries(elements) as [string, number][]).map(([el, count]) => (
                    <div key={el} className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5">
                      <div className="mb-2 p-3 rounded-full" style={{ backgroundColor: `${ELEMENT_COLORS[el]}20`, color: ELEMENT_COLORS[el] }}>
                        {getElementIcon(el)}
                      </div>
                      <span className="text-2xl font-light text-white mb-1">{count}</span>
                      <span className="text-[10px] uppercase tracking-widest text-stone-500">{el}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center text-xs text-stone-400 italic">
                  Your dominant element is <span className="font-bold text-white px-1" style={{ color: ELEMENT_COLORS[dominantElement] }}>{dominantElement}</span>, shaping your primary mode of expression.
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'planets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.planets.map(p => (
                  <ProjectableWidget key={p.name} id={`planet-card-${p.name}`} type="card" componentName="PlanetCard" data={p}>
                    <div onClick={() => onDeepDive(p.name, p.meaning || '')} className="bg-black/40 border border-white/10 rounded-3xl p-5 hover:bg-white/5 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-light text-white flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-xs font-bold" style={{ color: getElementColor(p.sign) }}>
                              {p.name.charAt(0)}
                            </span>
                            {p.name}
                          </h4>
                          <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1 pl-10">
                            {p.sign} • {Math.floor(p.degree)}° • House {p.house}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400 pl-10 line-clamp-3 leading-relaxed group-hover:text-stone-300 transition-colors">
                        {p.meaning}
                      </p>
                    </div>
                  </ProjectableWidget>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'houses' && (
            <div className="space-y-4">
              {!data.houses ? (
                <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10 text-stone-400 text-sm">
                  House data requires a precise birth time to be accurate. Generate a complete reading to view the 12 realms.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.houses.map(h => {
                    const housePlanets = data.planets?.filter(p => p.house === h.houseNumber) || [];
                    
                    return (
                    <div key={h.houseNumber} onClick={() => onDeepDive(`House ${h.houseNumber}: ${h.realmName}`, h.description)} className="bg-black/40 border border-white/10 rounded-3xl p-5 hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 text-6xl font-black text-white/5">{h.houseNumber}</div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">House {h.houseNumber}</span>
                          </div>
                          <h4 className="text-lg font-light text-white mb-2">{h.realmName}</h4>
                          <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-4 mb-4">
                            {h.description}
                          </p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-white/10">
                          <h5 className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Occupying Planets</h5>
                          {housePlanets.length > 0 ? (
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {housePlanets.map(p => (
                                  <span key={p.name} className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-medium" style={{ color: getElementColor(p.sign) }}>
                                    {p.name} ({p.sign})
                                  </span>
                                ))}
                              </div>
                              <div className="w-full h-8 relative bg-black/50 rounded-full border border-white/5 overflow-hidden">
                                <div className="absolute inset-x-0 h-full flex items-center justify-between px-4 opacity-10">
                                  <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
                                </div>
                                {housePlanets.map((p, i) => {
                                  // Spread planets algorithmically across the bar based on degree or index if degree is missing
                                  const position = p.degree !== undefined ? (p.degree / 30) * 100 : ((i + 1) / (housePlanets.length + 1)) * 100;
                                  return (
                                    <div 
                                      key={`visual-${p.name}`} 
                                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all"
                                      style={{ 
                                        left: `calc(${position}% - 8px)`, 
                                        backgroundColor: getElementColor(p.sign) || '#ffffff' 
                                      }}
                                      title={`${p.name} at ${p.degree || '?'}°`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-600 italic">No major planets</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'aspects' && (
            <div className="space-y-4">
              {!data.aspects ? (
                <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10 text-stone-400 text-sm">
                  Aspect geometry is calculating. Update your profile to reveal these planetary connections.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {data.aspects.map((aspect, i) => {
                    const aspectColor = {
                      'conjunction': 'text-fuchsia-400',
                      'trine': 'text-emerald-400',
                      'sextile': 'text-blue-400',
                      'square': 'text-red-400',
                      'opposition': 'text-amber-400'
                    }[aspect.type] || 'text-stone-400';

                    return (
                      <div key={i} onClick={() => onDeepDive(`${aspect.planet1} ${aspect.type} ${aspect.planet2}`, aspect.meaning)} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-white">{aspect.planet1}</span>
                            <Activity className={`w-3 h-3 ${aspectColor}`} />
                            <span className="font-medium text-white">{aspect.planet2}</span>
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-2">{aspect.meaning}</p>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ml-4 px-3 py-1 rounded-full bg-white/5 border border-white/5 ${aspectColor}`}>
                          {aspect.type}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
