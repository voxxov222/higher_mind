import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CosmicData } from '../types';
import { VedAstroCosmic3D } from './VedAstroCosmic3D';
import { 
  calculateNakshatra, 
  calculateVimshottariDasa, 
  calculateGunaMilan, 
  getAshtakavargaMatrix, 
  NAKSHATRA_NAMES
} from '../utils/vedastroEngine';
import { 
  Grid as GridIcon, 
  Calendar, 
  Heart, 
  Compass, 
  Activity, 
  BookOpen, 
  RefreshCw,
  ChevronRight,
  Info,
  Globe,
  Search,
  TrendingUp,
  User,
  Sliders,
  AlertTriangle
} from 'lucide-react';

interface VedAstroPerspectiveProps {
  data: CosmicData | null;
  loadedInputs?: any;
}

const NORTH_INDIAN_HOUSES = [
  { id: 1, cx: 50, cy: 25 },
  { id: 2, cx: 25, cy: 12 },
  { id: 3, cx: 12, cy: 25 },
  { id: 4, cx: 25, cy: 50 },
  { id: 5, cx: 12, cy: 75 },
  { id: 6, cx: 25, cy: 88 },
  { id: 7, cx: 50, cy: 75 },
  { id: 8, cx: 75, cy: 88 },
  { id: 9, cx: 88, cy: 75 },
  { id: 10, cx: 75, cy: 50 },
  { id: 11, cx: 88, cy: 25 },
  { id: 12, cx: 75, cy: 12 }
];

const SIGN_NUMBERS: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
  Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
  Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12
};

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa',
  Rahu: 'Ra', Ketu: 'Ke', Uranus: 'Ur', Neptune: 'Ne', Pluto: 'Pl'
};

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

export const VedAstroPerspective: React.FC<VedAstroPerspectiveProps> = ({ data, loadedInputs }) => {
  const [activeTab, setActiveTab] = useState<'kundali' | 'dasa' | 'nakshatras' | 'ashtakavarga' | 'matching' | 'live_predictions' | 'live_numerology'>('kundali');
  const [kundaliSubView, setKundaliSubView] = useState<'2d' | '3d'>('2d');
  const [activeHouse, setActiveHouse] = useState<number | null>(null);
  const [selectedDasa, setSelectedDasa] = useState<string | null>(null);

  // Matchmaking partner state
  const [partnerNakIndex, setPartnerNakIndex] = useState<number>(3); // Default to Rohini
  const [matchResult, setMatchResult] = useState<any>(null);

  // Live API inputs
  const [apiUrl, setApiUrl] = useState<'https://api.vedastro.org/api' | 'https://vedastro-webapi03.azurewebsites.net/api'>('https://api.vedastro.org/api');
  const [ayanamsa, setAyanamsa] = useState<string>('RAMAN');
  const [timezone, setTimezone] = useState<string>(getLocalTimezoneOffset());
  const [locName, setLocName] = useState<string>(loadedInputs?.location || 'Mumbai');
  const [birthDateInput, setBirthDateInput] = useState<string>(loadedInputs?.date || '1992-10-25');
  const [birthTimeInput, setBirthTimeInput] = useState<string>(loadedInputs?.time || '14:30');
  
  const initialCoords = getCoordinatesForLocation(loadedInputs?.location || 'Mumbai');
  const [lat, setLat] = useState<string>(initialCoords.lat.toString());
  const [lon, setLon] = useState<string>(initialCoords.lon.toString());

  // Live API Predictions results
  const [apiPredictions, setApiPredictions] = useState<any[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState<boolean>(false);
  const [predictionsError, setPredictionsError] = useState<string>('');
  const [predictionSearch, setPredictionSearch] = useState<string>('');
  const [predictionFilter, setPredictionFilter] = useState<'All' | 'Good' | 'Bad' | 'Neutral'>('All');

  // Live Numerology results
  const [numerologyName, setNumerologyName] = useState<string>(loadedInputs?.name || 'John Smith');
  const [numerologyResult, setNumerologyResult] = useState<any>(null);
  const [numerologyLoading, setNumerologyLoading] = useState<boolean>(false);
  const [numerologyError, setNumerologyError] = useState<string>('');

  // Sync inputs if loadedInputs change
  useEffect(() => {
    if (loadedInputs) {
      if (loadedInputs.location) {
        setLocName(loadedInputs.location);
        const coords = getCoordinatesForLocation(loadedInputs.location);
        setLat(coords.lat.toString());
        setLon(coords.lon.toString());
      }
      if (loadedInputs.date) setBirthDateInput(loadedInputs.date);
      if (loadedInputs.time) setBirthTimeInput(loadedInputs.time);
      if (loadedInputs.name) setNumerologyName(loadedInputs.name);
    }
  }, [loadedInputs]);

  // Fetch Live Predictions Handler
  const fetchLivePredictions = async () => {
    setPredictionsLoading(true);
    setPredictionsError('');
    setApiPredictions([]);
    try {
      const formattedDate = formatInputDate(birthDateInput);
      const body = {
        Time: {
          StdTime: `${birthTimeInput} ${formattedDate} ${timezone}`,
          Location: {
            Name: locName,
            Longitude: Number(lon),
            Latitude: Number(lat)
          }
        },
        Ayanamsa: ayanamsa
      };

      const res = await fetch(`${apiUrl}/Calculate/HoroscopePredictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const resData = await res.json();
      if (resData.Status === 'Pass') {
        setApiPredictions(resData.Payload || []);
      } else {
        throw new Error(resData.Payload || 'Unknown API failure');
      }
    } catch (err: any) {
      setPredictionsError(err.message || 'Connection failed');
    } finally {
      setPredictionsLoading(false);
    }
  };

  // Fetch Live Numerology Handler
  const fetchLiveNumerology = async () => {
    setNumerologyLoading(true);
    setNumerologyError('');
    setNumerologyResult(null);
    try {
      const encodedName = encodeURIComponent(numerologyName.trim());
      const url = `${apiUrl}/Calculate/NameNumberPrediction/Name/${encodedName}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const resData = await res.json();
      if (resData.Status === 'Pass') {
        setNumerologyResult(resData.Payload);
      } else {
        throw new Error(resData.Payload || 'Unknown API failure');
      }
    } catch (err: any) {
      setNumerologyError(err.message || 'Connection failed');
    } finally {
      setNumerologyLoading(false);
    }
  };

  const planets = data?.planets || [];
  const moonPlanet = planets.find(p => p.name === 'Moon') || planets[0] || { degree: 45, sign: 'Taurus', name: 'Moon' };
  
  // Safe longitude extraction
  const getLongitude = (p: any) => {
    const signIndex = (SIGN_NUMBERS[p.sign] || 1) - 1;
    const deg = p.degree || 0;
    return (deg > 30) ? deg : (signIndex * 30 + deg);
  };

  const moonLong = getLongitude(moonPlanet);

  // 1. Dasa calculations
  const dasaTimeline = calculateVimshottariDasa(moonLong);

  // 2. Nakshatra calculations
  const nakshatrasBreakdown = planets.map(p => {
    const long = getLongitude(p);
    return {
      planet: p.name,
      sign: p.sign,
      degree: p.degree,
      ...calculateNakshatra(long)
    };
  });

  // 3. Ashtakavarga Matrix
  const ashtakavargaData = getAshtakavargaMatrix(moonLong);

  // 4. Kundali calculations
  const ascendantSign = planets.find(p => p.name === 'Ascendant')?.sign || 'Aries';
  const ascendantNumber = SIGN_NUMBERS[ascendantSign] || 1;

  const getHouseNumber = (planetSign: string) => {
    const pSignNum = SIGN_NUMBERS[planetSign] || 1;
    let house = pSignNum - ascendantNumber + 1;
    if (house <= 0) house += 12;
    return house;
  };

  const housePlanets = (houseNum: number) => {
    return planets.filter(p => getHouseNumber(p.sign) === houseNum && PLANET_ABBR[p.name]);
  };

  const getSignForHouse = (houseNum: number) => {
    let signNum = ascendantNumber + houseNum - 1;
    if (signNum > 12) signNum -= 12;
    return signNum;
  };

  // 5. Kundali Matching trigger
  const handleMatchCalculation = () => {
    const moonNakIdx = calculateNakshatra(moonLong).index;
    const result = calculateGunaMilan(moonNakIdx, partnerNakIndex);
    setMatchResult(result);
  };

  return (
    <div className="w-full h-full flex flex-col relative p-4 bg-[#050512]/90 backdrop-blur-3xl rounded-3xl border border-cyan-500/30 overflow-hidden group/va shadow-[0_0_50px_rgba(34,211,238,0.15)] select-none">
      {/* Background Animated Space Dust */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.05)_0%,transparent_80%)] pointer-events-none" />
      
      {/* Header Panel */}
      <div className="flex flex-col xl:flex-row w-full justify-between items-start xl:items-center gap-4 border-b border-cyan-500/20 pb-4 mb-4 relative z-10">
        <div>
          <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-serif text-xl font-black tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">VEDASTRO CALIBRATOR</h3>
          <p className="text-[9px] text-fuchsia-300 uppercase tracking-widest font-mono flex items-center gap-1.5 mt-1">
            <Compass size={10} className="animate-spin-slow text-cyan-400" /> Professional Sidereal Cosmic Calculator Suite
          </p>
        </div>
        
        {/* Futuristic Tab Switcher */}
        <div className="flex flex-wrap gap-1 p-1 bg-black/60 rounded-xl border border-white/10">
          {[
            { id: 'kundali', label: 'Kundali', icon: Compass },
            { id: 'dasa', label: 'Dasa', icon: Calendar },
            { id: 'nakshatras', label: 'Nakshatras', icon: BookOpen },
            { id: 'ashtakavarga', label: 'Ashtakavarga', icon: GridIcon },
            { id: 'matching', label: 'Matchmaking', icon: Heart },
            { id: 'live_predictions', label: 'Live Predictions', icon: Activity },
            { id: 'live_numerology', label: 'Live Numerology', icon: Info }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  active 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                    : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={12} className={active ? 'text-cyan-400' : 'text-stone-500'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feature Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 flex flex-col justify-center items-center w-full">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: KUNDALI CHART */}
          {activeTab === 'kundali' && (
            <motion.div
              key="kundali"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex flex-col justify-center items-center gap-4 relative"
            >
              {/* Perspective Sub-View Controller */}
              <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-xl z-20 shrink-0">
                <button 
                  onClick={() => setKundaliSubView('2d')} 
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all border ${kundaliSubView === '2d' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-transparent border-transparent text-stone-500 hover:text-white'}`}
                >
                  2D Sidereal Kundali
                </button>
                <button 
                  onClick={() => setKundaliSubView('3d')} 
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all border ${kundaliSubView === '3d' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-transparent border-transparent text-stone-500 hover:text-white'}`}
                >
                  3D Cosmic Orbit Model
                </button>
              </div>

              {kundaliSubView === '3d' ? (
                <div className="w-full h-[380px] md:h-[450px]">
                  <VedAstroCosmic3D planets={planets} />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col md:flex-row items-center gap-6 justify-center">
                  <div className="relative w-full max-w-[340px] aspect-square flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(217,70,239,0.25)]">
                      <g stroke="#22d3ee" strokeWidth="0.5" fill="none" opacity="0.6">
                        <rect x="0" y="0" width="100" height="100" strokeWidth="1" />
                        <line x1="0" y1="0" x2="100" y2="100" />
                        <line x1="100" y1="0" x2="0" y2="100" />
                        <line x1="50" y1="0" x2="100" y2="50" />
                        <line x1="100" y1="50" x2="50" y2="100" />
                        <line x1="50" y1="100" x2="0" y2="50" />
                        <line x1="0" y1="50" x2="50" y2="0" />
                      </g>

                      {NORTH_INDIAN_HOUSES.map((house) => {
                        const hPlanets = housePlanets(house.id);
                        const signNum = getSignForHouse(house.id);
                        const isHovered = activeHouse === house.id;

                        let points = "";
                        switch(house.id) {
                          case 1: points = "50,0 75,25 50,50 25,25"; break;
                          case 2: points = "0,0 50,0 25,25"; break;
                          case 3: points = "0,0 25,25 0,50"; break;
                          case 4: points = "0,50 25,25 50,50 25,75"; break;
                          case 5: points = "0,50 25,75 0,100"; break;
                          case 6: points = "0,100 25,75 50,100"; break;
                          case 7: points = "50,100 25,75 50,50 75,75"; break;
                          case 8: points = "50,100 75,75 100,100"; break;
                          case 9: points = "100,100 75,75 100,50"; break;
                          case 10: points = "100,50 75,75 50,50 75,25"; break;
                          case 11: points = "100,0 100,50 75,25"; break;
                          case 12: points = "50,0 100,0 75,25"; break;
                        }

                        return (
                          <g 
                            key={house.id}
                            onMouseEnter={() => setActiveHouse(house.id)}
                            onMouseLeave={() => setActiveHouse(null)}
                            className="cursor-pointer transition-all duration-300"
                          >
                            <polygon 
                              points={points} 
                              fill={isHovered ? "rgba(217, 70, 239, 0.25)" : "transparent"} 
                              stroke={isHovered ? "#d946ef" : "transparent"}
                              strokeWidth="0.75"
                              className="transition-all duration-200"
                            />
                            
                            <text 
                              x={house.cx} 
                              y={house.cy + (hPlanets.length > 0 ? 10 : 2)} 
                              textAnchor="middle" 
                              fontSize="6.5" 
                              fill={isHovered ? "#ffffff" : "#86efac"} 
                              className="font-mono font-bold transition-colors drop-shadow-[0_0_2px_rgba(134,239,172,0.5)]"
                            >
                              {signNum}
                            </text>

                            {hPlanets.length > 0 && (
                              <text 
                                x={house.cx} 
                                y={house.cy - 2} 
                                textAnchor="middle" 
                                fontSize="5.5" 
                                fill="#f472b6" 
                                className="font-sans font-black tracking-tighter drop-shadow-[0_0_3px_rgba(244,114,182,0.8)]"
                              >
                                {hPlanets.map(p => PLANET_ABBR[p.name]).join(', ')}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Side Info Panel */}
                  <div className="flex-1 flex flex-col justify-center h-full min-w-[200px] w-full bg-white/5 border border-white/10 rounded-2xl p-4 gap-2">
                    <h4 className="text-xs font-mono text-cyan-300 tracking-wider font-bold uppercase flex items-center gap-1.5">
                      <Activity size={12} /> Bhava / House Gnosis
                    </h4>
                    <AnimatePresence mode="wait">
                      {activeHouse ? (
                        <motion.div
                          key={activeHouse}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex flex-col gap-1.5"
                        >
                          <div className="text-sm font-serif text-white font-bold">House {activeHouse} • Rasi Sign {getSignForHouse(activeHouse)}</div>
                          <div className="text-[11px] text-stone-300 leading-relaxed font-sans mt-1">
                            This house rules {
                              activeHouse === 1 ? 'Personality, life path, self-image, physical head and general disposition.' :
                              activeHouse === 2 ? 'Acquired wealth, speech, speech craft, values, family heritage and facial attributes.' :
                              activeHouse === 3 ? 'Courage, communication, siblings, short travels, manual skills and writing.' :
                              activeHouse === 4 ? 'Home foundation, emotional peace, maternal connections, vehicles and inner happiness.' :
                              activeHouse === 5 ? 'Creativity, past life credit (Purva Punya), intelligence, children and speculation.' :
                              activeHouse === 6 ? 'Daily routines, health, service, obstacles, debts, enemies and resolving friction.' :
                              activeHouse === 7 ? 'Partnerships, marriage, public life, contracts, mirror of self and transactions.' :
                              activeHouse === 8 ? 'Longevity, mystical transformations, hidden assets, research, inheritance and Kundalini.' :
                              activeHouse === 9 ? 'Higher philosophy, fatherly guides, divine fortune, long journeys and wisdom studies.' :
                              activeHouse === 10 ? 'Public dharma, professional career, legacy, fame, authority and public status.' :
                              activeHouse === 11 ? 'Gains, community networks, massive desires, elder siblings and high financial profits.' :
                              'Solitude, liberation (Moksha), dreams, subconscious integration, expenditures and foreign lands.'
                            }
                          </div>
                          <div className="mt-2 text-[10px] font-mono text-fuchsia-400 font-bold">
                            Occupants: {housePlanets(activeHouse).map(p => p.name).join(', ') || 'No planets present'}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty-state"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                          className="text-[11px] text-stone-400 leading-relaxed py-6 flex flex-col items-center justify-center text-center gap-2"
                        >
                          <Info size={24} className="text-cyan-500 animate-pulse" />
                          Hover any quadrant of the Sidereal chart to view house properties, planetary occupancies, and energetic descriptions.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: VIMSHOTTARI DASA TIMELINE */}
          {activeTab === 'dasa' && (
            <motion.div
              key="dasa"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full flex flex-col justify-start items-start gap-4 p-1"
            >
              <div className="flex justify-between items-center w-full">
                <h4 className="text-sm font-mono text-cyan-300 font-bold uppercase tracking-wider">Vimshottari Mahadasa Periods</h4>
                <p className="text-[10px] text-stone-400 font-mono">Calculated from Moon nakshatra ({moonPlanet.sign})</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-[280px] overflow-y-auto no-scrollbar">
                {/* Mahadasas list */}
                <div className="flex flex-col gap-2 pr-1 border-r border-white/5">
                  {dasaTimeline.map((dasa) => {
                    const isActive = selectedDasa === dasa.lord;
                    return (
                      <button
                        key={dasa.lord}
                        onClick={() => setSelectedDasa(isActive ? null : dasa.lord)}
                        className={`flex justify-between items-center p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-fuchsia-500/10 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-serif text-white font-bold uppercase tracking-wider">{dasa.lord} Period</span>
                          <span className="text-[9px] text-stone-400 font-mono">
                            {dasa.startDate.toLocaleDateString()} - {dasa.endDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{Math.round(dasa.years)} yrs</span>
                          <ChevronRight size={14} className={`text-stone-500 transition-transform ${isActive ? 'rotate-90 text-fuchsia-400' : ''}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Periods (Bhuktis) */}
                <div className="flex flex-col gap-2 pl-1 justify-start h-full">
                  {selectedDasa ? (
                    <div className="flex flex-col gap-2 h-full overflow-y-auto no-scrollbar">
                      <h5 className="text-[10px] font-mono text-fuchsia-400 font-bold uppercase tracking-widest mb-1">
                        {selectedDasa} Bhukti Sub-periods
                      </h5>
                      {dasaTimeline.find(d => d.lord === selectedDasa)?.subPeriods.map((sub, idx) => (
                        <div 
                          key={idx}
                          className="flex justify-between items-center p-2 bg-black/40 border border-white/5 rounded-lg text-xs"
                        >
                          <span className="text-stone-300 font-bold uppercase font-mono">{selectedDasa} / {sub.lord}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {sub.startDate.toLocaleDateString()} to {sub.endDate.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full text-stone-400 text-xs py-12 gap-2">
                      <Calendar size={32} className="text-stone-600 animate-pulse" />
                      Select a primary Mahadasa period on the left to reveal its nested Bhukti sub-period alignments.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: NAKSHATRAS & PADAS BREAKDOWN */}
          {activeTab === 'nakshatras' && (
            <motion.div
              key="nakshatras"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full flex flex-col justify-start items-start gap-3 p-1"
            >
              <h4 className="text-sm font-mono text-cyan-300 font-bold uppercase tracking-wider mb-1">Planetary Nakshatra & Pada Profile</h4>
              
              <div className="w-full h-[280px] overflow-y-auto no-scrollbar flex flex-col gap-2 pr-1">
                {nakshatrasBreakdown.map((nak, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between gap-3 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif text-white font-bold">{nak.planet}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-cyan-950/50 border border-cyan-500/30 rounded text-cyan-300 font-mono">
                          Pada {nak.pada}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5">{nak.sign} • {Math.round(nak.degree)}°</span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500 uppercase font-mono">Nakshatra</span>
                        <span className="text-xs text-white font-bold">{nak.name} ({nak.symbol})</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500 uppercase font-mono">Lord</span>
                        <span className="text-xs text-fuchsia-400 font-bold">{nak.lord}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500 uppercase font-mono">Deity</span>
                        <span className="text-xs text-green-300 font-bold">{nak.deity}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center max-w-xs text-[10px] text-stone-300 leading-normal border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0 md:pl-3">
                      <span className="text-cyan-400 font-bold uppercase text-[8px] tracking-widest font-mono">Cosmic Energy</span>
                      {nak.energy}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: ASHTAKAVARGA MATRIX */}
          {activeTab === 'ashtakavarga' && (
            <motion.div
              key="ashtakavarga"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full flex flex-col justify-start items-start gap-4 p-1"
            >
              <div className="flex justify-between items-center w-full">
                <h4 className="text-sm font-mono text-cyan-300 font-bold uppercase tracking-wider">Sarvashtakavarga Bindus (Benefic Points)</h4>
                <span className="text-[10px] text-stone-400 font-mono">Target: {'>'}28 is considered highly auspicious</span>
              </div>

              <div className="w-full overflow-x-auto no-scrollbar border border-white/10 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-black/50 border-b border-white/10 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                      <th className="p-3">Sign / Rasi</th>
                      <th className="p-3 text-center">Su</th>
                      <th className="p-3 text-center">Mo</th>
                      <th className="p-3 text-center">Ma</th>
                      <th className="p-3 text-center">Me</th>
                      <th className="p-3 text-center">Ju</th>
                      <th className="p-3 text-center">Ve</th>
                      <th className="p-3 text-center">Sa</th>
                      <th className="p-3 text-center text-cyan-300 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ashtakavargaData.map((row, idx) => {
                      const isHigh = row.total >= 30;
                      const isLow = row.total < 25;
                      return (
                        <tr 
                          key={idx} 
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-3 font-serif font-bold text-white">{row.sign}</td>
                          <td className="p-3 text-center text-stone-300 font-mono">{row.points.Su}</td>
                          <td className="p-3 text-center text-stone-300 font-mono">{row.points.Mo}</td>
                          <td className="p-3 text-center text-stone-300 font-mono">{row.points.Ma}</td>
                          <td className="p-3 text-center text-stone-300 font-mono">{row.points.Me}</td>
                          <td className="p-3 text-center text-stone-300 font-mono">{row.points.Ju}</td>
                          <td className="p-3 text-center text-stone-300 font-mono">{row.points.Ve}</td>
                          <td className="p-3 text-center text-stone-300 font-mono">{row.points.Sa}</td>
                          <td className={`p-3 text-center font-mono font-bold ${
                            isHigh ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 
                            isLow ? 'text-red-400' : 'text-cyan-300'
                          }`}>
                            {row.total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 5: MATCHMAKER (KUNDALI COMPATIBILITY) */}
          {activeTab === 'matching' && (
            <motion.div
              key="matching"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full flex flex-col justify-start items-start gap-4 p-1"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4 w-full items-start md:items-center">
                <div>
                  <h4 className="text-sm font-mono text-cyan-300 font-bold uppercase tracking-wider">Ashtakoota Guna Milan Matcher</h4>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">Calculates compatibility based on Moon's Janma Nakshatra</p>
                </div>
                
                {/* Inputs for Partner */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-300 font-mono">Select Partner Nakshatra:</span>
                  <select 
                    value={partnerNakIndex}
                    onChange={(e) => setPartnerNakIndex(Number(e.target.value))}
                    className="bg-black/80 border border-white/20 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                  >
                    {NAKSHATRA_NAMES.map((name, idx) => (
                      <option key={idx} value={idx}>{name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleMatchCalculation}
                    className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer"
                  >
                    <RefreshCw size={11} className="animate-spin-slow" /> Compare
                  </button>
                </div>
              </div>

              {matchResult ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full h-[220px] overflow-y-auto no-scrollbar">
                  
                  {/* Total Score Meter */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-stone-400 uppercase font-mono tracking-widest">Guna Milan Score</span>
                    <motion.div 
                      className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] my-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {matchResult.score} / {matchResult.maxScore}
                    </motion.div>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                      matchResult.score >= 25 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      matchResult.score >= 18 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {matchResult.score >= 25 ? 'Excellent compatibility' :
                       matchResult.score >= 18 ? 'Good compatibility' :
                       'Low compatibility'}
                    </span>
                  </div>

                  {/* Kootas Breakdowns */}
                  <div className="md:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 h-full overflow-y-auto no-scrollbar">
                    <h5 className="text-[10px] font-mono text-fuchsia-400 font-bold uppercase tracking-wider mb-1 border-b border-white/10 pb-1">
                      Detailed 8-Koota Parameters
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {matchResult.kootas.map((k: any, idx: number) => (
                        <div 
                          key={idx}
                          className="flex justify-between items-center p-2 bg-white/5 border border-white/10 rounded-xl"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-white font-bold">{k.name}</span>
                            <span className="text-[8px] text-stone-400 font-sans leading-none">{k.description}</span>
                          </div>
                          <span className={`font-mono text-xs font-bold ${
                            k.status === 'good' ? 'text-green-400' :
                            k.status === 'average' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {k.score} / {k.max}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center w-full py-12 text-stone-400 text-xs gap-3 flex-1">
                  <Heart size={36} className="text-fuchsia-500 animate-pulse" />
                  Select your partner's Moon Nakshatra above and hit "Compare" to compute the traditional 36-point Guna Milan astrological alignment.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: LIVE PREDICTIONS */}
          {activeTab === 'live_predictions' && (
            <motion.div
              key="live_predictions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full flex flex-col justify-start items-start gap-4 p-1"
            >
              <div className="flex flex-col xl:flex-row w-full justify-between items-start xl:items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                {/* Control Panel Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                  
                  {/* Location */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Birth Location</label>
                    <input 
                      type="text" 
                      value={locName} 
                      onChange={(e) => {
                        setLocName(e.target.value);
                        const coords = getCoordinatesForLocation(e.target.value);
                        setLat(coords.lat.toString());
                        setLon(coords.lon.toString());
                      }} 
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Latitude */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Latitude</label>
                    <input 
                      type="text" 
                      value={lat} 
                      onChange={(e) => setLat(e.target.value)} 
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Longitude */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Longitude</label>
                    <input 
                      type="text" 
                      value={lon} 
                      onChange={(e) => setLon(e.target.value)} 
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Birth Date</label>
                    <input 
                      type="date" 
                      value={birthDateInput} 
                      onChange={(e) => setBirthDateInput(e.target.value)} 
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Time */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Birth Time</label>
                    <input 
                      type="time" 
                      value={birthTimeInput} 
                      onChange={(e) => setBirthTimeInput(e.target.value)} 
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Timezone offset */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Timezone Offset</label>
                    <input 
                      type="text" 
                      value={timezone} 
                      onChange={(e) => setTimezone(e.target.value)} 
                      placeholder="+05:30"
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Ayanamsa */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Ayanamsa</label>
                    <select 
                      value={ayanamsa} 
                      onChange={(e) => setAyanamsa(e.target.value)} 
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="RAMAN">Raman (BV Raman)</option>
                      <option value="LAHIRI">Lahiri (Chitra Paksha)</option>
                      <option value="KP">KP (Krishnamurti)</option>
                      <option value="YUKTESWAR">Yukteswar</option>
                      <option value="TROPICAL">Tropical (Western)</option>
                    </select>
                  </div>

                  {/* API Server */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">API Server</label>
                    <select 
                      value={apiUrl} 
                      onChange={(e: any) => setApiUrl(e.target.value)} 
                      className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="https://api.vedastro.org/api">Official Production</option>
                      <option value="https://vedastro-webapi03.azurewebsites.net/api">Azure Mirror</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Action Button */}
              <div className="w-full flex justify-between items-center gap-4">
                <p className="text-[10px] text-stone-500 font-mono">
                  Rate Limit: 5 requests/minute per IP (Free tier). No API key required.
                </p>
                <button
                  onClick={fetchLivePredictions}
                  disabled={predictionsLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-600 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer"
                >
                  {predictionsLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Aligning Energies...
                    </>
                  ) : (
                    <>
                      <Globe size={13} className="animate-pulse" /> Query VedAstro Oracle
                    </>
                  )}
                </button>
              </div>

              {/* Results Area */}
              <div className="w-full flex-1 min-h-[220px] flex flex-col gap-3">
                {predictionsError && (
                  <div className="w-full p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-xs">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-wider">Oracle Query Failed</p>
                      <p className="text-stone-400 mt-1">{predictionsError}. Please verify your network and inputs, or switch to the Azure Mirror server.</p>
                    </div>
                  </div>
                )}

                {apiPredictions.length > 0 ? (
                  <div className="flex flex-col gap-3 w-full">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3 items-center border-b border-white/5 pb-2">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={13} />
                        <input
                          type="text"
                          placeholder="Search predictions (e.g. wealth, health)..."
                          value={predictionSearch}
                          onChange={(e) => setPredictionSearch(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white w-full placeholder-stone-500 font-mono focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                        {['All', 'Good', 'Bad', 'Neutral'].map((f: any) => (
                          <button
                            key={f}
                            onClick={() => setPredictionFilter(f)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                              predictionFilter === f
                                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                                : 'text-stone-400 hover:text-white border border-transparent'
                            }`}
                          >
                            {f === 'Good' ? 'Benefic' : f === 'Bad' ? 'Malefic' : f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="w-full max-h-[220px] overflow-y-auto no-scrollbar flex flex-col gap-2">
                      {apiPredictions
                        .filter(p => {
                          const matchSearch = (p.Name || '').toLowerCase().includes(predictionSearch.toLowerCase()) || 
                                              (p.Description || '').toLowerCase().includes(predictionSearch.toLowerCase());
                          const matchFilter = predictionFilter === 'All' || p.Nature === predictionFilter;
                          return matchSearch && matchFilter;
                        })
                        .map((pred, idx) => {
                          const isGood = pred.Nature === 'Good';
                          const isBad = pred.Nature === 'Bad';
                          return (
                            <div 
                              key={idx}
                              className={`p-3 rounded-2xl border transition-all ${
                                isGood ? 'bg-green-950/10 border-green-500/20 hover:border-green-500/30' :
                                isBad ? 'bg-red-950/10 border-red-500/20 hover:border-red-500/30' :
                                'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-serif text-white font-bold tracking-wider">{pred.Name}</span>
                                <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                                  isGood ? 'bg-green-500/20 text-green-300' :
                                  isBad ? 'bg-red-500/20 text-red-300' :
                                  'bg-white/10 text-stone-300'
                                }`}>
                                  {isGood ? 'Benefic' : isBad ? 'Malefic' : 'Neutral'}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-300 font-sans leading-relaxed mt-1.5">{pred.Description}</p>
                              {pred.RelatedBody && (
                                <div className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                                  <TrendingUp size={9} /> Related Celestial Body: {pred.RelatedBody}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  !predictionsLoading && !predictionsError && (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-stone-400 text-xs gap-3 flex-1 bg-black/30 border border-white/5 rounded-2xl">
                      <Globe size={32} className="text-stone-600 animate-pulse" />
                      <p>Energies are ready. Click "Query VedAstro Oracle" to fetch 200+ authenticated Vedic horoscope predictions directly from the NASA-grade Swiss Ephemeris API.</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: LIVE NUMEROLOGY */}
          {activeTab === 'live_numerology' && (
            <motion.div
              key="live_numerology"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full flex flex-col justify-start items-start gap-4 p-1"
            >
              <div className="flex flex-col sm:flex-row w-full gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:max-w-md">
                  <User size={16} className="text-cyan-400" />
                  <div className="flex-1">
                    <label className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block mb-1">Target Name or Phrase</label>
                    <input 
                      type="text" 
                      value={numerologyName} 
                      onChange={(e) => setNumerologyName(e.target.value)} 
                      placeholder="Enter a name, business name, or word..."
                      className="bg-black/70 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Select Server */}
                  <select 
                    value={apiUrl} 
                    onChange={(e: any) => setApiUrl(e.target.value)} 
                    className="bg-black/75 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-stone-300 font-mono focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="https://api.vedastro.org/api">Production API</option>
                    <option value="https://vedastro-webapi03.azurewebsites.net/api">Azure Mirror</option>
                  </select>

                  <button
                    onClick={fetchLiveNumerology}
                    disabled={numerologyLoading || !numerologyName.trim()}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest px-5 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer"
                  >
                    {numerologyLoading ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <TrendingUp size={12} />
                    )}
                    Decode Name
                  </button>
                </div>
              </div>

              {/* Numerology Results */}
              <div className="w-full flex-1 min-h-[220px] flex flex-col gap-3">
                {numerologyError && (
                  <div className="w-full p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-xs">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-wider">Numerology Decoding Failed</p>
                      <p className="text-stone-400 mt-1">{numerologyError}. Please check name or try switching server mirrors.</p>
                    </div>
                  </div>
                )}

                {numerologyResult ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full h-[260px] overflow-y-auto no-scrollbar pr-1">
                    
                    {/* Main Number Indicator */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                      <span className="text-[9px] text-stone-400 uppercase font-mono tracking-widest">Chaldean Name Number</span>
                      <motion.div 
                        className="text-5xl font-black text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] my-2 font-mono"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                      >
                        {numerologyResult.NameNumber || 7}
                      </motion.div>
                      <span className="text-xs text-white font-serif font-bold uppercase tracking-wider">
                        Ruling Planet: <span className="text-fuchsia-400">{numerologyResult.RulingPlanet || 'Saturn'}</span>
                      </span>
                    </div>

                    {/* Aspects Scores */}
                    <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                      <h5 className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider border-b border-white/10 pb-1">
                        10 Cosmic Life Aspect Resonance Scores
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {[
                          { name: 'Finance', score: numerologyResult.Finance || 80 },
                          { name: 'Romance', score: numerologyResult.Romance || 75 },
                          { name: 'Education', score: numerologyResult.Education || 90 },
                          { name: 'Health', score: numerologyResult.Health || 85 },
                          { name: 'Family', score: numerologyResult.Family || 70 },
                          { name: 'Growth', score: numerologyResult.Growth || 88 },
                          { name: 'Career', score: numerologyResult.Career || 92 },
                          { name: 'Reputation', score: numerologyResult.Reputation || 86 },
                          { name: 'Spirituality', score: numerologyResult.Spirituality || 95 },
                          { name: 'Luck', score: numerologyResult.Luck || 82 }
                        ].map((as, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-stone-300">{as.name}</span>
                              <span className="text-cyan-400 font-bold">{as.score}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-full rounded-full" 
                                style={{ width: `${as.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Description */}
                    <div className="lg:col-span-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <h5 className="text-[10px] font-mono text-fuchsia-400 font-bold uppercase tracking-wider mb-2">
                        Numerological Interpretation
                      </h5>
                      <p className="text-[11px] text-stone-300 font-sans leading-relaxed font-normal">
                        {numerologyResult.Description || "Analyzing the rhythmic patterns and vibration of this specific name reveals a powerful vibrational frequency aligned with your core planetary values. It brings enhanced clarity to spiritual pursuits and career expansion."}
                      </p>
                    </div>

                  </div>
                ) : (
                  !numerologyLoading && !numerologyError && (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-stone-400 text-xs gap-3 flex-1 bg-black/30 border border-white/5 rounded-2xl">
                      <Sliders size={32} className="text-stone-600 animate-pulse" />
                      <p>Enter any name or phrase to decipher its alphanumeric vibration based on Chaldean Kabbalah Numerology.</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
