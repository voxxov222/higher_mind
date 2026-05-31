import { useState, useEffect, lazy, Suspense } from 'react';
import { CosmicScene } from '../components/CosmicScene';
const SolarSystemScene = lazy(() => import('../components/SolarSystemScene').then(m => ({ default: m.SolarSystemScene })));
const Dashboard = lazy(() => import('../components/Dashboard').then(m => ({ default: m.Dashboard })));
const CosmicProfile = lazy(() => import('../components/profile/CosmicProfile'));
import { Canvas } from '@react-three/fiber';
import { CosmicChat } from '../components/CosmicChat';
import { fetchCosmicReading } from '../services/geminiService';
import { CosmicAudio } from '../components/CosmicAudio';
import { CosmicData, AppState } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { auth, signIn, signOut, getCosmicProfile, saveCosmicProfile, updateProfileConfig } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfileConfig } from '../types';
import { Stars, Navigation, Globe, Loader2 } from 'lucide-react';
import { useHigherMind } from '../components/HigherMindProvider';

const LoadingView = ({ color = "purple" }: { color?: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4">
    <motion.div 
      animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className={`w-12 h-12 text-${color}-500 opacity-50`} />
    </motion.div>
    <div className={`text-${color}-400/60 font-mono text-xs tracking-widest uppercase`}>Aligning Energies...</div>
  </div>
);

export default function Index() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<CosmicData | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'torus' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'chakras' | 'compatibility' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns' | 'findings' | 'identity' | 'harmonics' | 'celestial_dna' | 'brain' | 'angel_numbers' | 'vortex' | 'gematria_calc' | 'golden_ratio' | 'community' | 'messages' | 'sandbox' | 'sky_map' | 'soul_path' | 'tetragrammaton' | 'christ_sophia' | 'astral_canvas' | 'avatar_matrix' | 'vibrational_tuning' | 'celestial_blueprint' | 'obsidian' | 'codex' | 'evolution'>('torus');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('astral_active_tab');
      if (saved) setActiveTab(saved as any);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('astral_active_tab', activeTab);
  }, [activeTab]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loadedInputs, setLoadedInputs] = useState<any>(null);
  const [profileConfig, setProfileConfig] = useState<UserProfileConfig | null>(null);
  const [viewMode, setViewMode] = useState<'blueprint' | 'universe' | 'solar'>('blueprint');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [externalDeepDive, setExternalDeepDive] = useState<{ title: string; content: string } | null>(null);
  const [vortexMode, setVortexMode] = useState<'material' | 'spirit' | 'sync'>('sync');

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

  const { setUserData } = useHigherMind();
  useEffect(() => {
    if (profileConfig) {
      setUserData(profileConfig);
    }
  }, [profileConfig, setUserData]);

  const handleSpeak = (title: string, content: string) => {
    setExternalDeepDive({ title, content });
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(title + ". " + content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getThinkingMode = (tab: string) => {
    switch (tab) {
      case 'torus': return 'transcendent';
      case 'planets': return 'synergetic';
      case 'numbers':
      case 'kabbalah':
      case 'kabbalistic_numerology': return 'kabbalistic';
      case 'synthesis':
      case 'strategy':
      case 'patterns':
      case 'findings': return 'analyzing';
      case 'chakras':
      case 'identity':
      case 'avatar_matrix':
      case 'angel_numbers':
      case 'vortex':
      case 'harmonics': return 'transcendent';
      case 'gematria_calc': return 'kabbalistic';
      default: return 'idle';
    }
  };

  if (!isMounted) return <LoadingView color="purple" />;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {viewMode === 'blueprint' ? (
          <motion.div
            key="blueprint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Suspense fallback={<LoadingView color="purple" />}>
              <CosmicScene 
                data={data} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab as any} 
                onPlanetClick={handleSpeak} 
                isPresentationActive={isPresentationMode}
                mode={getThinkingMode(activeTab)}
                vortexMode={vortexMode}
              />
              <Dashboard 
                data={data} 
                onGenerate={handleGenerate} 
                isLoading={state === AppState.GENERATING || isAuthLoading} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                user={user} 
                onSignIn={handleSignIn} 
                onSignOut={handleSignOut} 
                loadedInputs={loadedInputs} 
                profileConfig={profileConfig || undefined} 
                onUpdateProfile={handleUpdateProfile} 
                onPresentationRequest={() => { setIsPresentationMode(true); setTimeout(() => setIsPresentationMode(false), 15000); }} 
                externalDeepDive={externalDeepDive} 
                onClearExternalDeepDive={() => setExternalDeepDive(null)} 
                vortexMode={vortexMode}
                setVortexMode={setVortexMode}
              />
            </Suspense>
          </motion.div>
        ) : viewMode === 'universe' ? (
          <motion.div
            key="universe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Suspense fallback={<LoadingView color="emerald" />}>
              <CosmicProfile initialConfig={profileConfig || undefined} />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="solar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Suspense fallback={<LoadingView color="amber" />}>
              <SolarSystemScene data={data} onPlanetClick={handleSpeak} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex gap-4">
        <button onClick={() => setViewMode('blueprint')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'blueprint' ? 'text-purple-400' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Navigation className="w-4 h-4" /><span>Blueprint</span></button>
        <button onClick={() => setViewMode('solar')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'solar' ? 'text-amber-400' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Stars className="w-4 h-4" /><span>Solar</span></button>
        <button onClick={() => setViewMode('universe')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'universe' ? 'text-emerald-400' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Globe className="w-4 h-4" /><span>Identity</span></button>
      </div>

      {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900 text-white px-6 py-3 rounded-2xl">{error}<button onClick={() => setError(null)} className="ml-4">✕</button></div>}
      
      <CosmicChat cosmicData={data} />
      <CosmicAudio />
    </div>
  );
}
