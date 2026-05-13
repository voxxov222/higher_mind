import { useState, useEffect } from 'react';
import { CosmicScene } from '../components/CosmicScene';
import { SolarSystemScene } from '../components/SolarSystemScene';
import { Dashboard } from '../components/Dashboard';
import { Canvas } from '@react-three/fiber';
import CosmicProfile from '../components/profile/CosmicProfile';
import { CosmicChat } from '../components/CosmicChat';
import { fetchCosmicReading } from '../services/geminiService';
import { CosmicData, AppState } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { auth, signIn, signOut, getCosmicProfile, saveCosmicProfile, updateProfileConfig } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfileConfig } from '../types';
import { Stars, Navigation } from 'lucide-react';

export default function Index() {
  const [data, setData] = useState<CosmicData | null>(null);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'torus' | 'planets' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'chakras' | 'compatibility' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns' | 'findings' | 'identity' | 'harmonics'>(() => 'torus');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loadedInputs, setLoadedInputs] = useState<any>(null);
  const [profileConfig, setProfileConfig] = useState<UserProfileConfig | null>(null);
  const [viewMode, setViewMode] = useState<'blueprint' | 'universe' | 'solar'>('blueprint');
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
      case 'harmonics': return 'transcendent';
      default: return 'idle';
    }
  };

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
            <CosmicScene 
              data={data} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onPlanetClick={handleSpeak} 
              isPresentationActive={isPresentationMode}
              mode={getThinkingMode(activeTab)}
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
            />
          </motion.div>
        ) : viewMode === 'universe' ? (
          <motion.div
            key="universe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <CosmicProfile initialConfig={profileConfig || undefined} />
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
        <button onClick={() => setViewMode('blueprint')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'blueprint' ? 'text-purple-400' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Navigation className="w-4 h-4" /><span>Blueprint</span></button>
        <button onClick={() => setViewMode('solar')} className={`bg-black/40 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 transition-all ${viewMode === 'solar' ? 'text-amber-400' : 'text-white/60 font-bold uppercase tracking-widest'}`}><Stars className="w-4 h-4" /><span>Solar</span></button>
      </div>

      {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900 text-white px-6 py-3 rounded-2xl">{error}<button onClick={() => setError(null)} className="ml-4">✕</button></div>}
      
      <CosmicChat cosmicData={data} />
    </div>
  );
}
