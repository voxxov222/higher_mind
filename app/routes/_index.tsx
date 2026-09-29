import { useState, useEffect, lazy, Suspense, Component, ReactNode } from 'react';
import { CosmicScene } from '../components/CosmicScene';
import { SplashScreen } from '../components/SplashScreen';
import { CosmosBackground } from '../components/CosmosBackground';
import StarMap from '../components/StarMap';

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>,
  componentName: string = 'Component',
  retries = 3,
  delay = 1000
) {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (remaining: number) => {
        factory()
          .then(m => {
            if (m && m.default) {
              resolve(m);
            } else if (m) {
              resolve({ default: m });
            } else {
              throw new Error(`Empty module for ${componentName}`);
            }
          })
          .catch(err => {
            console.warn(`[AstralMind] Loading ${componentName} failed (${remaining} attempts left):`, err);
            if (remaining > 1) {
              setTimeout(() => attempt(remaining - 1), delay);
            } else {
              reject(err);
            }
          });
      };
      attempt(retries);
    })
  );
}

const SolarSystemScene = lazyWithRetry(() => import('../components/SolarSystemScene').then(m => ({ default: m.SolarSystemScene })), 'SolarSystemScene');
const Dashboard = lazyWithRetry(() => import('../components/Dashboard').then(m => ({ default: m.Dashboard })), 'Dashboard');
const CosmicProfile = lazyWithRetry(() => import('../components/profile/CosmicProfile'), 'CosmicProfile');
const NatalChart3D = lazyWithRetry(() => import('../components/NatalChart3D').then(m => ({ default: m.NatalChart3D || m.default })), 'NatalChart3D');


interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ChunkErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ChunkErrorBoundary caught dynamic module error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/95 text-white p-6 gap-4 z-50">
          <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-xl flex flex-col items-center text-center max-w-md">
            <div className="text-purple-300 font-mono text-xs uppercase tracking-widest mb-2 font-semibold">
              {this.props.fallbackTitle || "Astral Stream Synchronizing"}
            </div>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed font-light">
              The neural interface is refreshing its connection to the cosmic matrix. Reconnect to resume your journey.
            </p>
            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                Reconnect Stream
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 font-mono text-xs uppercase tracking-wider transition-all"
              >
                Full Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { CosmicChat } from '../components/CosmicChat';
import { fetchCosmicReading } from '../services/geminiService';
import { CosmicAudio } from '../components/CosmicAudio';
import { CosmicData, AppState } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { auth, signIn, signOut, getCosmicProfile, saveCosmicProfile, updateProfileConfig } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfileConfig } from '../types';
import { Stars, Navigation, Globe, Loader2, Compass } from 'lucide-react';
import { useHigherMind } from '../components/HigherMindProvider';
import { GlobalHUD } from '../components/GlobalHUD';

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
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [data, setData] = useState<CosmicData | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'glass_dashboard' | 'the_big_picture' | 'astraea' | 'neural_synaptic' | 'quantum_fluid' | 'torus' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'chakras' | 'compatibility' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns' | 'findings' | 'identity' | 'harmonics' | 'celestial_dna' | 'brain' | 'angel_numbers' | 'vortex' | 'gematria_calc' | 'golden_ratio' | 'community' | 'messages' | 'sandbox' | 'sky_map' | 'soul_path' | 'tetragrammaton' | 'christ_sophia' | 'astral_canvas' | 'avatar_matrix' | 'vibrational_tuning' | 'celestial_blueprint' | 'obsidian' | 'codex' | 'evolution' | 'freemason33' | 'tarot' | 'chinese_zodiac' | 'destiny_matrix' | 'holographic_rainbow' | 'flower_of_life' | 'alignment' | 'ai_agents' | 'holographic_profile' | 'karma_ledger' | 'jarvis_os' | 'astrology_engine' | 'fifth_dimension' | 'subconscious_programming'>('glass_dashboard');

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
  const [viewMode, setViewMode] = useState<'blueprint' | 'universe' | 'solar' | 'natal'>('natal');
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
        } catch {
          console.error("Error loading profile");
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

  const handleSignIn = async () => { try { await signIn(); } catch { setError("Failed to sign in."); } };
  const handleSignOut = async () => { try { await signOut(); } catch { setError("Failed to sign out."); } };

  const handleGenerate = async (name: string, date: string, time: string, location: string) => {
    setState(AppState.GENERATING);
    setError(null);
    try {
      const result = await fetchCosmicReading({ name, birthDate: date, birthTime: time, location });
      setData(result);
      setState(AppState.READY);
      if (user) await saveCosmicProfile(user.uid, result, { name, date, time, location });
    } catch {
      setError("Failed to align cosmic energies.");
      setState(AppState.ERROR);
    }
  };

  const handleUpdateProfile = async (config: UserProfileConfig) => {
    setProfileConfig(config);
    if (user) await updateProfileConfig(user.uid, config);
  };

  const { userData, setUserData, setCosmicData, activeTheme } = useHigherMind();
  
  useEffect(() => {
    if (profileConfig) {
      // Prevents infinite loop if we just updated userData 
      if (!userData || JSON.stringify(userData.profileWidgets) === JSON.stringify(profileConfig.profileWidgets)) {
        setUserData(profileConfig);
      }
    }
  }, [profileConfig]);

  useEffect(() => {
    if (userData && user && profileConfig) {
      if (JSON.stringify(userData.profileWidgets) !== JSON.stringify(profileConfig.profileWidgets)) {
        const newConfig = { ...profileConfig, profileWidgets: userData.profileWidgets } as UserProfileConfig;
        setProfileConfig(newConfig);
        updateProfileConfig(user.uid, newConfig).catch(console.error);
      }
    }
  }, [userData?.profileWidgets, user]);

  useEffect(() => {
    setCosmicData(data);
  }, [data, setCosmicData]);

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

  if (isSplashVisible) return <SplashScreen onComplete={() => setIsSplashVisible(false)} />;

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans" style={{ background: activeTheme?.lighting?.backgroundStyle || 'black' }}>
      <StarMap />
      <CosmosBackground />
      <GlobalHUD setActiveTab={setActiveTab}>
        <AnimatePresence mode="wait">
          {viewMode === 'blueprint' ? (
            <motion.div
              key="blueprint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <ChunkErrorBoundary fallbackTitle="Blueprint Workspace Synchronizing">
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
              </ChunkErrorBoundary>
            </motion.div>
          ) : viewMode === 'universe' ? (
            <motion.div
              key="universe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <ChunkErrorBoundary fallbackTitle="Identity Matrix Synchronizing">
                <Suspense fallback={<LoadingView color="emerald" />}>
                  <CosmicProfile initialConfig={profileConfig || undefined} />
                </Suspense>
              </ChunkErrorBoundary>
            </motion.div>
          ) : viewMode === 'natal' ? (
            <motion.div
              key="natal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <ChunkErrorBoundary fallbackTitle="3D Natal Astrolabe Synchronizing">
                <Suspense fallback={<LoadingView color="cyan" />}>
                  <NatalChart3D data={data} initialPreset="nadal" />
                </Suspense>
              </ChunkErrorBoundary>
            </motion.div>
          ) : (
            <motion.div
              key="solar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <ChunkErrorBoundary fallbackTitle="Solar Observatory Synchronizing">
                <Suspense fallback={<LoadingView color="amber" />}>
                   <SolarSystemScene data={data} onPlanetClick={handleSpeak} />
                </Suspense>
              </ChunkErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-wrap justify-center items-center gap-2 md:gap-3">
          <button 
            onClick={() => setViewMode('natal')} 
            className={`backdrop-blur-xl border px-4 md:px-5 py-2 rounded-full flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest ${
              viewMode === 'natal' 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                : 'bg-black/60 border-white/20 text-white/60 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Natal 3D</span>
          </button>
          <button 
            onClick={() => setViewMode('blueprint')} 
            className={`backdrop-blur-xl border px-4 md:px-5 py-2 rounded-full flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest ${
              viewMode === 'blueprint' 
                ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                : 'bg-black/40 border-white/20 text-white/60 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4 text-purple-400" />
            <span>Blueprint</span>
          </button>
          <button 
            onClick={() => setViewMode('solar')} 
            className={`backdrop-blur-xl border px-4 md:px-5 py-2 rounded-full flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest ${
              viewMode === 'solar' 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                : 'bg-black/40 border-white/20 text-white/60 hover:text-white'
            }`}
          >
            <Stars className="w-4 h-4 text-amber-400" />
            <span>Solar</span>
          </button>
          <button 
            onClick={() => setViewMode('universe')} 
            className={`backdrop-blur-xl border px-4 md:px-5 py-2 rounded-full flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest ${
              viewMode === 'universe' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                : 'bg-black/40 border-white/20 text-white/60 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Identity</span>
          </button>
        </div>

        {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900 text-white px-6 py-3 rounded-2xl">{error}<button onClick={() => setError(null)} className="ml-4">✕</button></div>}
        
        <CosmicChat cosmicData={data} />
        <CosmicAudio />
      </GlobalHUD>
    </div>
  );
}
