import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  X, Hash, Activity, History, ChevronRight, Sparkles, Orbit, Globe, 
  RefreshCw, AlertTriangle, Search, TrendingUp, Info, Calendar, MapPin, User 
} from 'lucide-react';
import { calculateNakshatra } from '../utils/vedastroEngine';

const KarmaLedger = React.lazy(() => import('./KarmaLedger').then(m => ({ default: m.KarmaLedger })));
const ChakraScene = React.lazy(() => import('./ChakraScene'));
const GematriaHUD = React.lazy(() => import('./GematriaHUD').then(m => ({ default: m.GematriaHUD })));
const GematriaCalculatorSection = React.lazy(() => import('./GematriaCalculatorSection').then(m => ({ default: m.GematriaCalculatorSection })));

// Timezone and input format helpers for VedAstro API
const getLocalTimezoneOffset = () => {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60).toString().padStart(2, '0');
  const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
};

const formatInputDate = (dateStr: string) => {
  if (!dateStr || !dateStr.includes('-')) return '25/10/1992';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const getCoordinatesForLocation = (locName: string) => {
  const lower = (locName || '').toLowerCase();
  if (lower.includes('mumbai')) return { lat: 19.0760, lon: 72.8777 };
  if (lower.includes('delhi')) return { lat: 28.6139, lon: 77.2090 };
  if (lower.includes('london')) return { lat: 51.5074, lon: -0.1278 };
  if (lower.includes('york')) return { lat: 40.7128, lon: -74.0060 };
  if (lower.includes('los angeles') || lower.includes('la')) return { lat: 34.0522, lon: -118.2437 };
  if (lower.includes('san francisco') || lower.includes('sf')) return { lat: 37.7749, lon: -122.4194 };
  if (lower.includes('sydney')) return { lat: -33.8688, lon: 151.2093 };
  if (lower.includes('tokyo')) return { lat: 35.6762, lon: 139.6503 };
  if (lower.includes('paris')) return { lat: 48.8566, lon: 2.3522 };
  return { lat: 19.0760, lon: 72.8777 };
};

const SIGN_NUMBERS: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
  Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
  Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12
};

export const HoloSideDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: any;
  activeTool: 'gematria' | 'chakra' | 'karma' | 'vedastro';
  setActiveTool: (tool: 'gematria' | 'chakra' | 'karma' | 'vedastro') => void;
  loadedInputs?: any;
}> = ({ isOpen, onClose, data, activeTool, setActiveTool, loadedInputs }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const tf1X = useTransform(smoothX, x => x * -0.1);
  const tf1Y = useTransform(smoothY, y => y * -0.1);
  const tf2X = useTransform(smoothX, x => x * 0.1);
  const tf2Y = useTransform(smoothY, y => y * 0.1);
  const tf3X = useTransform(smoothX, x => x * 0.2);
  const tf3Y = useTransform(smoothY, y => y * 0.15);
  const tf4X = useTransform(smoothX, x => x * -0.05);
  const tf4Y = useTransform(smoothY, y => y * -0.05);

  // VedAstro live prediction states
  const [vedastroPredictions, setVedastroPredictions] = useState<any[]>([]);
  const [vedastroLoading, setVedastroLoading] = useState<boolean>(false);
  const [vedastroError, setVedastroError] = useState<string>('');
  const [vedastroSearch, setVedastroSearch] = useState<string>('');
  const [vedastroFilter, setVedastroFilter] = useState<'All' | 'Good' | 'Bad' | 'Neutral'>('All');

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 50; 
    const y = (e.clientY / window.innerHeight - 0.5) * 50;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    if (!isOpen) {
      mouseX.set(0);
      mouseY.set(0);
    }
  }, [isOpen, mouseX, mouseY]);

  // Handler to fetch live predictions
  const fetchDrawerPredictions = async () => {
    const loc = loadedInputs?.location || 'Mumbai';
    const bDate = loadedInputs?.date || '1992-10-25';
    const bTime = loadedInputs?.time || '14:30';
    const coords = getCoordinatesForLocation(loc);
    const tz = getLocalTimezoneOffset();
    
    setVedastroLoading(true);
    setVedastroError('');
    setVedastroPredictions([]);
    
    try {
      const formattedDate = formatInputDate(bDate);
      const body = {
        Time: {
          StdTime: `${bTime} ${formattedDate} ${tz}`,
          Location: {
            Name: loc,
            Longitude: coords.lon,
            Latitude: coords.lat
          }
        },
        Ayanamsa: 'RAMAN'
      };

      const res = await fetch('https://api.vedastro.org/api/Calculate/HoroscopePredictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const resData = await res.json();
      if (resData.Status === 'Pass') {
        setVedastroPredictions(resData.Payload || []);
      } else {
        throw new Error(resData.Payload || 'Unknown API failure');
      }
    } catch (err: any) {
      setVedastroError(err.message || 'Connection failed');
    } finally {
      setVedastroLoading(false);
    }
  };

  // Safe longitude extraction for instant local Nakshatra Gnosis
  const getLongitude = (p: any) => {
    const signIndex = (SIGN_NUMBERS[p.sign] || 1) - 1;
    const deg = p.degree || 0;
    return (deg > 30) ? deg : (signIndex * 30 + deg);
  };

  const localPlanets = data?.planets || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-[2px] pointer-events-auto"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseMove={handleMouseMove}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-[160] bg-zinc-950/90 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto"
            style={{ perspective: 1000 }}
          >
            {/* Holographic glowing edge */}
            <motion.div 
              style={{ x: tf1X, y: tf1Y }}
              className={`absolute left-0 top-0 bottom-0 w-px ${
              activeTool === 'gematria' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' :
              activeTool === 'chakra' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' :
              activeTool === 'karma' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' :
              'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
            }`} />

            {/* Header */}
            <motion.div 
              style={{ x: tf2X, y: tf2Y }}
              className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 relative z-10"
            >
              <div className="flex items-center gap-2">
                <ChevronRight size={16} className="text-stone-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="text-cyan-400">HOLO</span>
                  <span className="text-stone-500">///</span>
                  <span className="text-stone-300">UTILITIES</span>
                </span>
              </div>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-rose-400 transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                <X size={16} />
              </button>
            </motion.div>

            {/* Tool Selection */}
            <motion.div 
              style={{ x: tf3X, y: tf3Y }}
              className="flex p-4 gap-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar relative z-10"
            >
              <button
                onClick={() => setActiveTool('gematria')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTool === 'gematria' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                  : 'bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Hash size={12} /> Gematria
              </button>
              <button
                onClick={() => setActiveTool('chakra')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTool === 'chakra' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                  : 'bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Activity size={12} /> Prana & Chakras
              </button>
              <button
                onClick={() => setActiveTool('karma')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTool === 'karma' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                  : 'bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200'
                }`}
              >
                <History size={12} /> Karma Ledger
              </button>
              <button
                onClick={() => setActiveTool('vedastro')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTool === 'vedastro' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.15)]' 
                  : 'bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Orbit size={12} /> VedAstro Oracle
              </button>
            </motion.div>

            {/* Content Area */}
            <motion.div 
              style={{ x: tf4X, y: tf4Y }}
              className="flex-1 overflow-y-auto custom-scrollbar relative bg-gradient-to-b from-black/40 to-transparent p-4 z-10"
            >
              <React.Suspense fallback={<div className="h-full flex items-center justify-center text-stone-500 font-mono text-xs uppercase tracking-widest">Loading Module...</div>}>
                {activeTool === 'gematria' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                    <GematriaCalculatorSection />
                  </motion.div>
                )}
                
                {activeTool === 'chakra' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[600px] min-h-full">
                    <ChakraScene data={data} />
                  </motion.div>
                )}
                
                {activeTool === 'karma' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                    <KarmaLedger />
                  </motion.div>
                )}

                {activeTool === 'vedastro' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 w-full">
                    
                    {/* Subject Card details */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-widest font-bold">
                        <User size={12} /> Active Astral Subject
                      </div>
                      <h3 className="text-base font-serif font-black text-white leading-tight">
                        {loadedInputs?.name || 'Astral Seeker'}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-stone-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-cyan-400" />
                          <span>{loadedInputs?.date ? formatInputDate(loadedInputs.date) : '25/10/1992'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity size={11} className="text-cyan-400" />
                          <span>{loadedInputs?.time || '14:30'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin size={11} className="text-cyan-400" />
                          <span className="truncate">{loadedInputs?.location || 'Mumbai, India'}</span>
                        </div>
                      </div>
                    </div>

                    {/* API Trigger Section */}
                    <div className="flex flex-col gap-3 bg-cyan-950/10 border border-cyan-500/20 p-4 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-stone-400">NASA Swiss Ephemeris API</span>
                        <span className="text-[8px] font-mono text-cyan-400 px-1.5 py-0.5 rounded-md bg-cyan-500/10 uppercase font-bold tracking-widest">Rate-Limited</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
                        Fetch 200+ precision Vedic horoscope alignments, transits, and yogas directly from the VedAstro API.
                      </p>
                      <button
                        onClick={fetchDrawerPredictions}
                        disabled={vedastroLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer mt-1"
                      >
                        {vedastroLoading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" /> Fetching Predictions...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} className="animate-pulse" /> Query Live Oracle
                          </>
                        )}
                      </button>
                    </div>

                    {/* Predictions Results Area */}
                    <div className="flex flex-col gap-3 w-full">
                      {vedastroError && (
                        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-[10px]">
                          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                          <span>Query failed: {vedastroError}. Verify your network connection.</span>
                        </div>
                      )}

                      {vedastroPredictions.length > 0 ? (
                        <div className="flex flex-col gap-3 w-full">
                          {/* Filters */}
                          <div className="flex flex-col gap-2 border-b border-white/5 pb-2">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" size={11} />
                              <input
                                type="text"
                                placeholder="Filter predictions..."
                                value={vedastroSearch}
                                onChange={(e) => setVedastroSearch(e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-[10px] text-white w-full placeholder-stone-500 font-mono focus:border-cyan-400 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-1">
                              {['All', 'Good', 'Bad', 'Neutral'].map((f: any) => (
                                <button
                                  key={f}
                                  onClick={() => setVedastroFilter(f)}
                                  className={`px-2 py-0.5 rounded-md text-[8px] font-mono uppercase tracking-wider transition-all ${
                                    vedastroFilter === f
                                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                      : 'text-stone-500 hover:text-white border border-transparent'
                                  }`}
                                >
                                  {f === 'Good' ? 'Benefic' : f === 'Bad' ? 'Malefic' : f}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Scroll list */}
                          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
                            {vedastroPredictions
                              .filter(p => {
                                const matchSearch = (p.Name || '').toLowerCase().includes(vedastroSearch.toLowerCase()) || 
                                                    (p.Description || '').toLowerCase().includes(vedastroSearch.toLowerCase());
                                const matchFilter = vedastroFilter === 'All' || p.Nature === vedastroFilter;
                                return matchSearch && matchFilter;
                              })
                              .map((pred, idx) => {
                                const isGood = pred.Nature === 'Good';
                                const isBad = pred.Nature === 'Bad';
                                return (
                                  <div 
                                    key={idx}
                                    className={`p-3 rounded-xl border transition-all text-left ${
                                      isGood ? 'bg-green-950/10 border-green-500/20' :
                                      isBad ? 'bg-red-950/10 border-red-500/20' :
                                      'bg-white/5 border-white/10'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-2">
                                      <span className="text-[11px] font-serif text-white font-bold tracking-wider">{pred.Name}</span>
                                      <span className={`text-[7px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full ${
                                        isGood ? 'bg-green-500/20 text-green-300' :
                                        isBad ? 'bg-red-500/20 text-red-300' :
                                        'bg-white/10 text-stone-300'
                                      }`}>
                                        {isGood ? 'Benefic' : isBad ? 'Malefic' : 'Neutral'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-stone-300 font-sans leading-normal mt-1">{pred.Description}</p>
                                    {pred.RelatedBody && (
                                      <div className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                        <TrendingUp size={8} /> Body: {pred.RelatedBody}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        !vedastroLoading && (
                          <div className="flex flex-col items-center justify-center text-center py-6 text-stone-400 text-[10px] gap-2 border border-white/5 rounded-xl bg-black/20">
                            <Globe size={24} className="text-stone-600 animate-pulse" />
                            <p className="px-4">Click "Query Live Oracle" to calculate live chart predictions.</p>
                          </div>
                        )
                      )}
                    </div>

                    {/* Instant Local Planetary Coordinates list */}
                    {localPlanets.length > 0 && (
                      <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] uppercase tracking-widest font-bold">
                          <Orbit size={12} className="animate-spin" style={{ animationDuration: '20s' }} /> Instant Planet coordinates
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {localPlanets.map((p: any) => {
                            const long = getLongitude(p);
                            const nakInfo = calculateNakshatra(long);
                            return (
                              <div key={p.name} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono hover:bg-white/10 transition-colors">
                                <span className="font-bold text-white uppercase">{p.name}</span>
                                <div className="text-[9px] text-stone-400 text-right flex items-center gap-2">
                                  <span>{p.sign} {p.degree.toFixed(2)}°</span>
                                  <span className="text-fuchsia-400 bg-fuchsia-500/10 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">{nakInfo.name}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}
              </React.Suspense>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
