import { useState, useEffect } from 'react';
import { CosmicScene } from '../components/CosmicScene';
import { SolarSystemScene } from '../components/SolarSystemScene';
import { UniverseScene } from '../components/UniverseScene';
import { Dashboard } from '../components/Dashboard';
import { Canvas } from '@react-three/fiber';
import CosmicProfile from '../components/profile/CosmicProfile';
import { fetchCosmicReading } from '../services/geminiService';
import { CosmicData, AppState } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { auth, signIn, signOut, getCosmicProfile, saveCosmicProfile, updateProfileConfig } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfileConfig } from '../types';
import { Stars, Navigation, Globe } from 'lucide-react';

export default function Index() {
  const [data, setData] = useState<CosmicData | null>(null);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'torus' | 'planets' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns' | 'findings' | 'identity'>(() => 'torus');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loadedInputs, setLoadedInputs] = useState<any>(null);
  const [profileConfig, setProfileConfig] = useState<UserProfileConfig | null>(null);
  const [viewMode, setViewMode] = useState<'blueprint' | 'universe' | 'solar'>('universe');
  const [isTraveling, setIsTraveling] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [externalDeepDive, setExternalDeepDive] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        try {
          const profile = await getCosmicProfile(currentUser.uid);
          if (profile) {
            setData(profile.cosmicData);
            setLoadedInputs(profile.input);
            setProfileConfig(profile.profileConfig);
            setState(AppState.READY);
          }
        } catch (e) {
          console.error("Error loading profile", e);
        }
      } else {
        setData(null);
        setState(AppState.IDLE);
        setLoadedInputs(null);
        setProfileConfig(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => { try { await signIn(); } catch (e) { setError("Failed to sign in."); } };
  const handleSignOut = async () => { try { await signOut(); } catch (e) { setError("Failed to sign out."); } };

  const handleGenerate = async (name: string, date: string, time: string, location: string) => {
    setState(AppState.GENERATING);
    setError(null);
    try {
      const result = await fetchCosmicReading({ name, birthDate: date, birthTime: time, location });
      setData(result);
      setState(AppState.READY);
      if (user) await saveCosmicProfile(user.uid, result, { name, date, time, location });
    } catch (err) {
      setError("Failed to align cosmic energies.");
      setState(AppState.ERROR);
    }
  };

  const handleUpdateProfile = async (config: UserProfileConfig) => {
    setProfileConfig(config);
    if (user) await updateProfileConfig(user.uid, config);
  };

  const handleSpeak = (title: string, content: string) => {
    setExternalDeepDive({ title, content });
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(title + ". " + content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTravel = (tabId: string) => {
    setIsTraveling(true);
    
    // Cinematic delay for warp jump
    setTimeout(() => {
      setActiveTab(tabId as any);
      if (tabId === 'planets' || tabId === 'houses') {
        setViewMode('solar');
      } else {
        setViewMode('blueprint');
      }
      
      // End travel effect slightly after view change
      setTimeout(() => {
        setIsTraveling(false);
      }, 800);
    }, 1200);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {/* Warp Jump Overlay */}
        {isTraveling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative w-full h-full overflow-hidden">
               {/* Speed Lines */}
               {Array.from({ length: 40 }).map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ 
                     x: '50%', y: '50%', 
                     width: 2, height: 2,
                     opacity: 0,
                     scale: 0
                   }}
                   animate={{ 
                     x: `${Math.random() * 200 - 50}%`, 
                     y: `${Math.random() * 200 - 50}%`,
                     width: [2, 100, 200],
                     height: 2,
                     opacity: [0, 1, 0],
                     scale: [0, 1, 4]
                   }}
                   transition={{ 
                     duration: 0.8, 
                     repeat: Infinity, 
                     delay: Math.random() * 1,
                     ease: "easeIn" 
                   }}
                   className="absolute bg-white blur-[1px]"
                   style={{
                     transform: `rotate(${Math.random() * 360}deg)`
                   }}
                 />
               ))}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
            </div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute text-white font-light tracking-[2em] uppercase text-xl"
            >
              Warping to Node
            </motion.div>
          </motion.div>
        )}

        {viewMode === 'blueprint' ? (
          <motion.div
            key="blueprint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <CosmicScene data={data} activeTab={activeTab} setActiveTab={setActiveTab} onPlanetClick={handleSpeak} isPresentationActive={isPresentationMode} />
            <Dashboard data={data} onGenerate={handleGenerate} isLoading={state === AppState.GENERATING || isAuthLoading} activeTab={activeTab} setActiveTab={setActiveTab} user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} loadedInputs={loadedInputs} profileConfig={profileConfig || undefined} onUpdateProfile={handleUpdateProfile} onPresentationRequest={() => { setIsPresentationMode(true); setTimeout(() => setIsPresentationMode(false), 15000); }} externalDeepDive={externalDeepDive} onClearExternalDeepDive={() => setExternalDeepDive(null)} />
          </motion.div>
        ) : viewMode === 'universe' ? (
          <motion.div
            key="universe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Canvas shadows gl={{ antialias: true }}>
              <UniverseScene data={data} onTravel={handleTravel} activeSection={activeTab} />
            </Canvas>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-[4rem]">
                 <div className="text-[10px] text-purple-400 uppercase tracking-[1em] mb-4 font-bold">Reality Stream</div>
                 <h1 className="text-6xl text-white font-light tracking-tighter uppercase">Nexus Universe</h1>
                 <p className="text-stone-500 mt-6 max-w-md mx-auto text-sm tracking-widest leading-relaxed">Navigate the celestial nodes of your existence. Each cluster represents a dimension of your spiritual blueprint.</p>
               </motion.div>
            </div>
            {!data && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[110]">
                 <Dashboard data={data} onGenerate={handleGenerate} isLoading={state === AppState.GENERATING || isAuthLoading} activeTab={activeTab} setActiveTab={setActiveTab} user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} loadedInputs={loadedInputs} profileConfig={profileConfig || undefined} onUpdateProfile={handleUpdateProfile} onPresentationRequest={() => {}} externalDeepDive={null} onClearExternalDeepDive={() => {}} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="solar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Canvas shadows>
              <SolarSystemScene data={data} onPlanetClick={handleSpeak} />
            </Canvas>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex gap-4">
        <button onClick={() => setViewMode('universe')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'universe' ? 'text-blue-400 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Globe className="w-4 h-4" /><span>Universe</span></button>
        <button onClick={() => setViewMode('blueprint')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'blueprint' ? 'text-purple-400 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Navigation className="w-4 h-4" /><span>Blueprint</span></button>
        <button onClick={() => setViewMode('solar')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'solar' ? 'text-amber-400 border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Stars className="w-4 h-4" /><span>Solar</span></button>
      </div>

      {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900 text-white px-6 py-3 rounded-2xl">{error}<button onClick={() => setError(null)} className="ml-4">✕</button></div>}
    </div>
  );
}
