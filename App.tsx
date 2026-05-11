import React, { useState, useEffect } from 'react';
import { CosmicScene } from './components/CosmicScene';
import { Dashboard } from './components/Dashboard';
import CosmicProfile from './components/profile/CosmicProfile';
import { fetchCosmicReading } from './services/geminiService';
import { CosmicData, AppState } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { auth, signIn, signOut, getCosmicProfile, saveCosmicProfile, updateProfileConfig } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfileConfig } from './types';
import { Stars, Navigation } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<CosmicData | null>(null);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'torus' | 'planets' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns' | 'findings' | 'identity'>('torus');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loadedInputs, setLoadedInputs] = useState<any>(null);
  const [profileConfig, setProfileConfig] = useState<UserProfileConfig | null>(null);
  const [viewMode, setViewMode] = useState<'blueprint' | 'universe'>('blueprint');
  const [isPresentationMode, setIsPresentationMode] = useState(false);

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
            if (profile.profileConfig) {
              setProfileConfig(profile.profileConfig);
            } else {
              setProfileConfig({
                userId: currentUser.uid,
                username: currentUser.email?.split('@')?.[0] || 'traveler',
                displayName: currentUser.displayName || 'Traveler',
                theme: {
                  primaryColor: '#a855f7',
                  secondaryColor: '#3b82f6',
                  glowIntensity: 1,
                  transparency: 0.8,
                  borderStyle: 'glass',
                  fontFamily: 'Inter',
                  backgroundEffect: 'stars'
                },
                layout: {
                  widgets: [],
                  mainLayoutType: 'bento',
                  snapToGrid: true
                },
                socialLinks: [],
                bio: {
                  text: 'A traveler on a cosmic journey across the astral plains.'
                },
                researchVault: []
              });
            }
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

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (e) {
      setError("Failed to sign in.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      setError("Failed to sign out.");
    }
  };

  const handleGenerate = async (name: string, date: string, time: string, location: string) => {
    setState(AppState.GENERATING);
    setError(null);
    try {
      const result = await fetchCosmicReading({ name, birthDate: date, birthTime: time, location });
      setData(result);
      setState(AppState.READY);
      
      if (user) {
        await saveCosmicProfile(user.uid, result, { name, date, time, location });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to align cosmic energies. Please ensure your Gemini API key is valid.");
      setState(AppState.ERROR);
    }
  };

  const handleUpdateProfile = async (config: UserProfileConfig) => {
    setProfileConfig(config);
    if (user) {
      await updateProfileConfig(user.uid, config);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.9;
      utterance.rate = 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Female')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {viewMode === 'blueprint' ? (
        <>
          <CosmicScene 
            data={data} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onPlanetClick={handleSpeak} 
            isPresentationActive={isPresentationMode}
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
            onPresentationRequest={() => {
              setIsPresentationMode(true);
              setTimeout(() => setIsPresentationMode(false), 15000); // Presentation mode for 15s
            }}
          />
        </>
      ) : (
        <CosmicProfile initialConfig={profileConfig || undefined} />
      )}

      {/* Global View Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode(prev => prev === 'blueprint' ? 'universe' : 'blueprint')}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-full flex items-center gap-3 shadow-2xl group transition-all hover:bg-white/20 hover:border-white/40"
      >
        {viewMode === 'blueprint' ? (
          <>
            <Stars className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">Ascend to Universe</span>
          </>
        ) : (
          <>
            <Navigation className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">Return to Blueprint</span>
          </>
        )}
      </motion.button>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/80 text-red-100 px-6 py-3 rounded-2xl backdrop-blur-md shadow-xl border border-red-500/30 font-medium"
          >
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-300 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
