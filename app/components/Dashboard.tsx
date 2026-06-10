// --- CORE IMPORTS & EXTERNAL LIBRARIES ---
import * as React from 'react';
import { useState, useRef, useEffect, ReactNode } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { CosmicData, UserProfileConfig } from '../types';
import { 
  Sparkles, Moon, Sun, Star, Activity, Hexagon, Fingerprint, Network, Menu, X, GripHorizontal,
  Camera, Video, ExternalLink, User as UserIcon, LogOut, Edit3, Globe, Compass, 
  Type, BookOpen, Minimize2, Maximize2, Search, BarChart2, Zap, Upload, Palette, 
  Bookmark, Volume2, Grid, Heart, Brain, CirclePlay, MessageCircle, Box, Key, Cpu,
  Workflow, Radio, Loader2, Flame, Orbit, Hash, Map, Triangle, LibraryBig, History, Layers, LayoutGrid, Pin
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, Pie, PieChart as RechartsPieChart, CartesianGrid
} from 'recharts';
// --- SERVICE INTEGRATIONS ---
import { fetchTimelineDepth, fetchTimelineDeepDiveOption, fetchGeneralDeepDive, fetchCosmicChatResponse } from '../services/geminiService';
import { User } from 'firebase/auth';

// --- DYNAMICALLY IMPORTED COMPONENTS ---
const DeepSynthesis = React.lazy(() => import('./DeepSynthesis'));
const HarmonicVisualizer = React.lazy(() => import('./HarmonicVisualizer'));
const ChakraScene = React.lazy(() => import('./ChakraScene'));
const CompatibilityMatrix = React.lazy(() => import('./CompatibilityMatrix'));
const SoulBlueprintAura = React.lazy(() => import('./SoulBlueprintAura'));
const CelestialDNASection = React.lazy(() => import('./CelestialDNASection'));
const DailyCosmicPulse = React.lazy(() => import('./DailyCosmicPulse').then(m => ({ default: m.DailyCosmicPulse })));
const HolographicProfile = React.lazy(() => import('./HolographicProfile').then(m => ({ default: m.HolographicProfile })));
const StarChart3D = React.lazy(() => import('./StarChart3D').then(m => ({ default: m.StarChart3D })));
const EgyptianPyramidAlignment = React.lazy(() => import('./EgyptianPyramid').then(m => ({ default: m.EgyptianPyramidAlignment })));
const SynapticWebVisualizer = React.lazy(() => import('./SynapticWebVisualizer').then(m => ({ default: m.SynapticWebVisualizer })));
const NeuralSynapticViz = React.lazy(() => import('./NeuralSynapticViz').then(m => ({ default: m.NeuralSynapticViz })));
const AstraeaOracle = React.lazy(() => import('./AstraeaOracle').then(m => ({ default: m.AstraeaOracle })));
const CosmicCanvas = React.lazy(() => import('./CosmicCanvas').then(m => ({ default: m.CosmicCanvas })));
const HolographicNotebook = React.lazy(() => import('./HolographicNotebook').then(m => ({ default: m.HolographicNotebook })));
const AIAgentsSection = React.lazy(() => import('./AIAgentsSection').then(m => ({ default: m.AIAgentsSection })));
const PastLifeEchoes = React.lazy(() => import('./PastLifeEchoes').then(m => ({ default: m.PastLifeEchoes })));
const NeuralBrainSection = React.lazy(() => import('./NeuralBrainSection'));
const GematriaHUD = React.lazy(() => import('./GematriaHUD').then(m => ({ default: m.GematriaHUD })));
const CosmicCodex = React.lazy(() => import('./CosmicCodex').then(m => ({ default: m.CosmicCodex })));
const AIEvolutionStream = React.lazy(() => import('./AIEvolutionStream').then(m => ({ default: m.AIEvolutionStream })));
const AngelNumbersSection = React.lazy(() => import('./AngelNumbersSection').then(m => ({ default: m.AngelNumbersSection })));
const GematriaCalculatorSection = React.lazy(() => import('./GematriaCalculatorSection').then(m => ({ default: m.GematriaCalculatorSection })));
const VortexSequencingSection = React.lazy(() => import('./VortexSequencingSection').then(m => ({ default: m.VortexSequencingSection })));
const GoldenRatioSection = React.lazy(() => import('./GoldenRatioSection').then(m => ({ default: m.GoldenRatioSection })));
const SkyMapSection = React.lazy(() => import('./SkyMapSection').then(m => ({ default: m.SkyMapSection })));
const SoulPathSection = React.lazy(() => import('./SoulPathSection').then(m => ({ default: m.SoulPathSection })));
const AncestralResearchSection = React.lazy(() => import('./AncestralResearchSection').then(m => ({ default: m.AncestralResearchSection })));
const CommunityFeed = React.lazy(() => import('./social/CommunityFeed'));
const LiveMessenger = React.lazy(() => import('./social/LiveMessenger'));
const KarmaLedger = React.lazy(() => import('./KarmaLedger').then(m => ({ default: m.KarmaLedger })));
import { getAstralProfile } from '../services/socialService';
const BirthChartGuide = React.lazy(() => import('./BirthChartGuide'));
const SandboxSection = React.lazy(() => import('./sandbox/SandboxSection').then(m => ({ default: m.SandboxSection })));
const QuantumFluid = React.lazy(() => import('./QuantumFluid').then(m => ({ default: m.QuantumFluid })));
import VoiceCommander from './VoiceCommander';
import { HigherMindSettings } from './HigherMindSettings';
const TetragrammatonHUD = React.lazy(() => import('./TetragrammatonHUD').then(m => ({ default: m.TetragrammatonHUD })));
const Freemason33Section = React.lazy(() => import('./Freemasonry33Section').then(m => ({ default: m.Freemason33Section })));
const TarotGnosis = React.lazy(() => import('./TarotGnosis').then(m => ({ default: m.TarotGnosis })));
const TarotHologram = React.lazy(() => import('./TarotHologram').then(m => ({ default: m.TarotHologram })));
const ChineseZodiacGnosis = React.lazy(() => import('./ChineseZodiacGnosis').then(m => ({ default: m.ChineseZodiacGnosis })));
import { soundEngine } from '../lib/soundEffects';
const AstralCanvas = React.lazy(() => import('./AstralCanvas').then(m => ({ default: m.AstralCanvas })));
const AvatarMatrix = React.lazy(() => import('./AvatarMatrix').then(m => ({ default: m.AvatarMatrix })));

const QuantumEvolutionSection = React.lazy(() => import('./QuantumEvolutionSection').then(m => ({ default: m.QuantumEvolutionSection })));
const ObsidianVaultSection = React.lazy(() => import('./ObsidianVaultSection').then(m => ({ default: m.ObsidianVaultSection })));
const CelestialSphereSection = React.lazy(() => import('./CelestialSphereSection').then(m => ({ default: m.CelestialSphereSection })));
const ChristSophiaSection = React.lazy(() => import('./ChristSophiaSection').then(m => ({ default: m.ChristSophiaSection })));
const HolographicRainbowSection = React.lazy(() => import('./HolographicRainbowSection').then(m => ({ default: m.HolographicRainbowSection })));
const FlowerOfLifeSection = React.lazy(() => import('./FlowerOfLifeSection').then(m => ({ default: m.FlowerOfLifeSection })));
const VibrationalTuningSection = React.lazy(() => import('./VibrationalTuningSection').then(m => ({ default: m.VibrationalTuningSection })));
const DestinyMatrix = React.lazy(() => import('./DestinyMatrix').then(m => ({ default: m.DestinyMatrix })));
const CelestialBlueprintSection = React.lazy(() => import('./CelestialBlueprintSection').then(m => ({ default: m.CelestialBlueprintSection })));
const JarvisHUD = React.lazy(() => import('./JarvisHUD').then(m => ({ default: m.JarvisHUD })));
const AstrologyEngine = React.lazy(() => import('./AstrologyEngine').then(m => ({ default: m.AstrologyEngine })));
const NineDimensionsSection = React.lazy(() => import('./NineDimensionsSection').then(m => ({ default: m.NineDimensionsSection })));
import { ProjectableWidget } from './ProjectableWidget';
import { useHigherMind } from './HigherMindProvider';
import { HoloSideDrawer } from './HoloSideDrawer';
import { WidgetGallerySidebar } from './WidgetGallerySidebar';
import { WorkspaceWidgets } from './WorkspaceWidgets';

/**
 * Interface for DashboardProps
 * Defines the contract for top-level data flow into the dashboard.
 */
interface DashboardProps {
  data: CosmicData | null;
  onGenerate: (name: string, date: string, time: string, location: string) => void;
  isLoading: boolean;
  activeTab: 'astraea' | 'neural_synaptic' | 'quantum_fluid' | 'torus' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'chakras' | 'compatibility' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns' | 'findings' | 'identity' | 'harmonics' | 'celestial_dna' | 'brain' | 'angel_numbers' | 'vortex' | 'gematria_calc' | 'golden_ratio' | 'community' | 'messages' | 'sandbox' | 'sky_map' | 'soul_path' | 'tetragrammaton' | 'christ_sophia' | 'astral_canvas' | 'avatar_matrix' | 'vibrational_tuning' | 'celestial_blueprint' | 'obsidian' | 'codex' | 'evolution' | 'freemason33' | 'tarot' | 'chinese_zodiac' | 'destiny_matrix' | 'holographic_rainbow' | 'flower_of_life' | 'alignment' | 'ai_agents' | 'holographic_profile' | 'celestial_sphere' | 'star_chart' | 'egyptian' | 'notebook' | 'past_life_echoes' | 'synaptic_web' | 'cosmic_canvas' | 'karma_ledger' | 'jarvis_os' | 'astrology_engine' | '9d_creation';
  setActiveTab: (tab: 'astraea' | 'neural_synaptic' | 'quantum_fluid' | 'torus' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'chakras' | 'compatibility' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns' | 'findings' | 'identity' | 'harmonics' | 'celestial_dna' | 'brain' | 'angel_numbers' | 'vortex' | 'gematria_calc' | 'golden_ratio' | 'community' | 'messages' | 'sandbox' | 'sky_map' | 'soul_path' | 'tetragrammaton' | 'christ_sophia' | 'astral_canvas' | 'avatar_matrix' | 'vibrational_tuning' | 'celestial_blueprint' | 'obsidian' | 'codex' | 'evolution' | 'freemason33' | 'tarot' | 'chinese_zodiac' | 'destiny_matrix' | 'holographic_rainbow' | 'flower_of_life' | 'alignment' | 'ai_agents' | 'holographic_profile' | 'celestial_sphere' | 'star_chart' | 'egyptian' | 'notebook' | 'past_life_echoes' | 'synaptic_web' | 'cosmic_canvas' | 'karma_ledger' | 'jarvis_os' | 'astrology_engine' | '9d_creation') => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  loadedInputs: any;
  profileConfig?: UserProfileConfig;
  onUpdateProfile: (config: UserProfileConfig) => void;
  onPresentationRequest?: () => void;
  externalDeepDive?: { title: string; content: string } | null;
  onClearExternalDeepDive?: () => void;
  vortexMode?: 'material' | 'spirit' | 'sync';
  setVortexMode?: (mode: 'material' | 'spirit' | 'sync') => void;
}

/**
 * ProfileModal Component
 * Handles user customization, identity matrix, styles, and the research vault.
 * [PROFILE & IDENTITY MANAGEMENT]
 */
const ProfileModal = ({ isOpen, onClose, profileConfig, onUpdateProfile, loadedInputs, isReading, handleReadOutLoud }: { isOpen: boolean, onClose: () => void, profileConfig?: UserProfileConfig, onUpdateProfile: (c: UserProfileConfig) => void, loadedInputs: any, isReading: boolean, handleReadOutLoud: (text: string) => void }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'identity' | 'style' | 'vault'>('identity');
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCategory, setVaultCategory] = useState('All');
  const [isAIAssisting, setIsAIAssisting] = useState(false);
  
  const [displayName, setDisplayName] = useState(profileConfig?.displayName || '');
  const [bioText, setBioText] = useState(profileConfig?.bio?.text || '');
  const [avatarUrl, setAvatarUrl] = useState(profileConfig?.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(profileConfig?.bannerUrl || '');
  const [primaryColor, setPrimaryColor] = useState(profileConfig?.theme?.primaryColor || '#a855f7');
  const [secondaryColor, setSecondaryColor] = useState(profileConfig?.theme?.secondaryColor || '#3b82f6');
  const [backgroundEffect, setBackgroundEffect] = useState(profileConfig?.theme?.backgroundEffect || 'stars');

  useEffect(() => {
    if (profileConfig) {
      setDisplayName(profileConfig.displayName || '');
      setBioText(profileConfig.bio?.text || '');
      setAvatarUrl(profileConfig.avatarUrl || '');
      setBannerUrl(profileConfig.bannerUrl || '');
      setPrimaryColor(profileConfig.theme?.primaryColor || '#a855f7');
      setSecondaryColor(profileConfig.theme?.secondaryColor || '#3b82f6');
      setBackgroundEffect(profileConfig.theme?.backgroundEffect || 'stars');
    }
  }, [profileConfig]);

  if (!isOpen) return null;

  const handleAIStylist = async () => {
    setIsAIAssisting(true);
    soundEngine.scan();
    try {
      const prompt = `Based on my current cosmic identity (Name: ${displayName}, Bio: ${bioText}), suggest a more profound, 2-sentence bio and a hex color code that reflects my soul frequency. Respond in JSON format: { "bio": "...", "color": "#HEX" }`;
      const response = await fetchCosmicChatResponse(prompt, [], null);
      let text = response.text || "";
      // Strip potential markdown
      text = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      if (parsed.bio) setBioText(parsed.bio);
      if (parsed.color) setPrimaryColor(parsed.color);
      soundEngine.neuralClick();
    } catch (e) {
      console.error("AI Stylist failed:", e);
    } finally {
      setIsAIAssisting(false);
    }
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=200&h=200'
  ];

  const BANNER_PRESETS = [
    'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=1200&h=400',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=1200&h=400',
    'https://images.unsplash.com/photo-1506318137071-a8e063b4bcc0?auto=format&fit=crop&q=80&w=1200&h=400',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=1200&h=400',
    'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&q=80&w=1200&h=400'
  ];

  const handleSave = () => {
    if (!profileConfig) return;
    const updatedConfig: UserProfileConfig = {
      ...profileConfig,
      displayName,
      avatarUrl,
      bannerUrl,
      bio: {
        ...profileConfig.bio,
        text: bioText
      },
      theme: {
        ...profileConfig.theme,
        primaryColor,
        secondaryColor,
        backgroundEffect
      }
    };
    onUpdateProfile(updatedConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8 bg-black/80 backdrop-blur-md pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="bg-stone-950 border border-white/10 rounded-none md:rounded-[2.5rem] w-full max-w-5xl h-full max-h-screen md:max-h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
      >
        {/* Header / Banner Preview */}
        <div className="h-48 md:h-64 bg-stone-900 relative overflow-hidden shrink-0">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-800 to-black flex items-center justify-center opacity-30">
               <Globe className="w-32 h-32 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
          
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-3xl bg-stone-900 border-4 border-stone-950 shadow-2xl overflow-hidden flex items-center justify-center ring-1 ring-white/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-stone-700" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                <Camera className="text-white w-6 h-6" />
              </div>
            </div>
            <div className="mb-2">
               <h2 className="text-3xl font-light text-white tracking-widest leading-none mb-2">{displayName || 'Anonymous Traveler'}</h2>
               <div className="flex gap-2">
                 <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase tracking-widest text-stone-400">Level 4 Consciousness</span>
                 <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase tracking-widest text-stone-400">Node Connected</span>
               </div>
            </div>
          </div>
          
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-white/10 rounded-full border border-white/10 text-stone-400 hover:text-white transition-all backdrop-blur-md">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-16 px-8 flex border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'identity', label: 'Identity Matrix', icon: Fingerprint },
            { id: 'style', label: 'Cosmic Aesthetics', icon: Palette },
            { id: 'vault', label: 'Research Vault', icon: BookOpen }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { soundEngine.mechClick(); setActiveSettingsTab(tab.id as any); }}
              onMouseEnter={() => soundEngine.mechHover()}
              className={`flex items-center gap-2 px-6 py-4 text-xs uppercase tracking-[0.2em] transition-all border-b-2 ${activeSettingsTab === tab.id ? 'border-purple-500 text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
            >
              <tab.icon size={16} className={activeSettingsTab === tab.id ? 'text-purple-400' : ''} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className="max-w-3xl mx-auto">
            {activeSettingsTab === 'identity' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                     <label className="block text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Public Name</label>
                     <input 
                       type="text" 
                       value={displayName} 
                       onChange={e => setDisplayName(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-light text-lg"
                       placeholder="Enter cosmic alias..."
                     />
                     <p className="text-[10px] text-stone-600 italic">This name identifies your node in the global astral collective.</p>
                   </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Avatar Transporter</label>
                        <div className="flex gap-1">
                          {AVATAR_PRESETS.map((url, i) => (
                            <button key={i} onClick={() => setAvatarUrl(url)} className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 transition-colors">
                              <img src={url} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={avatarUrl} 
                          onChange={e => setAvatarUrl(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-stone-300 focus:outline-none focus:border-purple-500/50 transition-all font-light text-sm"
                          placeholder="Image URL (square preferred)"
                        />
                        <button className="bg-white/5 border border-white/10 p-3 rounded-2xl text-stone-400 hover:text-white transition-colors">
                          <Upload size={18} />
                        </button>
                      </div>
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Incarnation Biography</label>
                    <button 
                      onClick={handleAIStylist}
                      disabled={isAIAssisting}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3 h-3 ${isAIAssisting ? 'animate-spin' : ''}`} />
                      AI Scribe
                    </button>
                  </div>
                  <textarea 
                    value={bioText} 
                    onChange={e => setBioText(e.target.value)}
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-stone-200 focus:outline-none focus:border-purple-500/50 transition-all font-light leading-relaxed resize-none text-lg"
                    placeholder="Describe your current manifestation..."
                  />
                  <div className="flex justify-between text-[10px] text-stone-600">
                    <span>Markdown supported</span>
                    <span>{bioText.length}/512</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSettingsTab === 'style' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Atmospheric Resonance (Header)</label>
                    <div className="flex gap-1">
                      {BANNER_PRESETS.map((url, i) => (
                        <button key={i} onClick={() => setBannerUrl(url)} className="w-8 h-6 rounded-md overflow-hidden border border-white/10 hover:border-purple-500 transition-colors">
                          <img src={url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={bannerUrl} 
                      onChange={e => setBannerUrl(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-stone-300 focus:outline-none focus:border-purple-500/50 transition-all font-light"
                      placeholder="Enter banner image URL..."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Aura Signature (Theme)</label>
                    <div className="flex flex-wrap gap-4">
                      {['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#ffffff'].map(color => (
                        <button 
                          key={color} 
                          onClick={() => setPrimaryColor(color)}
                          className={`w-10 h-10 rounded-2xl border-4 transition-all ${primaryColor === color ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Background Dimensionality</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['stars', 'nebula', 'aurora', 'particles'].map(effect => (
                         <button 
                           key={effect}
                           onClick={() => setBackgroundEffect(effect as any)}
                           className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest border transition-all ${backgroundEffect === effect ? 'bg-white/10 border-white/30 text-white' : 'bg-black/40 border-white/5 text-stone-500 hover:text-stone-300'}`}
                         >
                           {effect}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSettingsTab === 'vault' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type="text" 
                      placeholder="Search vault..." 
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-light"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {['All', 'Astrology', 'Numerology', 'Synthesis', 'Deep Dive'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setVaultCategory(cat)}
                        className={`px-4 py-2 rounded-xl border text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${vaultCategory === cat ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-stone-500 hover:text-white'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {(!profileConfig.researchVault || profileConfig.researchVault.length === 0) ? (
                  <div className="py-20 text-center space-y-4 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 mx-auto max-w-md">
                     <BookOpen className="w-12 h-12 text-stone-700 mx-auto" />
                     <p className="text-stone-500 font-light italic">Your vault is currently empty. Pin findings from your explorations to see them here.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profileConfig.researchVault
                      .filter(item => {
                        const matchesSearch = item.title.toLowerCase().includes(vaultSearch.toLowerCase()) || item.content.toLowerCase().includes(vaultSearch.toLowerCase());
                        const matchesCategory = vaultCategory === 'All' || item.category === vaultCategory;
                        return matchesSearch && matchesCategory;
                      })
                      .map((item, i) => (
                      <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${item.category === 'Astrology' ? 'bg-purple-500' : item.category === 'Numerology' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-stone-500" suppressHydrationWarning>{item.category} • {new Date(item.timestamp).toLocaleDateString('en-US')}</span>
                            {item.tags && item.tags.length > 0 && item.tags.map(tag => (
                              <span key={tag} className="text-[8px] uppercase tracking-[0.2em] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">{tag}</span>
                            ))}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleReadOutLoud(item.content)}
                              className={`p-1.5 rounded-lg border border-white/10 transition-all ${isReading ? 'bg-purple-600 text-white animate-pulse' : 'text-stone-500 hover:text-white hover:bg-white/5'}`}
                            >
                              <Volume2 size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                const newVault = profileConfig.researchVault.filter(ri => ri.id !== item.id);
                                onUpdateProfile({ ...profileConfig, researchVault: newVault });
                              }} 
                              className="text-stone-500 hover:text-red-400 p-1.5"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-lg font-light text-white mb-2">{item.title}</h4>
                        <p className="text-xs text-stone-400 leading-relaxed font-light line-clamp-3">{item.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-stone-600 italic">All configurations are stored in the local consciousness node.</p>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-3 text-xs uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Cancel</button>
            <button 
              onClick={() => { handleSave(); onClose(); }} 
              className="px-10 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs uppercase tracking-[0.2em] font-bold shadow-lg shadow-purple-900/40 transition-all"
            >
              Sync Matrix Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * ActionMenu Component
 * Floating menu for high-level actions: Sign In, Export, Capture, and external links.
 * [UTILITY & SYSTEM ACTIONS]
 */
const ActionMenu = ({ user, data, onSignIn, onSignOut, onEditProfile, profileConfig, layoutMode, onSetLayoutMode }: { user: User | null, data: CosmicData | null, onSignIn: () => void, onSignOut: () => void, onEditProfile: () => void, profileConfig?: UserProfileConfig, layoutMode: 'minimized' | 'half' | 'full', onSetLayoutMode: (mode: 'minimized' | 'half' | 'full') => void }) => {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleCaptureImage = () => {
    const canvas = document.getElementById('cosmic-canvas') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'cosmic-torus-reading.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const handleRecordVideo = () => {
    const canvas = document.getElementById('cosmic-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'cosmic-torus-animation.webm';
        link.href = url;
        link.click();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Failed to start recording", e);
      alert("Video recording is not supported in this browser environment.");
    }
  };

  return (
    <div className="absolute top-6 right-6 z-[100] flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {open && (
           <motion.div initial={{ opacity: 0, scale: 0.9, transformOrigin: 'top right' }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl mb-4 flex flex-col gap-2 origin-top-right shadow-2xl">
              {user ? (
                 <>
                   <div className="px-4 py-3 border-b border-white/10 mb-1 flex flex-col gap-2">
                     <div className="flex items-center gap-3">
                       {profileConfig?.avatarUrl || user.photoURL ? (
                         <img src={profileConfig?.avatarUrl || user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-white/10" />
                       ) : (
                         <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300"><UserIcon size={16}/></div>
                       )}
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-white">{profileConfig?.displayName || user.displayName || 'Traveler'}</span>
                         <span className="text-[10px] text-stone-500 truncate w-32 uppercase tracking-widest">{user.email}</span>
                       </div>
                     </div>
                     <button onClick={() => { setOpen(false); onEditProfile(); }} className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 group/edit">
                        <Edit3 size={12} className="group-hover/edit:rotate-12 transition-transform" /> 
                        Edit Profile Matrix
                      </button>
                   </div>
                   <button onClick={onSignOut} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium">
                     <LogOut className="w-4 h-4 text-stone-400" /> Sign Out
                   </button>
                   <div className="h-px bg-white/10 my-1 mx-2"></div>
                 </>
              ) : (
                 <>
                   <button onClick={onSignIn} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium mb-1">
                     <UserIcon className="w-4 h-4 text-blue-400" /> Sign In w/ Google
                   </button>
                   <div className="h-px bg-white/10 my-1 mx-2"></div>
                 </>
              )}
              {data && (
                <div className="flex flex-col gap-1 border-b border-white/10 pb-2 mb-2">
                  <div className="px-4 py-2 text-[10px] text-stone-400 font-mono uppercase tracking-widest">Workspace Layout</div>
                  <button onClick={() => { setOpen(false); onSetLayoutMode('minimized'); }} className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors w-full text-left text-sm font-medium ${layoutMode === 'minimized' ? 'bg-white/10 text-white' : 'text-stone-300'}`}>
                     <Minimize2 className="w-4 h-4 text-orange-400" /> Minimized
                  </button>
                  <button onClick={() => { setOpen(false); onSetLayoutMode('half'); }} className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors w-full text-left text-sm font-medium ${layoutMode === 'half' ? 'bg-white/10 text-white' : 'text-stone-300'}`}>
                     <Minimize2 className="w-4 h-4 text-sky-400 rotate-90" /> Half Page
                  </button>
                  <button onClick={() => { setOpen(false); onSetLayoutMode('full'); }} className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors w-full text-left text-sm font-medium ${layoutMode === 'full' ? 'bg-white/10 text-white' : 'text-stone-300'}`}>
                     <Maximize2 className="w-4 h-4 text-blue-400" /> Full Page
                  </button>
                </div>
              )}
              <button onClick={handleCaptureImage} className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium">
                 <Camera className="w-4 h-4 text-purple-400" /> Capture Image
              </button>
              <button onClick={handleRecordVideo} className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium ${isRecording ? 'animate-pulse text-red-400' : ''}`}>
                 <Video className={`w-4 h-4 ${isRecording ? 'text-red-400' : 'text-blue-400'}`} /> {isRecording ? 'Stop Recording' : 'Record Video'}
              </button>
              <button 
                onClick={() => {
                  if (data) {
                     const txt = `ASTRAL MIND: NATAL READING EXPORT\n\n${JSON.stringify(data, null, 2)}`;
                     const blob = new Blob([txt], { type: 'text/plain' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = 'astral-mind-chatgpt-export.txt';
                     a.click();
                  }
                }} 
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium">
                 <ExternalLink className="w-4 h-4 text-emerald-400" /> Export for ChatGPT
              </button>
              <div className="h-px bg-white/10 my-1 mx-2"></div>
              <a href="https://astrology3d.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium">
                 <Globe className="w-4 h-4 text-indigo-400" /> Astrology3D App
              </a>
              <a href="https://gematrinator.com/calculator" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium">
                 <ExternalLink className="w-4 h-4 text-emerald-400" /> Gematrinator Calc
              </a>
              <a href="https://gematrinator.com/number-properties" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-stone-200 transition-colors w-full text-left text-sm font-medium">
                 <ExternalLink className="w-4 h-4 text-emerald-400" /> Number Properties
              </a>
           </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(!open)} className={`p-4 rounded-full shadow-2xl transition-all flex items-center justify-center ${open ? 'bg-white/20 text-white shadow-purple-500/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/50'}`}>
        {user && !open ? (user.photoURL ? <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" /> : <UserIcon size={24} />) : (open ? <X size={24} /> : <Menu size={24} />)}
      </button>
    </div>
  );
};

/**
 * Primary Dashboard Component
 * The central UI hub for displaying readings, conducting research, and navigating modules.
 */
/**
 * Section Component
 * A consistent layout for displaying esoteric analysis sections.
 */
const Section = ({ title, content }: { title: string, content: string }) => (
  <div className="space-y-2">
    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">{title}</h4>
    <p className="text-stone-300 font-light leading-relaxed">{content}</p>
  </div>
);

/**
 * SoulBlueprintTab Component
 * Detailed 3D torus visualization for soul blueprint analysis.
 * Moved here to resolve React hook dispatcher issues between module boundaries.
 */
const SoulBlueprintTab = ({ data, ResearchBox, isReading, handleReadOutLoud, handleSaveToVault, handleGeneralDeepDive }: { 
  data: any, 
  ResearchBox: any, 
  isReading: boolean,
  handleReadOutLoud: (text: string) => void,
  handleSaveToVault: (title: string, content: string, category: string) => void,
  handleGeneralDeepDive: (title: string, content: string) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="absolute inset-0 -mx-6 -my-6 overflow-hidden rounded-3xl group bg-black/40">
      <SoulBlueprintAura data={data} />
      {/* HUD overlays */}
      <div className="absolute top-8 left-4 right-4 md:left-8 md:right-8 flex flex-col gap-4 z-20 pointer-events-none">
        
        {/* New Tuning & Connection HUD */}
        <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="bg-purple-950/40 backdrop-blur-md border border-purple-500/30 p-3 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)] self-center text-center">
            <h3 className="text-sm font-medium text-purple-200 mb-1 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> Torus Field Frequency
            </h3>
            <div className="flex gap-4 text-xs font-light text-purple-300/80">
                <span>Higher Consciousness Connection: <strong className="text-emerald-400 font-bold">99.8%</strong></span>
                <span>Law of Attraction Pitch: <strong className="text-sky-400 font-bold">432 Hz</strong></span>
            </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
           {data.torusAnalysis?.soulAge && (
             <ProjectableWidget id="soul-age" type="text" componentName="SoulAge" data={data.torusAnalysis.soulAge}>
               <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.5}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)] md:min-w-[200px]">
                 <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Soul Age</span>
                 <span className="text-xl text-sky-100 font-light">{data.torusAnalysis.soulAge}</span>
               </motion.div>
             </ProjectableWidget>
           )}
           {data.torusAnalysis?.dimensionalFrequency && (
             <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.6}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)] md:text-right md:min-w-[200px]">
               <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Resonance Freq</span>
               <span className="text-xl text-sky-100 font-light">{data.torusAnalysis.dimensionalFrequency}</span>
             </motion.div>
           )}
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4">
           {data.torusAnalysis?.primaryRay && (
             <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.7}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)] md:min-w-[200px]">
               <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Primary Ray</span>
               <span className="text-xl text-sky-100 font-light">{data.torusAnalysis.primaryRay}</span>
             </motion.div>
           )}
           {data.torusAnalysis?.karmicTheme && (
             <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.8}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)] md:text-right md:max-w-[300px]">
               <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Karmic Theme</span>
               <span className="text-sm text-sky-100 font-light leading-snug">{data.torusAnalysis.karmicTheme}</span>
             </motion.div>
           )}
        </div>

        {/* Dynamic Tuning metrics */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-6 mt-4 pointer-events-auto">
            {/* Cosmic Key Tuning */}
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.9}} className="flex-1 bg-gradient-to-br from-fuchsia-950/60 to-transparent backdrop-blur-xl border border-fuchsia-500/30 p-4 rounded-3xl shadow-[0_0_35px_rgba(217,70,239,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent group-hover:scale-110 transition-transform animate-pulse" />
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-2">
                       <Key size={16} className="text-fuchsia-300 animate-bounce" />
                       <span className="text-[10px] text-fuchsia-300 uppercase tracking-[0.25em] font-bold">Cosmic Key 🗝️</span>
                   </div>
                   <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-[10px] font-mono text-fuchsia-100 bg-fuchsia-600/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                     432.01Hz
                   </motion.div>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-[9px] uppercase tracking-widest text-fuchsia-200/70 mb-1.5 flex items-center">
                            <span>Law of Attraction Pitch</span>
                            <span className="text-fuchsia-300 font-bold tracking-tight text-xs flex items-center gap-1">
                                98.4% <span className="text-fuchsia-500 text-[8px]">▲</span>
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden shadow-inner relative">
                           <motion.div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-fuchsia-600 via-fuchsia-400 to-white/80" initial={{width: "40%"}} animate={{width: ["90%", "98.4%", "96%"]}} transition={{duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse"}}/>
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-fuchsia-500/20 pt-2">
                        <div className="flex-1">
                          <span className="text-[7px] text-fuchsia-400/60 uppercase block mb-1 tracking-widest">Fine Tuning</span>
                          <div className="flex gap-1 h-2">
                            {Array.from({length: 8}).map((_, i) => (
                               <motion.div key={i} className="flex-1 bg-fuchsia-500/50 rounded-sm" animate={{ opacity: [0.3, 1, 0.3], height: ["40%", "100%", "40%"] }} transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: i * 0.1 }} />
                            ))}
                          </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Taurus Field Energy */}
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 1.0}} className="flex-1 bg-gradient-to-br from-emerald-950/60 to-transparent backdrop-blur-xl border border-emerald-500/30 p-4 rounded-3xl shadow-[0_0_35px_rgba(16,185,129,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent group-hover:scale-110 transition-transform animate-pulse" />
                <div className="absolute -inset-10 bg-emerald-500/10 blur-[30px] rounded-full animate-pulse opacity-50" />
                <div className="flex justify-between items-center mb-3 relative z-10">
                   <div className="flex items-center gap-2">
                       <Zap size={16} className="text-emerald-300" />
                       <span className="text-[10px] text-emerald-300 uppercase tracking-[0.25em] font-bold">Taurus Field</span>
                   </div>
                   <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-100 font-mono tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                     BROIL
                   </div>
                </div>
                <div className="h-10 flex items-end gap-[3px] mt-2 relative z-10">
                   {Array.from({length: 32}).map((_, i) => (
                     <motion.div key={i} className="flex-1 bg-gradient-to-t from-emerald-600 via-emerald-400 to-white/70 rounded-t-[2px] shadow-[0_0_5px_rgba(16,185,129,0.5)]" initial={{height: '10%'}} animate={{height: `${Math.max(20, Math.sin(i*0.4) * 50 + 50 + Math.random() * 40)}%`}} transition={{duration: 0.3 + Math.random() * 0.2, repeat: Infinity, repeatType: 'reverse', ease: "linear"}}/>
                   ))}
                </div>
                <div className="text-[7px] text-emerald-400/60 uppercase tracking-widest text-center mt-2 font-mono">Resonance Amplitude Peak</div>
            </motion.div>

            {/* Higher Consciousness */}
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 1.1}} className="flex-1 bg-gradient-to-br from-indigo-950/60 to-transparent backdrop-blur-xl border border-indigo-500/30 p-4 rounded-3xl shadow-[0_0_35px_rgba(99,102,241,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent group-hover:scale-110 transition-transform animate-pulse" />
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                       <Activity size={16} className="text-indigo-300 animate-pulse" />
                       <span className="text-[10px] text-indigo-300 uppercase tracking-[0.25em] font-bold">Consciousness</span>
                   </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="relative">
                    <motion.div animate={{ opacity: [0.8, 1, 0.8], textShadow: ["0 0 10px rgba(129,140,248,0.5)", "0 0 20px rgba(129,140,248,0.8)", "0 0 10px rgba(129,140,248,0.5)"] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl font-light text-white flex items-baseline gap-1">
                       99.9<span className="text-lg text-indigo-300 font-mono">%</span>
                    </motion.div>
                    <div className="absolute -bottom-3 left-1 text-[8px] text-indigo-400/80 uppercase tracking-widest font-mono">CONNECTION LINK</div>
                  </div>
                  <div className="mb-1 text-right flex flex-col items-end">
                    <div className="w-8 h-8 rounded-full border border-indigo-500/30 border-t-indigo-400 animate-spin flex items-center justify-center p-1">
                      <div className="w-full h-full rounded-full border border-indigo-400/50 border-b-indigo-300 animate-[spin_3s_linear_reverse] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,1)]" />
                      </div>
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-indigo-300/80 flex gap-1 items-center mt-2 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span> SYNC: 1.0</span>
                  </div>
                </div>
            </motion.div>
         </div>

      </div>

      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto no-scrollbar pt-[80vh] pb-[40vh] px-8 scroll-smooth"
      >
         <motion.div className="space-y-48 max-w-2xl mx-auto pb-48">
             
             {/* Box 1 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                <div className="absolute -inset-4 bg-sky-500/20 blur-2xl rounded-[3rem]" />
                <ResearchBox 
                  title="Torus: Body & Flow" 
                  content={data.torusAnalysis?.bodyAndFlow || 'Analyzing...' } 
                  className="bg-sky-950/40 backdrop-blur-3xl border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                  isReading={isReading}
                  handleReadOutLoud={handleReadOutLoud}
                  handleSaveToVault={handleSaveToVault}
                  handleGeneralDeepDive={handleGeneralDeepDive}
                >
                  <div className="text-sky-200 font-light leading-relaxed">
                    <Section title="Body & Flow" content={data.torusAnalysis?.bodyAndFlow || 'Analyzing...' } />
                  </div>
                </ResearchBox>
             </motion.div>

             {/* Box 2 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-[3rem]" />
                <ResearchBox 
                  title="Torus: Mind & Spirit" 
                  content={data.torusAnalysis?.mindAndSpiritual || 'Analyzing...' } 
                  className="bg-blue-950/40 backdrop-blur-3xl border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  isReading={isReading}
                  handleReadOutLoud={handleReadOutLoud}
                  handleSaveToVault={handleSaveToVault}
                  handleGeneralDeepDive={handleGeneralDeepDive}
                >
                  <div className="text-blue-200 font-light leading-relaxed">
                    <Section title="Mind & Spirit" content={data.torusAnalysis?.mindAndSpiritual || 'Analyzing...' } />
                  </div>
                </ResearchBox>
             </motion.div>

             {/* Box 3 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                 <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-[3rem]" />
                 <ResearchBox 
                  title="Torus: Cosmic Alignment" 
                  content={data.torusAnalysis?.cosmicAlignment || 'Analyzing...' } 
                  className="bg-cyan-950/40 backdrop-blur-3xl border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                  isReading={isReading}
                  handleReadOutLoud={handleReadOutLoud}
                  handleSaveToVault={handleSaveToVault}
                  handleGeneralDeepDive={handleGeneralDeepDive}
                >
                  <div className="text-cyan-200 font-light leading-relaxed">
                    <Section title="Cosmic Alignment" content={data.torusAnalysis?.cosmicAlignment || 'Analyzing...' } />
                  </div>
                </ResearchBox>
             </motion.div>

             {/* Box 4 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                 <div className="absolute -inset-4 bg-sky-400/20 blur-2xl rounded-[3rem]" />
                 <ResearchBox 
                  title="Torus Reading Synthesis" 
                  content={data.torusAnalysis?.overallAnalogy || 'Analyzing...' } 
                  className="bg-sky-900/40 backdrop-blur-3xl border-sky-400/30 shadow-[0_0_50px_rgba(56,189,248,0.3)]"
                  isReading={isReading}
                  handleReadOutLoud={handleReadOutLoud}
                  handleSaveToVault={handleSaveToVault}
                  handleGeneralDeepDive={handleGeneralDeepDive}
                >
                  <h4 className="text-sky-300 font-medium mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> Torus Synthesis</h4>
                  <p className="text-lg leading-relaxed text-sky-100/90 font-light italic border-l-2 border-sky-500/50 pl-4">{data.torusAnalysis?.overallAnalogy || 'Analyzing...'}</p>
                </ResearchBox>
             </motion.div>

         </motion.div>
      </div>
      
      {/* Scroll indicator overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none opacity-50">
         <span className="text-[10px] text-sky-300 uppercase tracking-[0.3em] font-bold mb-2">Scroll To Explore</span>
         <div className="w-px h-12 bg-gradient-to-b from-sky-400 to-transparent" />
      </div>
    </div>
  );
};

const ResearchBox = ({ title, content, children, className = "", category = "Miscellaneous", isReading, handleReadOutLoud, handleSaveToVault, handleGeneralDeepDive }: { 
  title: string, 
  content: string, 
  children: ReactNode, 
  className?: string, 
  category?: string,
  isReading: boolean,
  handleReadOutLoud: (text: string) => void,
  handleSaveToVault: (title: string, content: string, category: string) => void,
  handleGeneralDeepDive: (title: string, content: string) => void
}) => {
  const { saveToChat } = useHigherMind();
  
  return (
    <div className={`group relative bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all ${className}`}>
      <div className="flex justify-end gap-2 mb-2 z-30 relative opacity-40 group-hover:opacity-100 transition-opacity pointer-events-auto">
        <button 
          onClick={() => { soundEngine.click(); handleReadOutLoud(typeof content === 'string' ? content : JSON.stringify(content)); }}
          onMouseEnter={() => soundEngine.hover()}
          className={`px-3 py-2 rounded-lg transition-all border border-white/10 shadow-lg flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold ${isReading ? 'bg-purple-600 text-white animate-pulse' : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'}`}
          title="Listen"
        >
          <Volume2 className="w-3 h-3" />
          {isReading ? 'Reading...' : 'Listen'}
        </button>
        <button 
          onClick={() => { soundEngine.select(); handleSaveToVault(title, typeof content === 'string' ? content : JSON.stringify(content), category); }}
          onMouseEnter={() => soundEngine.hover()}
          className="bg-stone-800/80 hover:bg-emerald-700 p-2 rounded-lg text-stone-300 hover:text-white transition-all border border-white/10 shadow-lg"
          title="Save to Vault"
        >
          <Bookmark className="w-3 h-3" />
        </button>
        <button 
          onClick={() => { soundEngine.hover(); saveToChat(title, typeof content === 'string' ? content : JSON.stringify(content), category); }}
          onMouseEnter={() => soundEngine.hover()}
          className="bg-stone-800/80 hover:bg-purple-600 p-2 rounded-lg text-stone-300 hover:text-white transition-all border border-white/10 shadow-lg"
          title="Save to Higher Mind Chat"
        >
          <MessageCircle size={12} />
        </button>
        <button 
          onClick={() => { soundEngine.open(); handleGeneralDeepDive(title, typeof content === 'string' ? content : JSON.stringify(content)); }}
          onMouseEnter={() => soundEngine.hover()}
          className="bg-stone-800/80 hover:bg-stone-700 p-2 rounded-lg text-stone-300 hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold border border-white/10 shadow-lg"
        >
          <Search className="w-3 h-3" />
          Research
        </button>
      </div>
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

const DeepDiveModal = ({ deepDiveData, setDeepDiveData, handleSaveToVault, handleReadOutLoud, isReading, isDeepDiveLoading, handleDeepDiveNext, data }: {
  deepDiveData: any,
  setDeepDiveData: (d: any) => void,
  handleSaveToVault: any,
  handleReadOutLoud: any,
  isReading: boolean,
  isDeepDiveLoading: boolean,
  handleDeepDiveNext: any,
  data: any
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'text' | 'images' | 'video' | 'interactive'>('text');
  
  // Video simulation states
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoTime, setVideoTime] = useState<number>(15); // offset
  const [interactivePlaybackSpeed, setInteractivePlaybackSpeed] = useState<number>(1);
  const [videoChapter, setVideoChapter] = useState<number>(1);

  // Selected diagram nodes
  const [hoveredDiagramNode, setHoveredDiagramNode] = useState<string | null>(null);

  // Quiz game state
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [nodeAttuned, setNodeAttuned] = useState<boolean>(false);

  // Video ticking simulation
  useEffect(() => {
    let interval: any;
    if (isVideoPlaying && activeModalTab === 'video') {
      interval = setInterval(() => {
        setVideoTime((prev) => {
          const next = prev + 1 * interactivePlaybackSpeed;
          if (next >= 110) {
            setIsVideoPlaying(false);
            return 110;
          }
          if (next >= 70) {
            setVideoChapter(3);
          } else if (next >= 30) {
            setVideoChapter(2);
          } else {
            setVideoChapter(1);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, activeModalTab, interactivePlaybackSpeed]);

  if (!deepDiveData) return null;

  const cleanTitle = deepDiveData.title || "Stellar Identity";
  
  // Custom lessons dynamically generated based on current item
  const chapters = deepDiveData.videoChapters && Array.isArray(deepDiveData.videoChapters) && deepDiveData.videoChapters.length > 0 
    ? deepDiveData.videoChapters.map((ch: any, idx: number) => ({
        id: idx + 1,
        name: ch?.name || `Chapter ${idx + 1}`,
        start: idx * 40,
        end: (idx + 1) * 40,
        caption: ch?.caption || `Initiating exploration of "${cleanTitle}"...`,
        centerIcon: ch?.centerIcon || "Sparkles",
        colors: ch?.colors && Array.isArray(ch.colors) && ch.colors.length >= 2 ? ch.colors : ["emerald", "cyan"],
        orbitParams: ch?.orbitParams && Array.isArray(ch.orbitParams) && ch.orbitParams.length >= 2 ? ch.orbitParams : [
          { size: 40, speed: 12, dotSize: 4 },
          { size: 24, speed: 6, dotSize: 3.5 }
        ]
      }))
    : [
    {
      id: 1,
      name: "Metaphysical Foundations",
      start: 0,
      end: 30,
      caption: `Initiating exploration of "${cleanTitle}". We begin by stabilizing the core spiritual frequency, locating your natal or numerical parameters. Notice the active harmonic channels resonating at 528Hz. This foundation represents your unique celestial signature on the earthly plane.`,
    },
    {
      id: 2,
      name: "Geometric & Alphanumeric Synchronicities",
      start: 30,
      end: 70,
      caption: `We are now looking at the geometric intersections. Observe how "${cleanTitle}" overlaps with the 10 Sephirot on the Tree of Life. In this chapter, we map the Gematria codes to specific cosmic nodes, demonstrating that language and celestial orbits share a unified blueprint.`,
    },
    {
      id: 3,
      name: "Consciousness Synchronization Steps",
      start: 70,
      end: 110,
      caption: `Finally, we execute the synchronization. To integrate "${cleanTitle}", focus on grounding meditations. Keep your aura aligned, visualising Metatron's Cube overlay balancing your fields. You have successfully decapsulated this knowledge portal.`,
    }
  ];

  const currentChapterData = chapters.find((c: any) => c.id === videoChapter) || chapters[0];

  const quizQuestions = [
    {
      q: `Which energy center primarily integrates with "${cleanTitle}"?`,
      options: [
        "The Solar Plexus - Grounding of Core Will power",
        "The Crown Sephirah (Keter) - Highest Gateway of cosmic descent",
        "The Throat Chakra - Alphanumeric expression and vocal harmonics",
        "The Galactic Core Matrix - Center of absolute soul origins"
      ],
      correct: 1,
      expl: "Correct! The Crown center governs divine descent of cosmic light, channeling planetary and numeric frequencies directly into the soul's blueprint."
    },
    {
      q: "What is the optimal Solfeggio frequency to expand this state?",
      options: [
        "174 Hz (Grounding & Safety)",
        "396 Hz (Release of Fears)",
        "528 Hz (Vibrational Repair & Spiritual Transformation)",
        "852 Hz (Spiritual Order Return)"
      ],
      correct: 2,
      expl: "Correct! 528 Hz represents golden ratio alignment, healing DNA layers and stabilizing mystical geometry overlaps."
    },
    {
      q: `How do we incorporate the lessons of ${cleanTitle} into daily life?`,
      options: [
        "By daily alphanumeric chanting and natal grid projection",
        "By ignoring transits and relying solely on solar periods",
        "By harmonizing thoughts, emotions, and episodic experiences in parallel",
        "By isolating oneself to prevent energetic interference"
      ],
      correct: 2,
      expl: "Correct! True integration requires binding thoughts, feelings, and events into unified, coherent synaptic clusters."
    }
  ];

  const handleSelectOption = (idx: number) => {
    if (quizAnswered) return;
    try { soundEngine.click(); } catch(e){ /* ignore safe */ }
    setSelectedOption(idx);
    setQuizAnswered(true);
    if (idx === quizQuestions[currentQuizQuestion].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    try { soundEngine.click(); } catch(e){ /* ignore safe */ }
    if (currentQuizQuestion < quizQuestions.length - 1) {
      setCurrentQuizQuestion(prev => prev + 1);
      setSelectedOption(null);
      setQuizAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleAttuneNode = () => {
    try { 
      soundEngine.magic?.(); 
      if (soundEngine.success) soundEngine.success();
    } catch(e){ /* ignore safe */ }
    setNodeAttuned(true);
  };

  const handleResetQuiz = () => {
    try { soundEngine.click(); } catch(e){ /* ignore safe */ }
    setCurrentQuizQuestion(0);
    setSelectedOption(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setQuizCompleted(false);
    setNodeAttuned(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        className="bg-stone-900 border border-white/10 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-thin scrollbar-thumb-white/20 p-6 md:p-8"
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={() => { soundEngine.close(); setDeepDiveData(null); }}
          onMouseEnter={() => soundEngine.hover()}
          className="absolute top-6 right-6 text-stone-400 hover:text-white bg-white/5 p-2.5 rounded-full border border-white/10 transition-colors z-30"
        >
          <X size={18} />
        </button>
        
        {/* HEADER INFORMATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-purple-400 font-bold block">Esoteric Research Academy</span>
              <h2 className="text-xl md:text-2xl font-light text-white tracking-wide">
                Deep Dive: <span className="font-semibold text-purple-200">{cleanTitle}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSaveToVault(cleanTitle, deepDiveData.detailedAnalysis, 'Deep Dive', ['exploration'])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black border border-white/10 bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-all"
              title="Save to Cosmic Vault"
            >
              <Bookmark size={12} />
              Save Discovery
            </button>
            <button 
              onClick={() => handleReadOutLoud(deepDiveData.detailedAnalysis)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black border border-white/10 transition-all ${isReading ? 'bg-purple-600 text-white animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'}`}
            >
              <Volume2 size={12} />
              {isReading ? 'Stop Transmission' : 'Vocal Sync'}
            </button>
          </div>
        </div>

        {isDeepDiveLoading ? (
          <div className="py-24 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-12 h-12 border-2 border-emerald-500/20 border-b-emerald-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <p className="text-stone-400 font-light italic text-sm animate-pulse tracking-wide font-mono mt-4">Consulting the higher Akashic Records matrix...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* CORE MODE TAB CONTROLLER */}
            <div className="flex flex-wrap gap-1 bg-stone-950/80 border border-white/5 p-1 rounded-2xl">
              <button 
                onClick={() => { setActiveModalTab('text'); try{soundEngine.click();}catch(e){ /* ignore */ } }}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${activeModalTab === 'text' ? 'bg-stone-900 border border-white/10 text-white shadow-xl' : 'text-stone-500 hover:text-stone-300'}`}
              >
                <BookOpen size={13} className={activeModalTab === 'text' ? "text-purple-400" : ""} />
                <span>📖 Description & Lore</span>
              </button>
              
              <button 
                onClick={() => { setActiveModalTab('images'); try{soundEngine.click();}catch(e){ /* ignore */ } }}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${activeModalTab === 'images' ? 'bg-stone-900 border border-white/10 text-white shadow-xl' : 'text-stone-500 hover:text-stone-300'}`}
              >
                <Palette size={13} className={activeModalTab === 'images' ? "text-amber-400" : ""} />
                <span>🎨 Reference Images</span>
              </button>

              <button 
                onClick={() => { setActiveModalTab('video'); try{soundEngine.click();}catch(e){ /* ignore */ } }}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${activeModalTab === 'video' ? 'bg-stone-900 border border-white/10 text-white shadow-xl' : 'text-stone-500 hover:text-stone-300'}`}
              >
                <CirclePlay size={13} className={activeModalTab === 'video' ? "text-emerald-400 animate-pulse" : ""} />
                <span>🎬 Quick Video Lesson</span>
              </button>

              <button 
                onClick={() => { setActiveModalTab('interactive'); try{soundEngine.click();}catch(e){ /* ignore */ } }}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${activeModalTab === 'interactive' ? 'bg-stone-900 border border-white/10 text-white shadow-xl' : 'text-stone-500 hover:text-stone-300'}`}
              >
                <Brain size={13} className={activeModalTab === 'interactive' ? "text-cyan-400 animate-pulse" : ""} />
                <span>🧩 Attunement Quiz</span>
              </button>
            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="min-h-[360px] flex flex-col justify-between">
              
              {/* Tab 1: TEXT DESCRIPTION */}
              {activeModalTab === 'text' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {cleanTitle === 'Birth Chart Guide' ? (
                    <BirthChartGuide />
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-black/35 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden leading-relaxed text-sm text-stone-200 font-light whitespace-pre-wrap">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                        {deepDiveData.detailedAnalysis}
                      </div>

                      {deepDiveData.followUpOptions && deepDiveData.followUpOptions.length > 0 && (
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <h4 className="text-[9px] uppercase tracking-[0.25em] text-purple-400 font-black">Resonant Pathways to Explore Deeper</h4>
                          <div className="flex flex-wrap gap-2">
                             {deepDiveData.followUpOptions.map((option: string) => (
                               <button 
                                 key={option}
                                 onClick={() => handleDeepDiveNext(option)}
                                 className="px-4 py-2 border border-purple-500/20 bg-purple-500/5 hover:bg-purple-900/40 hover:border-purple-500/50 rounded-xl text-xs text-stone-300 hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                               >
                                 {option} →
                               </button>
                             ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: REFERENCE IMAGES (ASTRO schematics & geometry blueprint) */}
              {activeModalTab === 'images' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="md:col-span-2 bg-stone-950/80 border border-white/10 rounded-2xl overflow-hidden p-6 relative flex flex-col justify-center items-center select-none aspect-video">
                    {/* SVG Interactive Holographic Chart Reference */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)]" />
                    <div className="absolute top-2 left-3 font-mono text-[8px] text-stone-500 uppercase tracking-widest">Interactive Blueprint: {cleanTitle}</div>
                    
                    <svg className="w-full max-w-[280px] aspect-square text-amber-500/40 relative z-10" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2, 2" className="animate-spin" style={{ animationDuration: '40s' }} />
                      
                      {/* Dynamic Orbits / Circles */}
                      {((Array.isArray(deepDiveData.imageReference?.svgCircles) ? deepDiveData.imageReference.svgCircles : [
                        { cx: 50, cy: 50, r: 35, opacity: 0.25, dashed: false },
                        { cx: 50, cy: 50, r: 22, opacity: 0.2, dashed: false }
                      ])).map((circle: any, idx: number) => (
                        <circle key={idx} cx={circle?.cx || 50} cy={circle?.cy || 50} r={circle?.r || 20} fill="none" stroke={`rgba(251,191,36,${circle?.opacity || 0.2})`} strokeWidth="0.5" strokeDasharray={circle?.dashed ? "2, 2" : "none"} />
                      ))}
                      
                      {/* Dynamic Triangle Overlays representing alignment aspects */}
                      {((Array.isArray(deepDiveData.imageReference?.svgPolygons) ? deepDiveData.imageReference.svgPolygons : ["50,5 89,72.5 11,72.5", "50,95 11,27.5 89,27.5"])).map((pts: string, idx: number) => (
                        <polygon key={idx} points={typeof pts === 'string' ? pts : "50,5"} fill="none" stroke={idx % 2 === 0 ? "currentColor" : "rgba(168,85,247,0.3)"} strokeWidth="0.25" className="hover:stroke-amber-400 transition-colors cursor-pointer" />
                      ))}

                      {/* Interactive Hotspots / Nodes */}
                      {((Array.isArray(deepDiveData.imageReference?.svgNodes) ? deepDiveData.imageReference.svgNodes : [
                        { id: "I", label: "Crown Node", description: "Channels cosmic information downwards representing maximum potential.", cx: 50, cy: 5, color: "purple" },
                        { id: "II", label: "Spiritual Anchor", description: "Keeps planetary energies grounded in the Earth matrix.", cx: 89, cy: 72.5, color: "amber" },
                        { id: "III", label: "Vibrational Transmuter", description: "The gateway representing active spiritual growth and karma removal.", cx: 11, cy: 72.5, color: "emerald" },
                        { id: "528", label: "Inner Core Point", description: "Solfeggio 528Hz alignment cell governing cells rejuvenation.", cx: 50, cy: 50, color: "cyan" }
                      ])).map((node: any, idx: number) => {
                        if (!node) return null;
                        const strokes: Record<string, string> = {
                          purple: 'stroke-purple-400', amber: 'stroke-amber-400', emerald: 'stroke-emerald-400', cyan: 'stroke-cyan-400'
                        };
                        const fills: Record<string, string> = {
                          purple: 'hover:fill-purple-500', amber: 'hover:fill-amber-500', emerald: 'hover:fill-emerald-500', cyan: 'hover:fill-cyan-500'
                        };
                        const strokeClass = strokes[node.color] || 'stroke-amber-400';
                        const fillClass = fills[node.color] || 'hover:fill-amber-500';

                        return (
                        <g key={idx} className="cursor-pointer" 
                           onMouseEnter={() => setHoveredDiagramNode(`${node.label}: ${node.description}`)}
                           onMouseLeave={() => setHoveredDiagramNode(null)}>
                          <circle cx={node.cx} cy={node.cy} r={node.id === "528" ? 4.5 : 3} 
                                  className={`fill-stone-900 ${strokeClass} ${fillClass} transition-all`} 
                                  strokeWidth="1" />
                          <text x={node.cx} y={node.cy} textAnchor="middle" dominantBaseline="central" fontSize={node.id === "528" ? 4.5 : 3} className={`fill-white font-mono pointer-events-none ${node.id === '528' ? 'font-bold text-cyan-300/80' : ''}`}>{node.id}</text>
                        </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="bg-stone-900/60 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Palette size={14} className="text-amber-400" />
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">Reference Details</h4>
                      </div>
                      <p className="text-stone-300 text-xs font-light leading-relaxed">
                        {hoveredDiagramNode || deepDiveData.imageReference?.description || "Hover over any node on the interactive diagram on the left to reveal celestial reference meanings."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="bg-amber-400/5 border border-amber-500/10 p-3 rounded-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-500/80 shrink-0" />
                        <div className="text-[10px] font-mono text-stone-300 tracking-wide">
                          Interactive learning overlays generated dynamically. High contrast grid maps 100% accurate.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: QUICK VIDEO LESSON (Interactive Simulated Video Deck) */}
              {activeModalTab === 'video' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Glowing custom video console */}
                  <div className="bg-black/75 border border-emerald-500/20 rounded-2xl overflow-hidden p-6 relative">
                    <div className="absolute inset-0 bg-radial-gradient(ellipse_at_top,rgba(16,185,129,0.06)_0%,transparent_80%) pointer-events-none" />
                    
                    {/* VIDEO FRAME HEADER HUD */}
                    <div className="relative z-10 flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isVideoPlaying ? 'bg-red-500 animate-ping' : 'bg-stone-500'}`} />
                        <span className="font-mono text-[9px] text-stone-300 tracking-wider">ASTRONET STREAMING • QUICK LESSON</span>
                      </div>
                      <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">{videoTime}s / 110s</div>
                    </div>

                    {/* INTERACTIVE VIDEO VISUALIZATION SCREEN */}
                    <div className="relative aspect-video max-h-[220px] mx-auto rounded-xl bg-stone-950 border border-white/10 flex items-center justify-center overflow-hidden mb-4">
                      {/* Interactive Pulsing Orbits and Nodes */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {(Array.isArray(currentChapterData.orbitParams) ? currentChapterData.orbitParams : []).map((orbit: any, i: number) => {
                          if (!orbit) return null;
                          const colorsArray = Array.isArray(currentChapterData.colors) ? currentChapterData.colors : ["emerald"];
                          const rawColor = typeof colorsArray[i % colorsArray.length] === 'string' ? colorsArray[i % colorsArray.length] : "emerald";
                          const isHex = rawColor.startsWith('#');
                          const color500 = isHex ? rawColor : `var(--color-${rawColor}-500, #10b981)`;
                          const color400 = isHex ? rawColor : `var(--color-${rawColor}-400, #34d399)`;
                          return (
                            <div key={i} className={`absolute border rounded-full transition-transform duration-1000 ${isVideoPlaying ? 'animate-spin' : ''}`} 
                                 style={{ 
                                   width: `${orbit.size * 2}px`, 
                                   height: `${orbit.size * 2}px`, 
                                   animationDuration: `${orbit.speed}s`,
                                   animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                                   borderColor: isHex ? `${rawColor}33` : `color-mix(in srgb, ${color500} 20%, transparent)`
                                 }}>
                              <div className="absolute top-0 left-1/2 rounded-full" 
                                   style={{
                                     width: `${orbit.dotSize * 2}px`,
                                     height: `${orbit.dotSize * 2}px`,
                                     marginLeft: `-${orbit.dotSize}px`,
                                     marginTop: `-${orbit.dotSize}px`,
                                     backgroundColor: color400,
                                     boxShadow: `0 0 10px ${color400}`
                                   }} />
                            </div>
                          );
                        })}
                        
                        <div className="bg-purple-500/20 animate-pulse rounded-full absolute flex items-center justify-center border shadow-lg"
                             style={{ 
                               width: '48px', height: '48px', 
                               backgroundColor: typeof currentChapterData?.colors?.[0] === 'string' && currentChapterData.colors[0].startsWith('#') ? `${currentChapterData.colors[0]}33` : `color-mix(in srgb, var(--color-${currentChapterData?.colors?.[0] || 'emerald'}-500, #10b981) 20%, transparent)`, 
                               borderColor: typeof currentChapterData?.colors?.[0] === 'string' && currentChapterData.colors[0].startsWith('#') ? currentChapterData.colors[0] : `var(--color-${currentChapterData?.colors?.[0] || 'emerald'}-400, #34d399)`,
                               boxShadow: `0 0 20px ${typeof currentChapterData?.colors?.[0] === 'string' && currentChapterData.colors[0].startsWith('#') ? currentChapterData.colors[0] + '66' : `var(--color-${currentChapterData?.colors?.[0] || 'emerald'}-500, #10b981)`}`
                             }}>
                          {(() => {
                            const IconComponent = {Sparkles, Moon, Sun, Star, Hexagon, Zap, Radio}[currentChapterData.centerIcon as "Sparkles"|"Moon"|"Sun"|"Star"|"Hexagon"|"Zap"|"Radio"] || Sparkles;
                            return <IconComponent className="w-5 h-5" style={{color: typeof currentChapterData?.colors?.[0] === 'string' && currentChapterData.colors[0].startsWith('#') ? '#fff' : `var(--color-${currentChapterData?.colors?.[0] || 'emerald'}-200, #fff)`}} />;
                          })()}
                        </div>
                      </div>

                      {/* Decibel/Audio visualization lines */}
                      <div className="absolute bottom-3 right-3 flex items-end gap-1 h-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-emerald-400 w-1 rounded-sm transition-all duration-150" 
                            style={{ 
                              height: isVideoPlaying ? `${Math.floor(Math.random() * 24) + 6}px` : '4px',
                              animationDelay: `${i * 0.1}s` 
                            }} 
                          />
                        ))}
                      </div>

                      {/* VIDEO STATUS BANNER */}
                      <div className="absolute top-3 left-3 bg-stone-900/95 border border-white/10 px-2.5 py-1 rounded-md text-[8px] tracking-wider font-mono text-stone-300">
                        {currentChapterData.name.toUpperCase()}
                      </div>
                    </div>

                    {/* LIVE INTERACTIVE STREAM CAPTIONS / LESSON */}
                    <div className="bg-stone-900/90 border border-white/5 rounded-xl p-4 min-h-[75px] flex items-center">
                      <p className="text-stone-100 text-xs text-center w-full italic font-light tracking-wide leading-relaxed">
                        &ldquo;{currentChapterData.caption}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* CUSTOM VIDEO CONTROLLER HUD */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-stone-900 p-4 rounded-xl border border-white/5">
                    {/* Chapter list / quick jumping */}
                    <div className="flex gap-1">
                      {chapters.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => {
                            setVideoChapter(ch.id);
                            setVideoTime(ch.start);
                            try{soundEngine.click();}catch(e){ /* ignore */ }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-wider transition-all border ${videoChapter === ch.id ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 font-bold' : 'bg-transparent border-white/10 text-stone-400 hover:text-white'}`}
                        >
                          Ch {ch.id}
                        </button>
                      ))}
                    </div>

                    {/* Main action triggers */}
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setIsVideoPlaying(!isVideoPlaying);
                          try{soundEngine.click();}catch(e){ /* ignore safe */ }
                        }}
                        className={`p-3 rounded-full border transition-all ${isVideoPlaying ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/20 border-emerald-500/45 text-emerald-300'}`}
                      >
                        {isVideoPlaying ? (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        ) : (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19" /></svg>
                        )}
                      </button>

                      <div className="text-xs text-stone-400">
                        Lesson speed:
                        <select 
                          value={interactivePlaybackSpeed}
                          onChange={(e) => setInteractivePlaybackSpeed(Number(e.target.value))}
                          className="ml-1 bg-stone-950 border border-white/10 rounded-md px-1.5 py-0.5 text-[10px] text-white"
                        >
                          <option value="0.5">0.5x</option>
                          <option value="1">1.0x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2.0x</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: INTERACTIVE LEARNING QUIZ (Attunement and certification) */}
              {activeModalTab === 'interactive' && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {!quizCompleted ? (
                    <div className="bg-stone-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                        <span className="font-mono text-[9px] text-stone-400">COSMIC ASSESSMENT PORTAL</span>
                        <span className="font-mono text-[9px] text-cyan-400">QUESTION {currentQuizQuestion + 1} OF {quizQuestions.length}</span>
                      </div>

                      <h3 className="text-sm md:text-base font-light text-white mb-6 leading-relaxed">
                        {quizQuestions[currentQuizQuestion].q}
                      </h3>

                      <div className="space-y-2.5">
                        {quizQuestions[currentQuizQuestion].options.map((option, idx) => {
                          const isCorrect = idx === quizQuestions[currentQuizQuestion].correct;
                          const isSelected = idx === selectedOption;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(idx)}
                              disabled={quizAnswered}
                              className={`w-full text-left p-4 rounded-xl text-xs flex justify-between items-center transition-all border ${
                                quizAnswered
                                  ? isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200'
                                    : isSelected
                                      ? 'bg-red-500/10 border-red-500 text-red-200'
                                      : 'bg-black/30 border-white/5 text-stone-500'
                                  : 'bg-stone-950/40 hover:bg-stone-950/80 border-white/5 text-stone-300 hover:text-white hover:border-cyan-500/40'
                              }`}
                            >
                              <span>{option}</span>
                              <div className="shrink-0 ml-2">
                                {quizAnswered && isCorrect && <span className="text-emerald-400 font-bold">✓</span>}
                                {quizAnswered && isSelected && !isCorrect && <span className="text-red-400 font-bold">✗</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {quizAnswered && (
                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-stone-300 font-light leading-relaxed animate-fade-in">
                          {quizQuestions[currentQuizQuestion].expl}
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleNextQuiz}
                          disabled={!quizAnswered}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            quizAnswered 
                              ? 'bg-cyan-500 hover:bg-cyan-600 text-stone-950 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          {currentQuizQuestion === quizQuestions.length - 1 ? "Complete Verification" : "Next Aspect"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-950 border border-white/10 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
                      {/* Decorative star lines */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-amber-500" />
                      
                      <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Activity className="w-8 h-8 text-cyan-400" />
                      </div>

                      <h3 className="text-2xl font-light text-white tracking-wide">Attunement Verified!</h3>
                      <div className="max-w-md mx-auto">
                        <p className="text-stone-300 text-xs font-light leading-relaxed">
                          Your current cognitive resonance with <span className="font-semibold text-cyan-300">{cleanTitle}</span> has been analyzed and processed safely.
                        </p>
                      </div>

                      <div className="inline-block px-5 py-3 rounded-2xl bg-white/5 border border-white/5 font-mono text-sm">
                        <div className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">Cognitive Score</div>
                        <div className="text-2xl font-black text-emerald-400">{quizScore} / {quizQuestions.length} Aspects</div>
                      </div>

                      {nodeAttuned ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl max-w-sm mx-auto text-[11px] font-mono text-emerald-300"
                        >
                          🌌 528Hz WAVE ALIGNED SUCCESSFULLY • PORTAL STABILIZED
                        </motion.div>
                      ) : (
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={handleAttuneNode}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs uppercase tracking-widest font-black transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                          >
                            Harmonize Portal
                          </button>
                          <button
                            onClick={handleResetQuiz}
                            className="px-4 py-3 bg-transparent border border-white/20 hover:border-white text-stone-400 hover:text-white rounded-xl text-xs uppercase tracking-widest font-bold transition-all"
                          >
                            Re-Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

            </div>

          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- NEW MOCK OPASTRO TERMINAL ---
const MockOpastroTerminal = ({ sign = "Aries", period = "daily" }: { sign?: string, period?: string }) => {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const output = [
      `$ opastro horoscope --period ${period} --sign ${sign}`,
      `[INFO] Connecting to dakidarts/opastro compute engine...`,
      `[SUCCESS] Ephemeris data synced for ${today}`,
      `[COMPUTING] Calculating transits for ${sign}...`,
      `[RESULT] Found 3 major aspects affecting current house arrangement.`,
      `------------------------------------------------------------`,
      `SYNTHESIS: Your communicative flow is heightened by a Mercury trine.`,
      `ALERT: Solar intensity at 8.4 GEV. Dynamic shielding recommended.`,
      `------------------------------------------------------------`,
      `READY.`
    ];
    
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < output.length) {
        setLines(prev => [...prev, output[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [sign, period]);

  return (
    <div className="bg-black border border-emerald-500/30 rounded-2xl p-6 font-mono text-[10px] text-emerald-400/80 shadow-[0_0_40px_rgba(16,185,129,0.1)] mb-8 overflow-hidden relative">
      <div className="absolute top-3 right-4 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500/40" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
        <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
      </div>
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="opacity-30">{i+1}</span>
            <span>{line}</span>
          </div>
        ))}
        {lines.length < 10 && <div className="w-2 h-3 bg-emerald-400 animate-pulse ml-6" />}
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent opacity-20" />
    </div>
  );
};

export const Dashboard = ({ data, onGenerate, isLoading, activeTab, setActiveTab, user, onSignIn, onSignOut, loadedInputs, profileConfig, onUpdateProfile, onPresentationRequest, externalDeepDive, onClearExternalDeepDive, vortexMode, setVortexMode }: DashboardProps) => {
  // --- LOCAL COMPONENT STATE ---
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offset);
    setDate(local.toISOString().split('T')[0]);
    setTime(local.toISOString().split('T')[1].slice(0, 5));
  }, []);
  const [location, setLocation] = useState('');
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<any>(null);
  const [layoutMode, setLayoutMode] = useState<'minimized' | 'half' | 'full'>('half');
  const dragControls = useDragControls();
  const [isHoloDrawerOpen, setIsHoloDrawerOpen] = useState(false);
  const [holoDrawerTool, setHoloDrawerTool] = useState<'gematria' | 'chakra' | 'karma'>('gematria');
  const [isWidgetGalleryOpen, setIsWidgetGalleryOpen] = useState(false);
  const [activeWorkspaceWidgets, setActiveWorkspaceWidgets] = useState<Array<{
    id: string;
    type: string;
    componentName: string;
    data: any;
    position?: { x: number; y: number };
  }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('astral_workspace_widgets');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('astral_workspace_widgets', JSON.stringify(activeWorkspaceWidgets));
    }
  }, [activeWorkspaceWidgets]);

  const handleSpawnWidget = (widgetId: string, componentName: string, defaultData: any) => {
    soundEngine.charge();
    const existing = activeWorkspaceWidgets.some(w => w.id === widgetId);
    if (!existing) {
      setActiveWorkspaceWidgets(prev => [
        ...prev,
        {
          id: widgetId,
          type: 'widget',
          componentName,
          data: defaultData,
          position: { x: Math.random() * 80 + 20, y: Math.random() * 80 + 20 }
        }
      ]);
    } else {
      setActiveWorkspaceWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, position: { x: Math.random() * 80 + 20, y: Math.random() * 80 + 30 } } : w));
    }
  };

  const handleRemoveWorkspaceWidget = (widgetId: string) => {
    soundEngine.deactivate();
    setActiveWorkspaceWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const [deepDiveData, setDeepDiveData] = useState<{ 
    title: string; 
    detailedAnalysis: string; 
    followUpOptions: string[]; 
    type: 'general' | 'timeline';
    originalEvent?: any;
  } | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isHigherMindSettingsOpen, setIsHigherMindSettingsOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>();
  const [selectedRecipientProfile, setSelectedRecipientProfile] = useState<UserProfileConfig | undefined>();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectUser = async (userId: string) => {
    setSelectedRecipientId(userId);
    setActiveTab('messages');
    try {
      const profile = await getAstralProfile(userId);
      if (profile) {
        setSelectedRecipientProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch recipient profile:", error);
    }
  };

  useEffect(() => {
    if (externalDeepDive) {
      handleGeneralDeepDive(externalDeepDive.title, externalDeepDive.content);
      onClearExternalDeepDive?.();
    }
  }, [externalDeepDive]);

  // --- SPEECH SYNTHESIS ENGINE ---
  const handleReadOutLoud = (text: string) => {
    console.log("Triggered read out loud:", text ? text.substring(0, 50) + "..." : "No text");
    if ('speechSynthesis' in window) {
      if (isReading || window.speechSynthesis.speaking) {
        console.log("Cancelling existing speech...");
        (window as any)._speechCancelled = true;
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
      }

      (window as any)._speechCancelled = false;

      // Clean the text from markdown, etc.
      let cleanText = text || '';
      try {
        if (typeof text !== 'string') {
           cleanText = JSON.stringify(text);
        }
      } catch(e) {
        console.error("Text stringify error:", e);
      }
      
      cleanText = cleanText.replace(/[#*_`]/g, '').replace(/<[^>]*>?/gm, '').trim();
      if (!cleanText) {
          console.warn("No text left to speak after cleaning.");
          return;
      }
      
      // Split into sentences for better reliability to avoid Chrome 15-second cutoff
      // This regex captures chunks up to punctuation or new lines, including the punctuation
      const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
      let sentences: string[] = cleanText.match(sentenceRegex) || [];
      
      if (!sentences || sentences.length === 0) {
          sentences = [cleanText];
      }
      
      // Filter out empty or whitespace-only sentences
      sentences = sentences.map(s => s.trim()).filter(s => s.length > 0);
      
      console.log("Speaking chunks:", sentences);
      
      let currentSentence = 0;
      setIsReading(true);

      const speakNext = () => {
         if (currentSentence >= sentences!.length || (window as any)._speechCancelled) {
             console.log("Finished reading chunks.");
             setIsReading(false);
             return;
         }
         
         const chunk = sentences![currentSentence];
         console.log(`Speaking chunk ${currentSentence + 1}/${sentences!.length}:`, chunk);
         
         const utterance = new SpeechSynthesisUtterance(chunk);
         (window as any)._currentUtterance = utterance; // Prevent garbage collection
         
         const voices = window.speechSynthesis.getVoices();
         const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha') || v.name.includes('Karen')) || voices[0];
         if (preferredVoice) utterance.voice = preferredVoice;
         
         utterance.rate = 0.95; // Slightly slower for "wisdom" effect
         utterance.pitch = 1.0;
         
         utterance.onend = () => {
             console.log("Chunk ended.");
             currentSentence++;
             speakNext();
         };
         
         utterance.onerror = (e) => {
             console.error("Speech synthesis error on chunk", currentSentence, e);
             // Instead of failing completely, try to skip to the next chunk
             currentSentence++;
             speakNext();
         };
         
         window.speechSynthesis.speak(utterance);
      };
      
      // Cancel any ongoing speech and start
      window.speechSynthesis.cancel();
      setTimeout(speakNext, 50);
      
    } else {
      alert("Speech synthesis is not supported in this browser.");
    }
  };

  // Moved outside Dashboard to prevent unnecessary unmounts
  const BoundResearchBox = (props: any) => {
    const onResearch = props.onResearch || (() => handleGeneralDeepDive(props.title, props.content));
    return (
      <ResearchBox 
        {...props} 
        isReading={isReading} 
        handleReadOutLoud={handleReadOutLoud} 
        handleSaveToVault={handleSaveToVault} 
        handleGeneralDeepDive={onResearch} 
      />
    );
  };

  useEffect(() => {
    // Stop reading when switching tabs
    window.speechSynthesis.cancel();
    setIsReading(false);
  }, [activeTab]);

  useEffect(() => {
    // Load voices
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    // Un-minimize when a tab is selected
    setLayoutMode('half');
  }, [activeTab]);

  // --- DEEP DIVE & RESEARCH LOGIC ---
  const handleTimelineEventSelect = async (event: any) => {
    if (!data) return;
    setSelectedTimelineEvent(event);
    setIsDeepDiveLoading(true);
    setDeepDiveData({ 
      title: `Life Event ${event.year}: ${event.highlight}`, 
      detailedAnalysis: '', 
      followUpOptions: [],
      type: 'timeline',
      originalEvent: event
    });
    try {
      const depthData = await fetchTimelineDepth(event, data);
      setDeepDiveData({
        title: `Life Event ${event.year}: ${event.highlight}`,
        detailedAnalysis: depthData.detailedAnalysis,
        followUpOptions: depthData.followUpOptions,
        type: 'timeline',
        originalEvent: event
      });
    } catch (error: any) {
      console.error(error);
      setDeepDiveData({
        title: `Life Event ${event.year}: ${event.highlight}`,
        detailedAnalysis: "An integration error occurred while consulting the Records. Please try again. Error: " + (error.message || String(error)),
        followUpOptions: [],
        type: 'timeline',
        originalEvent: event
      });
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  const handleGeneralDeepDive = async (title: string, content: string) => {
    if (!data) return;
    setIsDeepDiveLoading(true);
    setDeepDiveData({ title, detailedAnalysis: '', followUpOptions: [], type: 'general' }); // Set title immediately for UI
    try {
      const depthData = await fetchGeneralDeepDive(title, content, data);
      setDeepDiveData({
        title,
        detailedAnalysis: depthData.detailedAnalysis,
        followUpOptions: depthData.followUpOptions,
        type: 'general'
      });
    } catch (error: any) {
      console.error(error);
      setDeepDiveData({
        title,
        detailedAnalysis: "An integration error occurred while consulting the Records. Please try again. Error: " + (error.message || String(error)),
        followUpOptions: [],
        type: 'general'
      });
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  const handleSaveToVault = (title: string, content: string, category: string = 'General', tags: string[] = []) => {
    if (!profileConfig) return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      category,
      timestamp: Date.now(),
      tags
    };
    const currentVault = profileConfig.researchVault || [];
    onUpdateProfile({
      ...profileConfig,
      researchVault: [...currentVault, newItem]
    });
  };

  const handleDeepDiveNext = async (option: string) => {
    if (!data || !deepDiveData) return;
    setIsDeepDiveLoading(true);
    try {
      let depthData;
      const currentTitle = deepDiveData.title;
      if (deepDiveData.type === 'timeline' && deepDiveData.originalEvent) {
        depthData = await fetchTimelineDeepDiveOption(deepDiveData.originalEvent, option, data);
      } else {
        depthData = await fetchGeneralDeepDive(currentTitle + ": " + option, option, data);
      }
      
      setDeepDiveData({
        ...deepDiveData,
        title: option, // Update title to reflect the specific research topic
        detailedAnalysis: depthData.detailedAnalysis,
        followUpOptions: depthData.followUpOptions
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  const { activeTheme, isProjected, setIsProjected, aiModules, userData, addProfileWidget, removeProfileWidget } = useHigherMind();
  const themeColor = activeTheme.primaryColor;

  // Auto Pilot Engine
  useEffect(() => {
    const autoPilot = aiModules.find(m => m.id === 'auto_pilot')?.enabled;
    if (autoPilot && data) {
      const tabsToCycle = ['avatar_matrix', 'torus', 'soul_path', 'brain', 'synthesis', 'flower_of_life', 'destiny_matrix', 'celestial_dna', 'harmonics', 'quantum_fluid'];
      let currentIdx = tabsToCycle.indexOf(activeTab);
      
      const interval = setInterval(() => {
        currentIdx = (currentIdx + 1) % tabsToCycle.length;
        setActiveTab(tabsToCycle[currentIdx] as any);
      }, 15000); // cycle every 15 seconds
      
      return () => clearInterval(interval);
    }
  }, [aiModules, activeTab, data]);

  // Intuitive Autonomous Engine
  useEffect(() => {
    const intuitive = aiModules.find(m => m.id === 'intuitive_autonomous')?.enabled;
    if (intuitive && data) {
      // Periodically trigger a random deep insight popup or subtle notification
      const interval = setInterval(() => {
        handleGeneralDeepDive('Autonomous Insight Generated', 'A spontaneous cosmic synchronization was detected in your background matrix.');
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
    }
  }, [aiModules, data]);

  useEffect(() => {
    if (loadedInputs) {
      setName(loadedInputs.name || '');
      setDate(loadedInputs.date || '');
      setTime(loadedInputs.time || '');
      setLocation(loadedInputs.location || '');
    }
  }, [loadedInputs]);

  // --- MAIN RENDER LOOP ---
  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-8 flex flex-col justify-between overflow-hidden">
      {/* Global Utility Overlays */}
      <ActionMenu 
        user={user} 
        data={data} 
        onSignIn={onSignIn} 
        onSignOut={onSignOut} 
        onEditProfile={() => setIsProfileModalOpen(true)} 
        profileConfig={profileConfig} 
        layoutMode={layoutMode}
        onSetLayoutMode={setLayoutMode}
      />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profileConfig={profileConfig || {} as UserProfileConfig} onUpdateProfile={onUpdateProfile} loadedInputs={loadedInputs} isReading={isReading} handleReadOutLoud={handleReadOutLoud} />
      <React.Suspense fallback={null}>
        <VoiceCommander 
          setActiveTab={setActiveTab} 
          openHoloDrawer={(tool) => {
            if (tool === null) {
              setIsHoloDrawerOpen(false);
            } else {
              setHoloDrawerTool(tool);
              setIsHoloDrawerOpen(true);
            }
          }}
        />
      </React.Suspense>

      <HoloSideDrawer 
        isOpen={isHoloDrawerOpen} 
        onClose={() => setIsHoloDrawerOpen(false)} 
        data={data} 
        activeTool={holoDrawerTool}
        setActiveTool={setHoloDrawerTool}
      />

      <WidgetGallerySidebar
        isOpen={isWidgetGalleryOpen}
        onClose={() => setIsWidgetGalleryOpen(false)}
        onSpawnWidget={handleSpawnWidget}
        onPinToProfile={(id, type, componentName, wdata) => {
          addProfileWidget({ id, type, componentName, data: wdata });
        }}
        profileWidgets={userData?.profileWidgets || []}
        onRemoveProfileWidget={(id) => {
          removeProfileWidget(id);
        }}
        activeWorkspaceWidgets={activeWorkspaceWidgets}
        onRemoveWorkspaceWidget={handleRemoveWorkspaceWidget}
      />

      {/* Brand Header */}
      <header className="flex justify-between items-center z-10 pointer-events-auto">
        <h1 className="text-3xl font-light text-white tracking-widest drop-shadow-lg flex items-center gap-3">
          <Hexagon style={{ color: themeColor }} />
          HIGHER 🧠 MIND
        </h1>
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => {
              soundEngine.neuralClick();
              setIsWidgetGalleryOpen(!isWidgetGalleryOpen);
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all group ${
              isWidgetGalleryOpen 
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                : "bg-white/5 border-white/10 text-stone-400 hover:bg-white/10"
            }`}
          >
            <LayoutGrid className={`w-4 h-4 ${isWidgetGalleryOpen ? "text-amber-400 animate-pulse" : "text-stone-500"}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:inline">Widgets Deck</span>
          </button>
          <button 
            onClick={() => {
              soundEngine.neuralClick();
              setIsHoloDrawerOpen(!isHoloDrawerOpen);
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all group ${
              isHoloDrawerOpen 
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                : "bg-white/5 border-white/10 text-stone-400 hover:bg-white/10"
            }`}
          >
            <Activity className={`w-4 h-4 ${isHoloDrawerOpen ? "text-purple-400 animate-pulse" : "text-stone-500"}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:inline">Holo-Drawer</span>
          </button>
          <button 
            onClick={() => {
              soundEngine.neuralClick();
              setIsProjected(!isProjected);
            }}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all group ${
              isProjected 
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                : "bg-white/5 border-white/10 text-stone-400 hover:bg-white/10"
            }`}
          >
            <Box className={`w-4 h-4 ${isProjected ? "text-emerald-400 animate-pulse" : "text-stone-500"}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:inline">Spatial Proj</span>
          </button>
          <button 
            onClick={() => setIsHigherMindSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all group"
          >
            <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest text-purple-300 font-bold hidden sm:inline">AI Interface</span>
          </button>
          <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-mono hidden md:block" suppressHydrationWarning>
              {currentTime ? `${currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} - ${currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}` : 'Calibrating Temporal Displacement...'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full z-10 my-2 md:my-8 pb-32 sm:pb-0 overflow-y-auto no-scrollbar pointer-events-none">
        {!data ? (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 p-5 md:p-8 rounded-3xl w-full max-w-md shadow-2xl shrink-0 mx-auto mt-4 sm:mt-10"
          >
            <h2 className="text-2xl text-white mb-2 font-medium tracking-wide flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Initialize Reading
            </h2>
            <p className="text-stone-300 text-sm mb-8 leading-relaxed">Enter your birth details to generate your immersive cosmic consciousness chart, integrating astrology, numerology, and mathematically generated visual alignments.</p>
            
            <form onSubmit={(e) => { 
  e.preventDefault(); 
  soundEngine.scan();
  onGenerate(name, date, time, location); 
}} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Entity Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-light" placeholder="e.g. John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Birth Date</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-light" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Birth Time</label>
                  <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-light" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1">Location</label>
                <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-light" placeholder="e.g. New York, NY" />
              </div>
              
              <button disabled={isLoading} type="submit" className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-4 font-medium tracking-wide shadow-lg shadow-purple-900/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                {isLoading ? <span className="animate-pulse">Connecting to Matrix...</span> : <>Initialize Hologram <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /></>}
              </button>
            </form>
          </motion.div>
        ) : layoutMode === 'minimized' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            drag
            dragMomentum={false}
            className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-3 shadow-2xl cursor-pointer hover:bg-white/10 transition-colors mx-auto sm:mx-0 sm:ml-0 w-max"
            onClick={() => setLayoutMode('half')}
            title="Expand Workspace"
          >
            <Maximize2 className="w-6 h-6 text-white" />
          </motion.div>
        ) : isProjected ? (
          <motion.div 
            key="spatial-mode-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full pointer-events-auto relative"
          >
            <NeuralBrainSection data={data} setActiveTab={setActiveTab} projectedTab={activeTab} />
            
            {/* Minimal floating tab bar in Spatial Mode */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex border border-white/10 p-1.5 gap-2 overflow-x-auto no-scrollbar max-w-[90vw] flex-nowrap bg-black/40 backdrop-blur-xl rounded-2xl z-[100] shadow-2xl">
                <Tab active={activeTab === 'identity'} tabId="identity" onClick={() => setActiveTab('identity')} icon={<UserIcon className="w-4 h-4"/>}>Identity</Tab>
                <Tab active={activeTab === 'numbers'} tabId="numbers" onClick={() => setActiveTab('numbers')} icon={<Fingerprint className="w-4 h-4"/>}>Numbers</Tab>
                <Tab active={activeTab === 'celestial_dna'} tabId="celestial_dna" onClick={() => setActiveTab('celestial_dna')} icon={<Hexagon className="w-4 h-4"/>}>DNA</Tab>
                <Tab active={activeTab === 'kabbalah'} tabId="kabbalah" onClick={() => setActiveTab('kabbalah')} icon={<Hexagon className="w-4 h-4"/>}>Mysticism</Tab>
                <Tab active={activeTab === 'chinese_zodiac'} tabId="chinese_zodiac" onClick={() => setActiveTab('chinese_zodiac')} icon={<Flame className="w-4 h-4 text-red-500 animate-pulse"/>}>Dragon</Tab>
                <Tab active={activeTab === 'tarot'} tabId="tarot" onClick={() => setActiveTab('tarot')} icon={<Sparkles className="w-4 h-4 text-pink-400 animate-pulse"/>}>Tarot</Tab>
                <Tab active={activeTab === 'freemason33'} tabId="freemason33" onClick={() => setActiveTab('freemason33')} icon={<Sparkles className="w-4 h-4 text-amber-400 animate-pulse"/>}>Masonic</Tab>
                <Tab active={activeTab === 'brain'} tabId="brain" onClick={() => setActiveTab('brain')} icon={<Brain className="w-4 h-4"/>}>Core</Tab>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            className={`pointer-events-auto resize min-w-[320px] min-h-[400px] flex flex-col overflow-hidden relative transition-[background,border] duration-500 ${layoutMode === 'full' ? 'w-full max-w-[calc(100vw-2rem)] md:max-w-7xl h-[95vh] mx-auto' : 'w-full max-w-xl h-[80vh] mx-auto sm:mx-0 sm:ml-0'} ${
              activeTheme.cardBg
            } ${
              activeTheme.fontFamily
            } ${
              activeTheme.glowStyle
            } ${
              activeTheme.effects.largeFont ? "text-lg md:text-xl font-medium" : "text-stone-300"
            } ${
              activeTheme.borderStyle === 'double_gold' ? 'border-double border-4 border-amber-500/30 font-serif' : 
              activeTheme.borderStyle === 'scanline' ? 'border border-green-500/30 font-mono' : 
              activeTheme.borderStyle === 'neon' ? 'border border-fuchsia-500/20 font-sans' : 'border border-white/10 font-sans'
            } ${
              activeTheme.borderStyle === 'glass' ? 'rounded-3xl shadow-2xl' : 'rounded-none'
            }`}
          >
            {/* --- PREMIUM THEMATIC ACCENTS & INTERACTIVE CORE OVERLAYS --- */}
            
            {/* A: Retro Terminal Overlay */}
            {activeTheme.effects.terminalTech && (
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[99] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
            )}

            {/* B: Interactive Node Resonance Panel */}
            {activeTheme.effects.interactive && (
              <div className="bg-sky-500/5 border-b border-sky-500/15 p-3 flex items-center justify-between gap-4 select-none shrink-0 text-sky-400 z-10">
                <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  <span>Interactive Resonance Tuning</span>
                </div>
                <div className="flex gap-4 items-center flex-1 justify-end">
                  <label className="text-[8px] uppercase tracking-widest text-sky-500/80 font-mono">Astral Sync:</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    defaultValue="65" 
                    className="w-20 md:w-28 accent-sky-500 bg-sky-950/40 h-1 outline-none rounded-full cursor-col-resize hover:accent-sky-400" 
                    onChange={() => soundEngine.tick()}
                  />
                </div>
              </div>
            )}

            {/* C: Modular Draggable HUD */}
            {activeTheme.effects.dragAndDrop && (
              <div className="bg-indigo-500/5 border-b border-indigo-500/10 p-3 flex items-center justify-between shrink-0 text-indigo-400 z-10">
                <div className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-wider font-bold">
                  <span className="w-2 h-2 rounded bg-indigo-500 animate-pulse" />
                  <span>Draggable Grid Workspace</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-indigo-300">
                  Customizable Drag
                </span>
              </div>
            )}

            {/* D: Solfeggio Micro Sound visualizer */}
            {activeTheme.effects.solfeggio && (
              <div className="bg-amber-500/5 border-b border-amber-500/10 p-3 flex items-center justify-between shrink-0 text-amber-500 z-10">
                <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-wider font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Solfeggio: <strong className="text-pink-400 font-mono">528 Hz</strong></span>
                </div>
                <div className="flex gap-1 h-3 items-end">
                  <span className="w-0.5 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-0.5 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
                </div>
              </div>
            )}

            {/* E: Antique Alchemy Seals */}
            {activeTheme.effects.ancientSymbolic && (
              <div className="bg-stone-900/40 border-b border-amber-900/30 p-2 text-center text-[10px] font-serif uppercase tracking-[0.2em] italic text-amber-500/60 font-bold shrink-0 z-10">
                ☉ Hermetic Synthesis Portal ☽
              </div>
            )}

            {/* F: Dynamic Kinetic Orbits elements */}
            {activeTheme.effects.animated && (
              <div className="absolute top-0 right-10 w-24 h-24 rounded-full border border-pink-500/5 pointer-events-none animate-spin z-10" style={{ animationDuration: '30s' }}>
                <div className="absolute top-0 left-12 w-1.5 h-1.5 rounded-full bg-cyan-400/60 blur-[1px]" />
                <div className="absolute bottom-12 left-0 w-1 h-1 rounded-full bg-pink-400/60 blur-[1px]" />
              </div>
            )}

            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 cursor-grab active:cursor-grabbing p-1 opacity-50 hover:opacity-100 transition-opacity" onPointerDown={(e) => dragControls.start(e)} title="Drag to move">
              <GripHorizontal className="w-5 h-5 text-white" />
            </div>

            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={() => setLayoutMode(layoutMode === 'full' ? 'half' : 'full')}
                className="bg-black/50 hover:bg-white/10 p-2 rounded-full border border-white/10 text-stone-400 hover:text-white transition-colors"
                title={layoutMode === 'full' ? 'Exit Full Screen' : 'Full Screen'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setLayoutMode('minimized')}
                className="bg-black/50 hover:bg-white/10 p-2 rounded-full border border-white/10 text-stone-400 hover:text-white transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex border-b border-white/10 p-2 gap-2 overflow-x-auto no-scrollbar pr-14 flex-nowrap shrink-0">
              <Tab active={activeTab === 'astraea'} tabId="astraea" onClick={() => setActiveTab('astraea')} icon={<Moon className="w-4 h-4 text-pink-400 animate-pulse"/>}>Astraea Oracle</Tab>
              <Tab active={activeTab === 'avatar_matrix'} tabId="avatar_matrix" onClick={() => setActiveTab('avatar_matrix')} icon={<UserIcon className="w-4 h-4 text-emerald-400 animate-pulse"/>}>Avatar Core Summary</Tab>
              <Tab active={activeTab === 'identity'} tabId="identity" onClick={() => setActiveTab('identity')} icon={<UserIcon className="w-4 h-4"/>}>My Identity</Tab>
              <Tab active={activeTab === 'holographic_profile'} tabId="holographic_profile" onClick={() => setActiveTab('holographic_profile')} icon={<Sparkles className="w-4 h-4 text-purple-400"/>}>Holo-Profile</Tab>
              <Tab active={activeTab === 'egyptian'} tabId="egyptian" onClick={() => setActiveTab('egyptian')} icon={<Triangle className="w-4 h-4 text-yellow-500"/>}>Egyptian Matrix</Tab>
              <Tab active={activeTab === 'notebook'} tabId="notebook" onClick={() => setActiveTab('notebook')} icon={<LibraryBig className="w-4 h-4 text-indigo-400"/>}>Holo-Notebook</Tab>
              <Tab active={activeTab === 'synaptic_web'} tabId="synaptic_web" onClick={() => setActiveTab('synaptic_web')} icon={<Network className="w-4 h-4 text-emerald-400"/>}>Synaptic Web</Tab>
              <Tab active={activeTab === 'cosmic_canvas'} tabId="cosmic_canvas" onClick={() => setActiveTab('cosmic_canvas')} icon={<Globe className="w-4 h-4 text-rose-400"/>}>Cosmic Canvas</Tab>
              <Tab active={activeTab === 'past_life_echoes'} tabId="past_life_echoes" onClick={() => setActiveTab('past_life_echoes')} icon={<History className="w-4 h-4 text-fuchsia-400"/>}>Past Life Echoes</Tab>
              <Tab active={activeTab === 'star_chart'} tabId="star_chart" onClick={() => setActiveTab('star_chart')} icon={<Map className="w-4 h-4 text-teal-400"/>}>Star Chart</Tab>
              <Tab active={activeTab === 'torus'} tabId="torus" onClick={() => setActiveTab('torus')} icon={<Activity className="w-4 h-4"/>}>Soul Blueprint</Tab>
              <Tab active={activeTab === 'soul_path'} tabId="soul_path" onClick={() => setActiveTab('soul_path')} icon={<Compass className="w-4 h-4"/>}>Soul Path</Tab>
              <Tab active={activeTab === 'brain'} tabId="brain" onClick={() => setActiveTab('brain')} icon={<Brain className="w-4 h-4"/>}>Neural Core</Tab>
              <Tab active={activeTab === 'celestial_dna'} tabId="celestial_dna" onClick={() => setActiveTab('celestial_dna')} icon={<Hexagon className="w-4 h-4"/>}>Celestial DNA</Tab>
              <Tab active={activeTab === 'numbers'} tabId="numbers" onClick={() => setActiveTab('numbers')} icon={<Fingerprint className="w-4 h-4"/>}>Numerology</Tab>
              <Tab active={activeTab === 'kabbalah'} tabId="kabbalah" onClick={() => setActiveTab('kabbalah')} icon={<Hexagon className="w-4 h-4"/>}>Mysticism</Tab>
              <Tab active={activeTab === 'kabbalistic_numerology'} tabId="kabbalistic_numerology" onClick={() => setActiveTab('kabbalistic_numerology')} icon={<Network className="w-4 h-4"/>}>Kabbalistic Numerology</Tab>
              <Tab active={activeTab === 'chakras'} tabId="chakras" onClick={() => setActiveTab('chakras')} icon={<Activity className="w-4 h-4"/>}>Pranic Energy</Tab>
              <Tab active={activeTab === 'compatibility'} tabId="compatibility" onClick={() => setActiveTab('compatibility')} icon={<Heart className="w-4 h-4"/>}>Compatibility</Tab>
              <Tab active={activeTab === 'cycles'} tabId="cycles" onClick={() => setActiveTab('cycles')} icon={<Star className="w-4 h-4"/>}>Cycles</Tab>
              <Tab active={activeTab === 'daily'} tabId="daily" onClick={() => setActiveTab('daily')} icon={<Sun className="w-4 h-4"/>}>Forecasts</Tab>
              <Tab active={activeTab === 'synthesis'} tabId="synthesis" onClick={() => setActiveTab('synthesis')} icon={<Network className="w-4 h-4"/>}>Synthesis</Tab>
              <Tab active={activeTab === 'strategy'} tabId="strategy" onClick={() => setActiveTab('strategy')} icon={<Compass className="w-4 h-4"/>}>Life Strategy</Tab>
              <Tab active={activeTab === 'timeline'} tabId="timeline" onClick={() => setActiveTab('timeline')} icon={<Activity className="w-4 h-4"/>}>Timeline</Tab>
              <Tab active={activeTab === 'name'} tabId="name" onClick={() => setActiveTab('name')} icon={<Type className="w-4 h-4"/>}>Name Analysis</Tab>
              <Tab active={activeTab === 'akashic'} tabId="akashic" onClick={() => setActiveTab('akashic')} icon={<BookOpen className="w-4 h-4"/>}>Akashic Records</Tab>
              <Tab active={activeTab === 'patterns'} tabId="patterns" onClick={() => setActiveTab('patterns')} icon={<Fingerprint className="w-4 h-4"/>}>Synchronicities</Tab>
              <Tab active={activeTab === 'angel_numbers'} tabId="angel_numbers" onClick={() => setActiveTab('angel_numbers')} icon={<Sparkles className="w-4 h-4"/>}>Angel Numbers</Tab>
              <Tab active={activeTab === 'vortex'} tabId="vortex" onClick={() => setActiveTab('vortex')} icon={<CirclePlay className="w-4 h-4 text-cyan-400"/>}>Vortex Sequencing</Tab>
              <Tab active={activeTab === 'vibrational_tuning'} tabId="vibrational_tuning" onClick={() => setActiveTab('vibrational_tuning')} icon={<Radio className="w-4 h-4 text-fuchsia-400 animate-pulse"/>}>Vibrational Tuning</Tab>
              <Tab active={activeTab === 'alignment'} tabId="alignment" onClick={() => setActiveTab('alignment')} icon={<Radio className="w-4 h-4 text-teal-400 animate-pulse"/>}>Alignment</Tab>
              <Tab active={activeTab === 'ai_agents'} tabId="ai_agents" onClick={() => setActiveTab('ai_agents')} icon={<Cpu className="w-4 h-4 text-emerald-400"/>}>AI Agents Swarm</Tab>
              <Tab active={activeTab === 'jarvis_os'} tabId="jarvis_os" onClick={() => { soundEngine.click(); setActiveTab('jarvis_os'); }} icon={<Cpu className="w-4 h-4 text-cyan-400 animate-pulse"/>}>Jarvis OS</Tab>
              <Tab active={activeTab === 'astrology_engine'} tabId="astrology_engine" onClick={() => { soundEngine.click(); setActiveTab('astrology_engine'); }} icon={<Compass className="w-4 h-4 text-indigo-400 animate-pulse"/>}>Astrology Engine</Tab>
              <Tab active={activeTab === 'astral_canvas'} tabId="astral_canvas" onClick={() => setActiveTab('astral_canvas')} icon={<Workflow className="w-4 h-4 text-purple-400 animate-pulse"/>}>AI Agent Canvas</Tab>
              <Tab active={activeTab === 'gematria_calc'} tabId="gematria_calc" onClick={() => setActiveTab('gematria_calc')} icon={<Type className="w-4 h-4 text-fuchsia-400"/>}>Gematria Calculator</Tab>
              <Tab active={activeTab === 'golden_ratio'} tabId="golden_ratio" onClick={() => setActiveTab('golden_ratio')} icon={<Grid className="w-4 h-4 text-amber-500" />}>Kathara Grid</Tab>
              <Tab active={activeTab === 'sky_map'} tabId="sky_map" onClick={() => setActiveTab('sky_map')} icon={<Compass className="w-4 h-4 text-indigo-400"/>}>Atlas Sky Map</Tab>
              <Tab active={activeTab === 'celestial_sphere'} tabId="celestial_sphere" onClick={() => setActiveTab('celestial_sphere')} icon={<Orbit className="w-4 h-4 text-fuchsia-400"/>}>Celestial Sphere</Tab>
              <Tab active={activeTab === 'celestial_blueprint'} tabId="celestial_blueprint" onClick={() => setActiveTab('celestial_blueprint')} icon={<Compass className="w-4 h-4 text-emerald-400 animate-pulse"/>}>Celestial Blueprint</Tab>
              <Tab active={activeTab === 'obsidian'} tabId="obsidian" onClick={() => setActiveTab('obsidian')} icon={<BookOpen className="w-4 h-4 text-purple-400"/>}>Akashic Vault</Tab>
              <Tab active={activeTab === 'codex'} tabId="codex" onClick={() => setActiveTab('codex')} icon={<Search className="w-4 h-4 text-emerald-400"/>}>Cosmic Codex</Tab>
              <Tab active={activeTab === 'evolution'} tabId="evolution" onClick={() => setActiveTab('evolution')} icon={<Cpu className="w-4 h-4 text-blue-500"/>}>Quantum Evolution</Tab>
              <Tab active={activeTab === 'christ_sophia'} tabId="christ_sophia" onClick={() => setActiveTab('christ_sophia')} icon={<Sparkles className="w-4 h-4 text-amber-300 animate-pulse"/>}>Christ-Sophia Gnosis</Tab>
              <Tab active={activeTab === 'tetragrammaton'} tabId="tetragrammaton" onClick={() => setActiveTab('tetragrammaton')} icon={<Hexagon className="w-4 h-4 text-[#fbbf24]"/>}>YHVH HUD</Tab>
              <Tab active={activeTab === 'freemason33'} tabId="freemason33" onClick={() => setActiveTab('freemason33')} icon={<Sparkles className="w-4 h-4 text-amber-400 animate-pulse"/>}>Free Mason 33</Tab>
              <Tab active={activeTab === 'holographic_rainbow'} tabId="holographic_rainbow" onClick={() => setActiveTab('holographic_rainbow')} icon={<Sparkles className="w-4 h-4 text-purple-400 animate-pulse"/>}>Holographic Rainbow</Tab>
              <Tab active={activeTab === 'flower_of_life'} tabId="flower_of_life" onClick={() => setActiveTab('flower_of_life')} icon={<Hexagon className="w-4 h-4 text-cyan-400 animate-pulse"/>}>Flower of Life Matrix</Tab>
              <Tab active={activeTab === 'chinese_zodiac'} tabId="chinese_zodiac" onClick={() => setActiveTab('chinese_zodiac')} icon={<Flame className="w-4 h-4 text-red-500 animate-pulse"/>}>Chinese Zodiac</Tab>
              <Tab active={activeTab === 'destiny_matrix'} tabId="destiny_matrix" onClick={() => setActiveTab('destiny_matrix')} icon={<Compass className="w-4 h-4 text-emerald-400"/>}>Destiny Matrix</Tab>
              <Tab active={activeTab === 'tarot'} tabId="tarot" onClick={() => setActiveTab('tarot')} icon={<Sparkles className="w-4 h-4 text-pink-400 animate-pulse"/>}>Tarot Arcana</Tab>
              <Tab active={activeTab === 'sandbox'} tabId="sandbox" onClick={() => setActiveTab('sandbox')} icon={<Box className="w-4 h-4 text-emerald-400"/>}>Creative Sandbox</Tab>
              <Tab active={activeTab === 'quantum_fluid'} tabId="quantum_fluid" onClick={() => setActiveTab('quantum_fluid')} icon={<Box className="w-4 h-4 text-cyan-400 animate-pulse"/>}>Quantum Fluid WebGPU</Tab>
              <Tab active={activeTab === 'neural_synaptic'} tabId="neural_synaptic" onClick={() => setActiveTab('neural_synaptic')} icon={<Network className="w-4 h-4 text-indigo-400 animate-pulse"/>}>Neural Synaptic D3</Tab>
              <Tab active={activeTab === 'findings'} tabId="findings" onClick={() => setActiveTab('findings')} icon={<Zap className="w-4 h-4"/>}>Deep Synthesis</Tab>
              <Tab active={activeTab === 'harmonics'} tabId="harmonics" onClick={() => setActiveTab('harmonics')} icon={<BarChart2 className="w-4 h-4"/>}>Harmonics</Tab>
              <Tab active={activeTab === 'karma_ledger'} tabId="karma_ledger" onClick={() => setActiveTab('karma_ledger')} icon={<History className="w-4 h-4 text-emerald-400" />}>Karma Ledger</Tab>
              <Tab active={activeTab === '9d_creation'} tabId="9d_creation" onClick={() => setActiveTab('9d_creation')} icon={<Layers className="w-4 h-4 text-amber-500 animate-pulse" />}>9D Conscious Creation</Tab>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/20">
              <React.Suspense fallback={
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="w-8 h-8 text-purple-500" />
                  </motion.div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-purple-400/60">Assembling Synaptic Buffer...</p>
                </div>
              }>
                <AnimatePresence mode="wait">
                  {activeTab === 'identity' && (
                  <motion.div key="identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pb-32">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 shadow-2xl">
                      {/* Banner */}
                      <div className="h-40 bg-stone-900 relative">
                        {profileConfig?.bannerUrl ? (
                          <img src={profileConfig.bannerUrl} alt="" className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-emerald-900/50 opacity-40" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      {/* Header Content */}
                      <div className="px-8 pb-8 pt-0 -mt-12 relative flex flex-col md:flex-row items-end gap-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-stone-950 border-4 border-stone-950 shadow-2xl overflow-hidden flex items-center justify-center ring-1 ring-white/10 shrink-0">
                          {profileConfig?.avatarUrl || user?.photoURL ? (
                            <img src={profileConfig?.avatarUrl || user?.photoURL || ''} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-10 h-10 text-stone-700" />
                          )}
                        </div>
                        <div className="mb-2 flex-1">
                          <h2 className="text-3xl font-light text-white leading-none mb-2 tracking-tight">
                            {profileConfig?.displayName || user?.displayName || 'Traveler'}
                          </h2>
                          <div className="flex flex-wrap gap-2">
                             <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[10px] uppercase tracking-widest text-purple-300 font-bold shadow-lg shadow-purple-500/10">Resonance Level 4</span>
                             <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-[10px] uppercase tracking-widest text-blue-300 font-bold shadow-lg shadow-blue-500/10">Node Active</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsProfileModalOpen(true)}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-xs uppercase tracking-widest text-white transition-all backdrop-blur-md flex items-center gap-2 mb-2"
                        >
                          <Edit3 size={12} /> Edit Matrix
                        </button>
                      </div>

                      {/* Bio */}
                      <div className="px-8 pb-8">
                        <div className="space-y-6">
                          {profileConfig?.bio?.text && (
                            <div className="relative">
                              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full opacity-50" />
                              <p className="text-xl font-light text-stone-200 leading-relaxed italic pl-2">
                                "{profileConfig?.bio.text}"
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                              <h4 className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold mb-4">Aura Signature</h4>
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}40` }} />
                                <div>
                                  <div className="text-sm text-stone-200 font-light">Custom Resonance</div>
                                  <div className="text-[9px] uppercase tracking-widest text-stone-500">Linked to {themeColor}</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                              <h4 className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold mb-4">Node Connection</h4>
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                  <Globe size={14} />
                                </div>
                                <div>
                                  <div className="text-sm text-stone-200 font-light">Global Collective</div>
                                  <div className="text-[9px] uppercase tracking-widest text-stone-500">Connected to Web3 Matrix</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Research Vault Preview in Identity Tab */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <h3 className="text-sm uppercase tracking-[0.3em] text-stone-400 font-bold flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-400" />
                          Vaulted Findings
                        </h3>
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          {profileConfig?.researchVault?.length || 0} Items
                        </span>
                      </div>
                      
                      {profileConfig?.researchVault && profileConfig.researchVault.length > 0 ? (
                        <div className="grid gap-3">
                          {profileConfig?.researchVault?.slice(0, 3).map(item => (
                            <BoundResearchBox key={item.id} title={item.title} content={item.content} category={item.category}>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] uppercase tracking-widest text-stone-500 px-2 py-0.5 bg-white/5 rounded border border-white/5">{item.category}</span>
                              </div>
                              <h4 className="text-base text-white font-light mb-1">{item.title}</h4>
                              <p className="text-xs text-stone-400 line-clamp-2 italic font-light">"{item.content}"</p>
                            </BoundResearchBox>
                          ))}
                          {profileConfig?.researchVault && profileConfig.researchVault.length > 3 && (
                            <button className="w-full py-4 text-xs uppercase tracking-[0.3em] text-stone-500 hover:text-white transition-colors bg-white/2 bg-white/2 hover:bg-white/5 rounded-2xl border border-dashed border-white/10">
                              View All {profileConfig.researchVault.length} Discoveries in Settings
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="py-12 border border-dashed border-white/10 bg-white/2 rounded-[2.5rem] flex flex-col items-center justify-center space-y-3 opacity-50">
                           <BookOpen className="w-8 h-8 text-stone-700" />
                           <p className="text-[10px] uppercase tracking-widest text-stone-600">Vault Currently Empty</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'name' && (
                  <motion.div key="name" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-8">
                    {!data.nameAnalysis ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <Type className="w-16 h-16 text-sky-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Analysis Locked</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The sequence of your signature has yet to be fully decoded by the current matrix alignment."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Re-initialize your cosmic hologram to generate the full Name Analysis & Gematria expansion.</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-6 bg-gradient-to-br from-sky-900/40 to-indigo-900/40 rounded-[2.5rem] border border-sky-500/30 shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                              <Fingerprint className="w-32 h-32 text-sky-400" />
                           </div>
                           <div className="relative z-10">
                             <h3 className="text-2xl font-light text-white mb-2 flex items-center gap-3">
                               <Fingerprint className="w-6 h-6 text-sky-400" />
                               Identity Gematria Matrix
                             </h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                               <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                 <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Full Value</div>
                                 <div className="text-2xl font-light text-sky-400">{data.gematria.nameValue}</div>
                               </div>
                               <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                 <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Reduction</div>
                                 <div className="text-2xl font-light text-indigo-400">{data.gematria.reduction}</div>
                               </div>
                               <div className="bg-black/40 p-4 rounded-2xl border border-white/5 col-span-2">
                                 <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Pattern Sequence</div>
                                 <div className="text-sm font-mono text-stone-300 truncate">{data.gematria.pattern}</div>
                               </div>
                             </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-4 px-2">
                             <div className="h-px flex-1 bg-white/5"></div>
                             <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">Etymological Pathways</span>
                             <div className="h-px flex-1 bg-white/5"></div>
                           </div>

                           {[
                             { d: data.nameAnalysis.first, label: 'First Name', color: 'sky' },
                             { d: data.nameAnalysis.middle, label: 'Middle Name', color: 'indigo' },
                             { d: data.nameAnalysis.last, label: 'Last Name', color: 'purple' }
                           ].filter(x => x.d?.name).map((part, idx) => (
                             <motion.div 
                               key={idx}
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: idx * 0.1 }}
                               className={`bg-white/5 rounded-3xl border border-white/10 hover:border-${part.color}-500/30 transition-all p-6 relative group`}
                             >
                               <div className="flex flex-col md:flex-row justify-between gap-6">
                                 <div className="md:w-1/3">
                                   <div className={`w-12 h-12 rounded-2xl bg-${part.color}-500/20 border border-${part.color}-500/30 flex items-center justify-center text-${part.color}-400 mb-4`}>
                                     <Type className="w-6 h-6" />
                                   </div>
                                   <h4 className="text-xl font-light text-white mb-1">{part.d.name}</h4>
                                   <p className={`text-xs text-${part.color}-400 uppercase tracking-widest font-bold`}>{part.label}</p>
                                   <p className="text-[10px] text-stone-500 mt-2 italic">Origin: {part.d.origin}</p>
                                 </div>
                                 <div className="flex-1 space-y-4">
                                   <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                      <h5 className="text-[9px] uppercase tracking-widest text-stone-500 mb-2 font-bold">Root Meaning</h5>
                                      <p className="text-sm font-light text-stone-300 leading-relaxed">{part.d.meaning}</p>
                                   </div>
                                   <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                      <h5 className="text-[9px] uppercase tracking-widest text-stone-500 mb-2 font-bold">Resonant Impact</h5>
                                      <p className="text-sm font-light text-stone-400 italic leading-relaxed">"{part.d.impact}"</p>
                                   </div>
                                 </div>
                               </div>
                               <button 
                                 onClick={() => handleGeneralDeepDive(`${part.label}: ${part.d.name}`, `${part.d.meaning} ${part.d.impact}`)}
                                 className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800/80 p-2 rounded-lg text-stone-300 border border-white/10"
                               >
                                 <Search className="w-3 h-3" />
                               </button>
                             </motion.div>
                           ))}

                           {data.nameAnalysis.overallBigPicture && (
                             <div className="bg-gradient-to-r from-sky-900/20 to-teal-900/20 p-8 rounded-[3rem] border border-sky-500/20 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent)]"></div>
                                <h4 className="flex gap-2 items-center text-sm uppercase tracking-widest text-sky-300 mb-4 block relative z-10 font-bold">
                                  <Network className="w-4 h-4"/> Identity Synthesis
                                </h4>
                                <p className="text-lg font-light leading-relaxed text-sky-50 italic relative z-10">"{data.nameAnalysis.overallBigPicture}"</p>
                             </div>
                           )}

                           <div className="mt-12">
                             <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-white/50"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                                <AncestralResearchSection initialLastName={data.nameAnalysis.last?.name || ''} />
                             </React.Suspense>
                           </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'patterns' && (
                  <motion.div key="patterns" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.patterns ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <Fingerprint className="w-16 h-16 text-teal-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Patterns Undiscovered</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The synchronicities between your natal alignment and current numerological frequencies await discovery."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Update your core blueprint to identify advanced esoteric patterns and life correlations.</p>
                        <button 
                          onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                          className="mt-6 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-teal-900/50"
                        >
                          Generate Synchronicities
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 border-b border-teal-500/20 pb-4">
                          <Fingerprint className="w-5 h-5 text-teal-400" />
                          <h3 className="text-xl font-light text-white">Synchronicities & Patterns</h3>
                        </div>
                        <div className="space-y-6">
                          {data.patterns.timeDateDiscovery && (
                            <BoundResearchBox 
                              title={`Discovery: ${data.patterns.timeDateDiscovery.title}`} 
                              content={`${data.patterns.timeDateDiscovery.mathematicalPattern}: ${data.patterns.timeDateDiscovery.description}`}
                              category="Incredible Discovery"
                              className="bg-amber-900/20 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 pointer-events-none">
                                <Zap className="w-24 h-24 text-amber-400" />
                              </div>
                              <div className="relative z-10">
                                <h4 className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold mb-2 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 animate-pulse" />
                                  Incredible Time/Date Synchronicity
                                </h4>
                                <h5 className="text-xl font-light text-white mb-2">{data.patterns.timeDateDiscovery.title}</h5>
                                <div className="bg-black/40 px-4 py-2 rounded-xl inline-block border border-amber-500/20 text-amber-200 font-mono text-xs mb-4">
                                  {data.patterns.timeDateDiscovery.mathematicalPattern}
                                </div>
                                <p className="text-sm text-stone-200 leading-relaxed font-light italic">"{data.patterns.timeDateDiscovery.description}"</p>
                              </div>
                            </BoundResearchBox>
                          )}

                          <BoundResearchBox title="Core Esoteric Theme" content={data.patterns.coreTheme} className="bg-teal-900/10 border-teal-500/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                            <h4 className="text-[10px] uppercase tracking-widest text-teal-400 mb-2">Core Theme</h4>
                            <p className="text-sm text-stone-200 leading-relaxed font-light">{data.patterns.coreTheme}</p>
                          </BoundResearchBox>
                          
                          <div className="grid gap-4 md:grid-cols-2">
                            {data.patterns.synchronicities.map((sync, i) => (
                              <BoundResearchBox key={i} title={`Synchronicity: ${sync.title}`} content={sync.description} className="bg-white/5">
                                <h4 className="text-sm font-medium text-teal-300 mb-2 flex items-center gap-2"><Network className="w-4 h-4"/> {sync.title}</h4>
                                <p className="text-sm text-stone-300 font-light leading-relaxed">{sync.description}</p>
                              </BoundResearchBox>
                            ))}
                          </div>
                          
                          <BoundResearchBox title="Cosmic Interesting Facts Exploration" content={data.patterns.interestingFacts.join('\n')}>
                            <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Interesting Facts</h4>
                            <ul className="space-y-3">
                              {data.patterns.interestingFacts.map((fact, i) => (
                                <li key={i} className="text-sm text-stone-300 font-light leading-relaxed flex items-start gap-3">
                                  <span className="text-teal-500/50 mt-1">•</span>
                                  <span>{fact}</span>
                                </li>
                              ))}
                            </ul>
                          </BoundResearchBox>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'harmonics' && (
                  <motion.div key="harmonics" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="h-full">
                     <HarmonicVisualizer data={data} />
                  </motion.div>
                )}
                {activeTab === 'karma_ledger' && (
                  <motion.div key="karma_ledger" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="h-full">
                     <KarmaLedger />
                  </motion.div>
                )}
                {activeTab === 'akashic' && (
                  <motion.div key="akashic" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.akashic ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <BookOpen className="w-16 h-16 text-indigo-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Ethereal Archive Locked</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The Akashic records of your soul's origin require a deeper vibratory resonance to manifest."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Re-generate your reading to bridge the gap between your present self and your soul's historical archives.</p>
                        <button 
                          onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                          className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-indigo-900/50"
                        >
                          Access Akashic Records
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                          <BookOpen className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-xl font-light text-white">Akashic Records</h3>
                        </div>
                        <div className="space-y-6">
                          <BoundResearchBox title="Akashic: Soul Origin" content={data.akashic.soulOrigin}>
                            <Section title="Soul Origin" content={data.akashic.soulOrigin} />
                          </BoundResearchBox>
                          <BoundResearchBox title="Akashic: Past Life Themes" content={data.akashic.pastLifeThemes}>
                            <Section title="Past Life Themes" content={data.akashic.pastLifeThemes} />
                          </BoundResearchBox>
                          <BoundResearchBox title="Akashic: Karmic Debts" content={data.akashic.karmicDebts}>
                            <Section title="Karmic Debts & Lessons" content={data.akashic.karmicDebts} />
                          </BoundResearchBox>
                          <BoundResearchBox title="Akashic: Soul Gifts" content={data.akashic.soulGifts}>
                            <Section title="Soul Gifts" content={data.akashic.soulGifts} />
                          </BoundResearchBox>
                          
                          <BoundResearchBox title="Guide Message Research" content={data.akashic.guardianMessage} className="bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                            <h4 className="text-sm uppercase tracking-widest text-indigo-300 mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4" /> Message from your Guides
                            </h4>
                            <p className="text-md text-indigo-100 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4">{data.akashic.guardianMessage}</p>
                          </BoundResearchBox>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'timeline' && (
                  <motion.div key="timeline" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.timeline ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <Activity className="w-16 h-16 text-rose-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Temporal Path Hidden</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The timeline of your physical incarnation has not yet been traced onto the cosmic tapestry."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Update your analysis to visualize the interactive timeline of your past, present, and potential futures.</p>
                        <button 
                          onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                          className="mt-6 bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-rose-900/50"
                        >
                          Unlock Cosmic Timeline
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
                          <Activity className="w-5 h-5 text-rose-400" />
                          <h3 className="text-xl font-light text-white">Interactive Timeline</h3>
                        </div>
                        <p className="text-xs text-stone-400 italic mb-4">Select a timeline period to research deeper into the astrological and numerological currents of that time in your life.</p>
                        <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
                          {data.timeline.map((event, i) => {
                            const isSelected = selectedTimelineEvent === event;
                            return (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="relative"
                            >
                              <motion.div 
                                layout
                                className={`absolute -left-[31px] z-10 w-3 h-3 rounded-full border-2 border-stone-900 transition-colors ${event.period === 'past' ? 'bg-stone-500' : event.period === 'present' ? 'bg-rose-500 animate-pulse' : 'bg-purple-500'}`}
                                animate={isSelected ? { 
                                  scale: 1.5,
                                  backgroundColor: "#f43f5e",
                                  boxShadow: "0 0 20px rgba(244, 63, 94, 0.8)" 
                                } : { scale: 1 }}
                              />
                              
                              <motion.div 
                                layout
                                onClick={() => isSelected ? setSelectedTimelineEvent(null) : handleTimelineEventSelect(event)}
                                className={`bg-white/5 p-6 rounded-[2rem] border cursor-pointer transition-all duration-500 ${isSelected ? 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.25)] bg-rose-950/20' : 'border-white/10 hover:border-rose-500/40 hover:bg-white/10'}`}
                              >
                                <motion.div layout className="flex items-start justify-between mb-4">
                                  <div>
                                    <motion.span layout className={`font-medium text-xl ${isSelected ? 'text-rose-400' : 'text-rose-300'}`}>{event.year}</motion.span>
                                    <motion.span layout className="ml-3 text-xs uppercase tracking-[0.2em] text-stone-500 bg-black/40 px-2 py-1 rounded">Age {event.age}</motion.span>
                                  </div>
                                  <motion.div layout className="flex items-center gap-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleTimelineEventSelect(event); }}
                                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 hover:text-rose-300 transition-all flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold"
                                      title="Research Period"
                                    >
                                      <Search className="w-3 h-3" />
                                      Research
                                    </button>
                                     <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${event.period === 'past' ? 'bg-stone-800 text-stone-400' : event.period === 'present' ? 'bg-rose-900/40 text-rose-300 border border-rose-500/20' : 'bg-purple-900/40 text-purple-300 border border-purple-500/20'}`}>
                                       {event.period}
                                     </span>
                                  </motion.div>
                                </motion.div>
                                <motion.p layout className="text-base font-light text-stone-200 leading-relaxed mb-4">{event.highlight}</motion.p>
                                <motion.div layout className="bg-black/40 p-4 rounded-2xl border border-dashed border-white/5 backdrop-blur-sm">
                                  <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-bold">House Significance</h4>
                                  <p className="text-sm text-stone-400 leading-relaxed italic">"{event.houseSignificance}"</p>
                                </motion.div>

                                {event.highlight.toLowerCase().includes("awakening") && (
                                  <motion.div layout className="mt-4">
                                     <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleGeneralDeepDive(
                                            `Synchronicity: The Great Awakening & Your Angel Number`,
                                            `Research the potential synchronicity between the user experiencing the timeline event '${event.highlight}' at age ${event.age} (${event.year}) and their core numerology/angel number frequencies. Focus on energetic shifts, soul completion, and cosmic alignment.`
                                          );
                                        }}
                                        className="w-full p-4 bg-gradient-to-r from-purple-900/20 to-rose-900/20 border border-purple-500/30 rounded-2xl flex items-center justify-center gap-3 hover:from-purple-900/40 hover:to-rose-900/40 border-dashed text-purple-300 transition-all shadow-inner font-bold text-[10px] uppercase tracking-widest relative overflow-hidden group"
                                      >
                                        <div className="absolute inset-0 bg-purple-400/10 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="relative z-10 w-full text-center">Research Angel Number Synchronicity</span>
                                      </button>
                                  </motion.div>
                                )}

                                {isSelected && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    className="pt-6 mt-6 border-t border-white/10 pointer-events-auto"
                                  >
                                    <div className="flex items-center justify-center p-5 bg-rose-500/10 rounded-2xl border border-rose-500/30 shadow-inner">
                                      <Search className="w-5 h-5 text-rose-400 mr-3 animate-pulse" />
                                      <span className="text-xs text-rose-300 tracking-[0.3em] uppercase font-bold">Accessing Akashic Memory...</span>
                                    </div>
                                  </motion.div>
                                )}
                              </motion.div>
                            </motion.div>
                          )})}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'strategy' && (
                  <motion.div key="strategy" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.lifeStrategy ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <Compass className="w-16 h-16 text-teal-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Strategy Unmapped</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The strategic blueprint for your soul's ascension requires a fresh recalculation of your core matrix."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Regenerate now to finalize your goal plan and cosmic moving-forward strategy.</p>
                        <button 
                          onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                          className="mt-6 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-teal-900/50"
                        >
                          Map Life Strategy
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 border-b border-teal-500/20 pb-4">
                          <Compass className="w-5 h-5 text-teal-400" />
                          <h3 className="text-xl font-light text-white">Life Strategy & Ascension</h3>
                        </div>
                        
                        <div className="space-y-6">
                          <BoundResearchBox title="Personal Universe Correlation" content={data.lifeStrategy.universeCorrelation}>
                            <h4 className="text-xs uppercase tracking-widest text-teal-300 mb-3 block">Personal Universe Correlation</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-200">{data.lifeStrategy.universeCorrelation}</p>
                          </BoundResearchBox>

                          <BoundResearchBox title="Kabbalah & Numerology Depth" content={data.lifeStrategy.kabbalahNumerologyDepth}>
                            <h4 className="text-xs uppercase tracking-widest text-teal-300 mb-3 block">Kabbalah & Numerology Depth</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-200">{data.lifeStrategy.kabbalahNumerologyDepth}</p>
                          </BoundResearchBox>

                          <BoundResearchBox title="Personal Goal Plan" content={data.lifeStrategy.goalPlan} className="bg-teal-900/10 border-teal-500/20">
                            <h4 className="text-xs uppercase tracking-widest text-teal-400 mb-3 block">Goal Plan</h4>
                            <p className="text-sm font-medium leading-relaxed text-stone-200">{data.lifeStrategy.goalPlan}</p>
                          </BoundResearchBox>

                          <BoundResearchBox title="Strategy: Moving Forward" content={data.lifeStrategy.movingForward} className="bg-black/30 border-white/5">
                            <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3 block">Moving Forward</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-300">{data.lifeStrategy.movingForward}</p>
                          </BoundResearchBox>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'findings' && (
                  <motion.div key="findings" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="h-full">
                     <DeepSynthesis data={data} onPresentationRequest={onPresentationRequest} />
                  </motion.div>
                )}
                {activeTab === 'synthesis' && (
                  <motion.div key="synthesis" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.advancedCycles ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <Network className="w-16 h-16 text-fuchsia-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Synthesis Incomplete</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The convergence of planetary phases and soli-arcs has yet to be synthesized into a singular expression."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Align your energies once more to unlock the master pattern synthesis and planetary phases.</p>
                        <button 
                          onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                          className="mt-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-fuchsia-900/50"
                        >
                          Synthesize Patterns
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                          <Network className="w-5 h-5 text-fuchsia-400" />
                          <h3 className="text-xl font-light text-white">Pattern Synthesis</h3>
                        </div>
                                               <div className="space-y-4">
                          <BoundResearchBox title="Morning & Evening Stars Significance" content={data.advancedCycles.morningEveningStars.meaning}>
                            <h4 className="text-xs uppercase tracking-widest text-fuchsia-400 mb-4 flex items-center gap-2"><Star className="w-4 h-4"/> Morning & Evening Stars</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-black/30 p-4 rounded-xl border border-dashed border-white/10">
                                 <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">Morning Star</span>
                                 <span className="text-sm text-amber-200 font-medium">{data.advancedCycles.morningEveningStars.morningStar}</span>
                              </div>
                              <div className="bg-black/30 p-4 rounded-xl border border-dashed border-white/10">
                                 <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">Evening Star</span>
                                 <span className="text-sm text-indigo-300 font-medium">{data.advancedCycles.morningEveningStars.eveningStar}</span>
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed text-stone-300 font-light">{data.advancedCycles.morningEveningStars.meaning}</p>
                          </BoundResearchBox>

                          <BoundResearchBox title="Arabic Lots Interpretation" content={data.advancedCycles.arabicLots.meaning}>
                            <h4 className="text-xs uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2"><Activity className="w-4 h-4"/> Arabic Lots</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20">
                                 <span className="text-[10px] text-cyan-500 uppercase tracking-widest block mb-1">Lot of Spirit</span>
                                 <span className="text-sm text-cyan-100 font-medium">{data.advancedCycles.arabicLots.lotOfSpirit}</span>
                              </div>
                              <div className="bg-rose-900/10 p-4 rounded-xl border border-rose-500/20">
                                 <span className="text-[10px] text-rose-500 uppercase tracking-widest block mb-1">Lot of Eros</span>
                                 <span className="text-sm text-rose-100 font-medium">{data.advancedCycles.arabicLots.lotOfEros}</span>
                              </div>
                            </div>
                             <p className="text-sm leading-relaxed text-stone-300 font-light">{data.advancedCycles.arabicLots.meaning}</p>
                          </BoundResearchBox>

                          {data.advancedCycles.planetPhases && (
                            <BoundResearchBox title="Planetary Phases Analysis" content={data.advancedCycles.planetPhases.map(p => `${p.name}: ${p.phase}`).join(', ')}>
                              <h4 className="text-xs uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2"><Moon className="w-4 h-4"/> Planetary Phases</h4>
                              <div className="space-y-3">
                                {data.advancedCycles.planetPhases.map((phase, i) => (
                                  <div key={i} className="border-b border-white/5 pb-3">
                                    <div className="flex gap-2 items-center mb-1">
                                      <span className="text-sm text-stone-200 font-medium">{phase.name}</span>
                                      <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-stone-400">{phase.phase}</span>
                                    </div>
                                    <p className="text-xs text-stone-400 font-light">{phase.meaning}</p>
                                  </div>
                                ))}
                              </div>
                            </BoundResearchBox>
                          )}

                          {data.advancedCycles.soliArcs && (
                            <BoundResearchBox title="Soli-Arcs Cosmic Fusion" content={data.advancedCycles.soliArcs.map(a => a.description).join('; ')} className="bg-orange-900/10 border-orange-500/20">
                              <h4 className="text-xs uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2"><Sun className="w-4 h-4"/> Soli-Arcs</h4>
                              <div className="space-y-3">
                                {data.advancedCycles.soliArcs.map((arc, i) => (
                                  <div key={i} className="flex flex-col gap-1 border-b border-orange-500/10 pb-2">
                                    <span className="text-xs text-orange-200 font-medium">{arc.description}</span>
                                    <p className="text-xs text-stone-400 font-light">{arc.meaning}</p>
                                  </div>
                                ))}
                              </div>
                            </BoundResearchBox>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'daily' && (
                  <motion.div key="daily" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.dailyInsight ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <Sun className="w-16 h-16 text-yellow-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Forecasts Offline</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The daily, weekly, and yearly oscillations of the stars have not yet been synchronized with your profile."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Update your core reading to unlock the full prediction matrix and daily affirmations.</p>
                        <button 
                          onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                          className="mt-6 bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-yellow-900/50"
                        >
                          Sync Forecast Matrix
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Daily */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <h3 className="text-xl font-light text-white flex items-center gap-2"><Sun className="w-5 h-5 text-yellow-400" /> Daily Insight</h3>
                          <span className="text-xs tracking-widest text-stone-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">{data.dailyInsight.date}</span>
                        </div>

                        <MockOpastroTerminal sign={(data as any).celestialDna?.sunSign || data.planets?.find((p: any) => p.name.toLowerCase() === 'sun')?.sign || "Aries"} />

                        <div className="space-y-4 mb-8">
                          <BoundResearchBox title="Daily Horoscope Research" content={data.dailyInsight.horoscope}>
                            <h4 className="text-xs uppercase tracking-widest text-blue-400 mb-2">Horoscope</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-200">{data.dailyInsight.horoscope}</p>
                          </BoundResearchBox>

                          <BoundResearchBox title="Daily Affirmation Deep Dive" content={data.dailyInsight.affirmation} className="bg-purple-900/20 border-purple-500/20">
                            <h4 className="text-xs uppercase tracking-widest text-purple-400 mb-2">Affirmation</h4>
                            <p className="text-sm font-medium italic text-purple-200">"{data.dailyInsight.affirmation}"</p>
                          </BoundResearchBox>

                          <div className="grid grid-cols-2 gap-4">
                            <BoundResearchBox title="Daily Cautionary Influence" content={data.dailyInsight.caution} className="bg-red-900/10 border-red-500/10">
                              <h4 className="text-xs uppercase tracking-widest text-red-400/80 mb-2">Caution</h4>
                              <p className="text-xs font-light text-stone-300 leading-relaxed">{data.dailyInsight.caution}</p>
                            </BoundResearchBox>
                            <BoundResearchBox title="Daily Key Universal Interest" content={data.dailyInsight.keyInterest} className="bg-emerald-900/10 border-emerald-500/20">
                              <h4 className="text-xs uppercase tracking-widest text-emerald-400/80 mb-2">Key Interest</h4>
                              <p className="text-xs font-light text-stone-300 leading-relaxed">{data.dailyInsight.keyInterest}</p>
                            </BoundResearchBox>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BoundResearchBox title="Age Significance Meaning" content={data.dailyInsight.ageSignificance} className="bg-black/30 border-white/5">
                              <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Age Significance</h4>
                              <p className="text-sm text-stone-300">{data.dailyInsight.ageSignificance}</p>
                            </BoundResearchBox>
                            
                            <BoundResearchBox title="Time & Date Space Correlation" content={data.dailyInsight.timeDateCorrelation} className="bg-black/30 border-white/5">
                              <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Time & Date Correlation</h4>
                              <p className="text-sm text-stone-300">{data.dailyInsight.timeDateCorrelation}</p>
                            </BoundResearchBox>
                          </div>
                        </div>

                        {/* Weekly */}
                        {data.weeklyInsight && (
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                              <h3 className="text-lg font-light text-indigo-300">Weekly Forecast</h3>
                              <span className="text-[10px] uppercase tracking-widest text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/20">{data.weeklyInsight.theme}</span>
                            </div>
                            <BoundResearchBox title={`Weekly Outlook: ${data.weeklyInsight.theme}`} content={data.weeklyInsight.horoscope} className="bg-indigo-900/10 border-indigo-500/10">
                              <p className="text-sm font-light leading-relaxed text-stone-300">{data.weeklyInsight.horoscope}</p>
                            </BoundResearchBox>
                          </div>
                        )}

                        {/* Monthly */}
                        {data.monthlyInsight && (
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 border-b border-fuchsia-500/20 pb-4">
                              <h3 className="text-lg font-light text-fuchsia-300">Monthly Forecast</h3>
                              <span className="text-[10px] uppercase tracking-widest text-fuchsia-400 bg-fuchsia-900/30 px-2 py-0.5 rounded border border-fuchsia-500/20">{data.monthlyInsight.theme}</span>
                            </div>
                            <BoundResearchBox title={`Monthly Outlook: ${data.monthlyInsight.theme}`} content={data.monthlyInsight.horoscope} className="bg-fuchsia-900/10 border-fuchsia-500/10">
                              <p className="text-sm font-light leading-relaxed text-stone-300">{data.monthlyInsight.horoscope}</p>
                            </BoundResearchBox>
                          </div>
                        )}

                        {/* Yearly */}
                        {data.yearlyInsight && (
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
                              <h3 className="text-lg font-light text-amber-300">Yearly Forecast</h3>
                              <span className="text-[10px] uppercase tracking-widest text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded border border-amber-500/20">{data.yearlyInsight.theme}</span>
                            </div>
                            <BoundResearchBox title={`Yearly Outlook: ${data.yearlyInsight.theme}`} content={data.yearlyInsight.horoscope} className="bg-amber-900/10 border-amber-500/10">
                              <p className="text-sm font-light leading-relaxed text-stone-300">{data.yearlyInsight.horoscope}</p>
                            </BoundResearchBox>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'avatar_matrix' && (
                  <motion.div key="avatar_matrix" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    <AvatarMatrix data={data} />
                  </motion.div>
                )}

                {activeTab === 'holographic_profile' && (
                  <motion.div key="holographic_profile" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-black rounded-3xl border border-white/5"><div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>}>
                      <HolographicProfile 
                        user={user} 
                        onSignIn={onSignIn} 
                        data={data} 
                        loadedInputs={loadedInputs} 
                      />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'star_chart' && (
                  <motion.div key="star_chart" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-black rounded-3xl border border-white/5"><div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" /></div>}>
                      <StarChart3D />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'egyptian' && (
                  <motion.div key="egyptian" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-black rounded-3xl border border-yellow-900/30"><div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" /></div>}>
                      <EgyptianPyramidAlignment />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'notebook' && (
                  <motion.div key="notebook" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-black rounded-3xl border border-indigo-900/30"><div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
                      <HolographicNotebook />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'past_life_echoes' && (
                  <motion.div key="past_life_echoes" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-black rounded-3xl border border-fuchsia-900/30"><div className="w-12 h-12 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" /></div>}>
                      <PastLifeEchoes userData={data} />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'synaptic_web' && (
                  <motion.div key="synaptic_web" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-zinc-950 rounded-3xl border border-indigo-900/30"><div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
                      <SynapticWebVisualizer userData={data} />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'neural_synaptic' && (
                  <motion.div key="neural_synaptic" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-zinc-950 rounded-3xl border border-indigo-900/30"><div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
                      <NeuralSynapticViz data={data} />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'cosmic_canvas' && (
                  <motion.div key="cosmic_canvas" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{duration: 0.5}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-zinc-950 rounded-3xl border border-pink-905/30"><div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" /></div>}>
                      <CosmicCanvas />
                    </React.Suspense>
                  </motion.div>
                )}

                {activeTab === 'torus' && (
                  <motion.div key="torus" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6 text-stone-200 font-light leading-relaxed relative min-h-[70vh]">
                    <SoulBlueprintTab 
                      data={data} 
                      ResearchBox={ResearchBox} 
                      isReading={isReading}
                      handleReadOutLoud={handleReadOutLoud}
                      handleSaveToVault={handleSaveToVault}
                      handleGeneralDeepDive={handleGeneralDeepDive}
                    />
                  </motion.div>
                )}
                
                {activeTab === 'cycles' && data.advancedCycles && (
                  <motion.div key="cycles" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <BoundResearchBox title="Morning & Evening Stars Significance" content={data.advancedCycles.morningEveningStars.meaning}>
                      <h4 className="text-xs uppercase tracking-widest text-fuchsia-400 mb-4">Morning & Evening Stars</h4>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-stone-400 text-sm">Oriental (Morning)</span>
                           <span className="text-stone-200">{data.advancedCycles.morningEveningStars.morningStar}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-stone-400 text-sm">Occidental (Evening)</span>
                           <span className="text-stone-200">{data.advancedCycles.morningEveningStars.eveningStar}</span>
                        </div>
                      </div>
                      <p className="text-sm text-stone-300 bg-black/20 p-3 rounded-lg leading-relaxed">{data.advancedCycles.morningEveningStars.meaning}</p>
                    </BoundResearchBox>

                    <BoundResearchBox title="Arabic Lots Interpretation" content={data.advancedCycles.arabicLots.meaning} className="bg-white/5 border-white/10">
                      <h4 className="text-xs uppercase tracking-widest text-amber-400 mb-4">Arabic Lots</h4>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-stone-400 text-sm">Lot of Spirit</span>
                           <span className="text-stone-200">{data.advancedCycles.arabicLots.lotOfSpirit}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-stone-400 text-sm">Lot of Eros</span>
                           <span className="text-stone-200">{data.advancedCycles.arabicLots.lotOfEros}</span>
                        </div>
                      </div>
                      <p className="text-sm text-stone-300 bg-black/20 p-3 rounded-lg leading-relaxed">{data.advancedCycles.arabicLots.meaning}</p>
                    </BoundResearchBox>

                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-3 ml-2">Notable Asteroids</h4>
                      <div className="space-y-3">
                        {data.advancedCycles.notableAsteroids.map(ast => (
                          <BoundResearchBox key={ast.name} title={`Asteroid Research: ${ast.name}`} content={ast.meaning} className="bg-black/30 border-white/5">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-emerald-300 font-medium">{ast.name}</span>
                              <span className="text-xs text-stone-400">{ast.sign}</span>
                            </div>
                            <p className="text-xs leading-relaxed text-stone-300">{ast.meaning}</p>
                          </BoundResearchBox>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'numbers' && (
                   <motion.div key="numbers" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <NumberBox label="Life Path" value={data.numerology.lifePath} delay={0.1} onResearch={() => handleGeneralDeepDive("Life Path Number", `The number ${data.numerology.lifePath} as a Life Path represents your core mission.`)} />
                        <NumberBox label="Expression" value={data.numerology.expression} delay={0.2} onResearch={() => handleGeneralDeepDive("Expression Number", `The number ${data.numerology.expression} as an Expression represents your natural talents.`)} />
                        <NumberBox label="Soul Urge" value={data.numerology.soulUrge} delay={0.3} onResearch={() => handleGeneralDeepDive("Soul Urge Number", `The number ${data.numerology.soulUrge} as a Soul Urge represents your inner desires.`)} />
                      </div>

                      {/* Numerology Bar Chart */}
                      <div className="bg-stone-900/40 rounded-[2.5rem] border border-white/5 p-8 mt-6">
                        <div className="flex items-center justify-between mb-8">
                           <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500 flex items-center gap-2">
                             <BarChart2 className="w-3 h-3 text-emerald-400" />
                             Vibrational Magnitude (Main Numbers)
                           </h3>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Life Path', value: data.numerology.lifePath, fill: '#10b981' },
                              { name: 'Expression', value: data.numerology.expression, fill: '#3b82f6' },
                              { name: 'Soul Urge', value: data.numerology.soulUrge, fill: '#a855f7' }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                              <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333', borderRadius: '12px' }} />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                {
                                  [
                                    { name: 'Life Path', value: data.numerology.lifePath, fill: '#10b981' },
                                    { name: 'Expression', value: data.numerology.expression, fill: '#3b82f6' },
                                    { name: 'Soul Urge', value: data.numerology.soulUrge, fill: '#a855f7' }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))
                                }
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <GematriaVisualizer gematria={data.gematria} name={name} dob={date} />

                      <div className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-[2rem]">
                        <h4 className="text-[10px] uppercase tracking-[0.3em] text-purple-400 mb-4 font-bold flex items-center gap-2">
                           <Zap className="w-3 h-3" />
                           Kabbalah Gematria Reduction
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                           {data.gematria.nameSequence && data.gematria.nameSequence.split(/\s+/).map((val, i) => (
                             <div key={i} className="flex flex-col items-center bg-white/5 border border-white/5 rounded-lg p-2 min-w-[32px]">
                               <span className="text-[10px] text-stone-500 font-mono">{val}</span>
                             </div>
                           ))}
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed italic border-l-2 border-purple-500/30 pl-4 py-1">
                          "The geometry of your names reveals a hidden resonance of {data.gematria.reduction}, a frequency that aligns with the {data.kabbalah.sephirah} sephirah on the Tree of Life."
                        </p>
                      </div>

                      {data.gematria.dobSequence && (
                        <div className="text-center font-mono text-xs text-stone-500 my-2 bg-white/5 py-4 rounded-2xl border border-white/5">
                           <span className="text-[10px] tracking-widest uppercase block mb-2 text-stone-400">Temporal Birth Path</span>
                           <div className="flex justify-center gap-1">
                             {data.gematria.dobSequence.split('').map((d, i) => (
                               <span key={i} className="w-6 h-8 flex items-center justify-center bg-black/40 rounded border border-white/5 text-white">{d}</span>
                             ))}
                           </div>
                        </div>
                      )}

                      <div className="p-5 bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 rounded-2xl">
                        <BoundResearchBox title="Gematria Analysis & Patterns" content={data.gematria.pattern + " reduction: " + data.gematria.reduction} className="bg-transparent p-0 border-0">
                          <h4 className="text-xs uppercase tracking-widest text-blue-300 mb-4 flex justify-between">
                            <span>Gematria & Reduction</span>
                            <span>{data.gematria.nameSequence}</span>
                          </h4>
                          
                          <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                            <span className="text-stone-400">Name Value</span>
                            <motion.span 
                              initial={{ opacity: 0, scale: 0.5, filter: 'blur(4px)' }} 
                              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                              transition={{ duration: 0.6, delay: 0.4 }} 
                              className="text-2xl font-light text-white"
                            >
                              {data.gematria.nameValue}
                            </motion.span>
                          </div>
                          <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                            <span className="text-stone-400">Reduction Sequence</span>
                            <motion.span 
                              initial={{ opacity: 0, scale: 0.5, filter: 'blur(4px)' }} 
                              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                              transition={{ duration: 0.6, delay: 0.5 }} 
                              className="text-2xl font-light text-purple-300"
                            >
                              {data.gematria.reduction}
                            </motion.span>
                          </div>
                          <p className="text-sm text-stone-300 mt-4 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">{data.gematria.pattern}</p>
                        </BoundResearchBox>
                      </div>

                      {data.gematria.numberProperties && (
                         <BoundResearchBox title="Number Properties Research" content={data.gematria.numberProperties} className="bg-teal-900/20 border-teal-500/20">
                           <h4 className="text-[10px] uppercase tracking-widest text-teal-400 mb-2">Number Properties</h4>
                           <p className="text-sm text-stone-300 leading-relaxed font-light">{data.gematria.numberProperties}</p>
                         </BoundResearchBox>
                      )}
                   </motion.div>
                )}

                {activeTab === 'kabbalah' && (
                  <motion.div key="kabbalah" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 mt-12 p-6">
                    <BoundResearchBox title="Mystical Sephirah & Path" content={data.kabbalah.sephirah + " " + data.kabbalah.path} className="max-w-md mx-auto bg-transparent border-0">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-all"></div>
                        <Hexagon className="w-32 h-32 text-purple-500 mx-auto relative z-10 animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <span className="text-3xl font-bold text-white tracking-widest">{data.numerology.lifePath}</span>
                        </div>
                      </div>
                      
                      <div className="relative z-10 space-y-2">
                        <h3 className="text-3xl font-light text-white tracking-[0.2em] uppercase">{data.kabbalah.sephirah}</h3>
                        <p className="text-purple-400 tracking-widest uppercase text-xs">Primary Sephirah Alignment</p>
                      </div>

                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
                        <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">Soul Path Designation</p>
                        <p className="text-xl text-stone-200 font-light italic leading-relaxed">"{data.kabbalah.path}"</p>
                      </div>
                    </BoundResearchBox>
                  </motion.div>
                )}
                {activeTab === 'kabbalistic_numerology' && (
                  <motion.div key="kabbalistic_numerology" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.kabbalisticNumerology ? (
                       <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                         <Network className="w-16 h-16 text-emerald-400 mx-auto opacity-30" />
                         <h3 className="text-xl text-white font-light tracking-widest uppercase">Ancient Links Missing</h3>
                         <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                           "The mathematical mapping of your numbers to the Sephirotic hierarchy requires a complete matrix re-sync."
                         </p>
                         <button 
                           onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                           className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-emerald-900/50"
                         >
                           Unlock Kabbalistic Numerology
                         </button>
                       </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                           <Network className="w-5 h-5 text-emerald-400" />
                           <h3 className="text-xl font-light text-white">Kabbalistic Numerology</h3>
                        </div>
                        
                        <div className="space-y-6">
                           <BoundResearchBox title="Tree of Life Synthesis" content={data.kabbalisticNumerology.treeSynthesis} className="bg-emerald-900/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                             <h4 className="text-xs uppercase tracking-widest text-emerald-400 mb-2">Soul Journey Synthesis</h4>
                             <p className="text-sm font-medium leading-relaxed text-emerald-50">{data.kabbalisticNumerology.treeSynthesis}</p>
                           </BoundResearchBox>

                           <div className="grid gap-6">
                              <CorrespondenceBox 
                                title="Life Path" 
                                number={data.numerology.lifePath}
                                correspondence={data.kabbalisticNumerology.lifePathCorrespondence}
                                color="emerald"
                                onResearch={() => handleGeneralDeepDive(`Life Path ${data.numerology.lifePath} Kabbalah Research`, data.kabbalisticNumerology!.lifePathCorrespondence.meaning)}
                              />
                              <CorrespondenceBox 
                                title="Expression" 
                                number={data.numerology.expression}
                                correspondence={data.kabbalisticNumerology.expressionCorrespondence}
                                color="blue"
                                onResearch={() => handleGeneralDeepDive(`Expression ${data.numerology.expression} Kabbalah Research`, data.kabbalisticNumerology!.expressionCorrespondence.meaning)}
                              />
                              <CorrespondenceBox 
                                title="Soul Urge" 
                                number={data.numerology.soulUrge}
                                correspondence={data.kabbalisticNumerology.soulUrgeCorrespondence}
                                color="purple"
                                onResearch={() => handleGeneralDeepDive(`Soul Urge ${data.numerology.soulUrge} Kabbalah Research`, data.kabbalisticNumerology!.soulUrgeCorrespondence.meaning)}
                              />
                           </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'celestial_dna' && (
                  <motion.div key="celestial_dna" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                     <CelestialDNASection data={data} setActiveTab={setActiveTab} />
                  </motion.div>
                )}
                {activeTab === 'brain' && (
                  <motion.div key="brain" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                     <NeuralBrainSection data={data} setActiveTab={setActiveTab} />
                  </motion.div>
                )}

                {activeTab === 'chakras' && (
                  <motion.div key="chakras" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <ChakraScene data={data} />
                  </motion.div>
                )}
                {activeTab === 'compatibility' && (
                  <motion.div key="compatibility" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <CompatibilityMatrix data={data} />
                  </motion.div>
                )}
                {activeTab === 'angel_numbers' && (
                  <motion.div key="angel_numbers" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <AngelNumbersSection cosmicData={data} />
                  </motion.div>
                )}
                {activeTab === 'vortex' && (
                   <motion.div key="vortex" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="h-full min-h-[500px]">
                      <VortexSequencingSection 
                        cosmicData={data} 
                        vortexMode={vortexMode} 
                        setVortexMode={setVortexMode} 
                      />
                   </motion.div>
                )}
                {activeTab === 'vibrational_tuning' && (
                  <motion.div key="vibrational_tuning" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="h-full min-h-[700px]">
                    <VibrationalTuningSection />
                  </motion.div>
                )}
                {activeTab === 'alignment' && (
                  <motion.div key="alignment" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="h-full min-h-[700px]">
                    <React.Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 text-teal-400 animate-spin" /></div>}>
                      <DailyCosmicPulse />
                    </React.Suspense>
                  </motion.div>
                )}
                {activeTab === 'ai_agents' && (
                  <motion.div key="ai_agents" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="h-full min-h-[700px]">
                    <React.Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>}>
                      <AIAgentsSection cosmicData={data} />
                    </React.Suspense>
                  </motion.div>
                )}
                {activeTab === 'gematria_calc' && (
                  <motion.div key="gematria_calc" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <GematriaCalculatorSection />
                  </motion.div>
                )}

                {activeTab === 'golden_ratio' && (
                  <motion.div key="golden_ratio" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <GoldenRatioSection userIndex={144000} />
                  </motion.div>
                )}
                {activeTab === 'sky_map' && (
                  <motion.div key="sky_map" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <SkyMapSection />
                  </motion.div>
                )}
                {activeTab === 'celestial_sphere' && (
                  <motion.div key="celestial_sphere" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-full w-full justify-center items-center"><div className="w-8 h-8 rounded-full border-t border-indigo-400 animate-spin"></div></div>}>
                      <CelestialSphereSection data={data} />
                    </React.Suspense>
                  </motion.div>
                )}
                {activeTab === 'celestial_blueprint' && (
                  <motion.div key="celestial_blueprint" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <CelestialBlueprintSection data={data} setActiveTab={setActiveTab} />
                  </motion.div>
                )}
                {activeTab === 'astral_canvas' && (
                  <motion.div key="astral_canvas" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6 h-[800px]">
                    <AstralCanvas cosmicData={data} />
                  </motion.div>
                )}
                {activeTab === 'christ_sophia' && (
                  <motion.div key="christ_sophia" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <ChristSophiaSection data={data} />
                  </motion.div>
                )}
                {activeTab === 'soul_path' && (
                  <motion.div key="soul_path" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <SoulPathSection data={data} />
                  </motion.div>
                )}
                {activeTab === 'sandbox' && (
                  <motion.div key="sandbox" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <SandboxSection />
                  </motion.div>
                )}
                {activeTab === 'quantum_fluid' && (
                  <motion.div key="quantum_fluid" initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}} className="w-full h-full min-h-[800px]">
                    <React.Suspense fallback={<div className="flex h-[800px] w-full items-center justify-center bg-black rounded-3xl border border-white/5"><div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>}>
                      <QuantumFluid />
                    </React.Suspense>
                  </motion.div>
                )}
                {activeTab === 'obsidian' && (
                  <motion.div key="obsidian" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6 h-[800px]">
                    <ObsidianVaultSection />
                  </motion.div>
                )}
                {activeTab === 'codex' && (
                  <motion.div key="codex" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6 h-[800px]">
                    <CosmicCodex />
                  </motion.div>
                )}
                {activeTab === 'evolution' && (
                  <motion.div key="evolution" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6 h-[800px]">
                    <AIEvolutionStream />
                  </motion.div>
                )}
                {activeTab === 'tetragrammaton' && (
                  <motion.div key="tetragrammaton" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6 h-[800px]">
                    <TetragrammatonHUD activeTab={activeTab} data={data} />
                  </motion.div>
                )}
                {activeTab === 'freemason33' && (
                  <motion.div key="freemason33" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <Freemason33Section data={data} />
                  </motion.div>
                )}

                {activeTab === 'holographic_rainbow' && (
                  <motion.div key="holographic_rainbow" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <HolographicRainbowSection />
                  </motion.div>
                )}
                {activeTab === 'astraea' && (
                  <motion.div key="astraea" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="h-full">
                    <React.Suspense fallback={<div className="flex h-[600px] w-full items-center justify-center bg-zinc-950 rounded-3xl border border-pink-500/10"><div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" /></div>}>
                      <AstraeaOracle />
                    </React.Suspense>
                  </motion.div>
                )}
                {activeTab === 'flower_of_life' && (
                  <motion.div key="flower_of_life" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <FlowerOfLifeSection />
                  </motion.div>
                )}
                {activeTab === 'chinese_zodiac' && (
                  <motion.div key="chinese_zodiac" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    <ChineseZodiacGnosis />
                  </motion.div>
                )}
                {activeTab === 'destiny_matrix' && (
                  <motion.div key="destiny_matrix" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    <DestinyMatrix data={data} />
                  </motion.div>
                )}
                {activeTab === 'tarot' && (
                  <motion.div key="tarot" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <React.Suspense fallback={<div className="flex h-[600px] w-full items-center justify-center bg-zinc-950 rounded-3xl border border-cyan-500/10"><div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>}>
                      <TarotHologram cosmicData={data} />
                    </React.Suspense>
                  </motion.div>
                )}
                {activeTab === 'astrology_engine' && (
                  <motion.div key="astrology_engine" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    <AstrologyEngine data={data} />
                  </motion.div>
                )}
                {activeTab === '9d_creation' && (
                  <motion.div key="9d_creation" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    <NineDimensionsSection />
                  </motion.div>
                )}
                {activeTab === 'jarvis_os' && (
                  <motion.div key="jarvis_os" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="w-full h-full">
                    <JarvisHUD data={data} setActiveTab={setActiveTab} />
                  </motion.div>
                )}
              </AnimatePresence>
              </React.Suspense>
          </div>
            <div className="p-4 border-t border-white/10 bg-black/20 text-center">
              <button onClick={() => window.location.reload()} className="text-xs uppercase tracking-widest text-stone-500 hover:text-white transition-colors">Reset Environment</button>
            </div>
          </motion.div>
        )}
      </div>

      <DeepDiveModal 
        deepDiveData={deepDiveData} 
        setDeepDiveData={setDeepDiveData} 
        handleSaveToVault={handleSaveToVault} 
        handleReadOutLoud={handleReadOutLoud} 
        isReading={isReading} 
        isDeepDiveLoading={isDeepDiveLoading} 
        handleDeepDiveNext={handleDeepDiveNext} 
        data={data} 
      />

      <HigherMindSettings isOpen={isHigherMindSettingsOpen} onClose={() => setIsHigherMindSettingsOpen(false)} />

      <WorkspaceWidgets
        widgets={activeWorkspaceWidgets}
        onRemoveWidget={handleRemoveWorkspaceWidget}
        onPinToProfile={(id, type, componentName, wdata) => {
          addProfileWidget({ id, type, componentName, data: wdata });
        }}
        profileWidgets={userData?.profileWidgets || []}
        onRemoveProfileWidget={(id) => {
          removeProfileWidget(id);
        }}
      />

    </div>
  );
};

const playTabHoverSound = (tabId?: string) => {
  switch (tabId) {
    case 'planets':
    case 'sky_map':
    case 'torus':
      soundEngine.astrologyHover(); break;
    case 'numbers':
    case 'gematria_calc':
    case 'angel_numbers':
      soundEngine.numerologyHover(); break;
    case 'kabbalah':
    case 'tetragrammaton':
    case 'freemason33':
    case 'chinese_zodiac':
    case 'destiny_matrix':
    case 'tarot':
    case 'christ_sophia':
    case 'kabbalistic_numerology':
      soundEngine.mysticHover(); break;
    case 'brain':
    case 'vortex':
    case 'astral_canvas':
      soundEngine.neuralHover(); break;
    case 'sandbox':
    case 'robotics':
      soundEngine.mechHover(); break;
    default:
      soundEngine.hover();
  }
};

const playTabClickSound = (tabId?: string) => {
  switch (tabId) {
    case 'planets':
    case 'sky_map':
    case 'torus':
      soundEngine.astrologyClick(); break;
    case 'numbers':
    case 'gematria_calc':
    case 'angel_numbers':
      soundEngine.numerologyClick(); break;
    case 'kabbalah':
    case 'tetragrammaton':
    case 'freemason33':
    case 'chinese_zodiac':
    case 'destiny_matrix':
    case 'tarot':
    case 'christ_sophia':
    case 'kabbalistic_numerology':
      soundEngine.mysticClick(); break;
    case 'brain':
    case 'vortex':
    case 'astral_canvas':
      soundEngine.neuralClick(); break;
    case 'sandbox':
    case 'robotics':
      soundEngine.mechClick(); break;
    default:
      soundEngine.select();
  }
};

const Tab = ({ active, children, onClick, icon, tabId }: any) => (
  <button 
    onClick={() => {
      playTabClickSound(tabId);
      onClick();
    }}
    onMouseEnter={() => playTabHoverSound(tabId)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${active ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
  >
    {icon} {children}
  </button>
);

const AstrologyCharts = ({ planets }: { planets: any[] }) => {
  const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  const elementCounts: any = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  planets.forEach(p => {
    if (fireSigns.includes(p.sign)) elementCounts.Fire++;
    else if (earthSigns.includes(p.sign)) elementCounts.Earth++;
    else if (airSigns.includes(p.sign)) elementCounts.Air++;
    else if (waterSigns.includes(p.sign)) elementCounts.Water++;
  });

  const elementData = Object.entries(elementCounts).map(([name, value]) => ({ name, value }));
  const ELEMENT_COLORS: any = { Fire: '#f87171', Earth: '#fbbf24', Air: '#60a5fa', Water: '#34d399' };

  const radarData = planets.map(p => {
    const house = parseInt(p.house);
    const strength = [1, 4, 7, 10].includes(house) ? 10 : ([2, 5, 8, 11].includes(house) ? 7 : 4);

    let color = '#a855f7';
    if (fireSigns.includes(p.sign)) color = ELEMENT_COLORS.Fire;
    else if (earthSigns.includes(p.sign)) color = ELEMENT_COLORS.Earth;
    else if (airSigns.includes(p.sign)) color = ELEMENT_COLORS.Air;
    else if (waterSigns.includes(p.sign)) color = ELEMENT_COLORS.Water;

    return {
      name: p.name,
      strength,
      fullMark: 10,
      color
    };
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectableWidget id="radar-power" type="chart" componentName="Planetary Power Radar" data={radarData}>
          <div className="h-64 w-full bg-black/20 rounded-2xl border border-white/5 p-2 pt-6">
            <h4 className="text-[10px] absolute top-2 left-4 z-10 uppercase tracking-[0.2em] text-stone-500 mb-2 pt-2">Power Radar</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} stroke="none" />
                <Radar
                  name="Planetary Power"
                  dataKey="strength"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.2}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                          <p className="text-xs font-bold text-white mb-1 uppercase tracking-widest">{data.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                            <p className="text-[10px] text-stone-400">Power: <span className="text-white">{data.strength}/10</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ProjectableWidget>

        <ProjectableWidget id="pie-elements" type="chart" componentName="Elements Balance" data={elementData}>
          <div className="h-64 w-full bg-black/20 rounded-2xl border border-white/5 p-2 pt-6">
            <h4 className="text-[10px] absolute top-2 left-4 z-10 uppercase tracking-[0.2em] text-stone-500 mb-2 pt-2">Elemental Balance</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={elementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {elementData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={ELEMENT_COLORS[entry.name]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                          <p className="text-xs font-bold text-white mb-1 uppercase tracking-widest">{data.name}</p>
                          <p className="text-[10px] text-stone-400">Markers: <span className="text-white">{data.value}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 -mt-8 relative z-10">
               {Object.entries(ELEMENT_COLORS).map(([name, color]: [string, any]) => (
                 <div key={name} className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                   <span className="text-[8px] text-stone-500 uppercase tracking-tighter">{name}</span>
                 </div>
               ))}
            </div>
          </div>
        </ProjectableWidget>
      </div>
    </div>
  );
};

const getSignSymbol = (sign: string) => {
  const symbols: any = {
    'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
    'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
    'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
  };
  return symbols[sign] || '';
};

const getSignElement = (sign: string) => {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  const water = ['Cancer', 'Scorpio', 'Pisces'];
  if (fire.includes(sign)) return { name: 'Fire', color: '#f87171' };
  if (earth.includes(sign)) return { name: 'Earth', color: '#fbbf24' };
  if (air.includes(sign)) return { name: 'Air', color: '#60a5fa' };
  if (water.includes(sign)) return { name: 'Water', color: '#34d399' };
  return { name: 'Space', color: '#a855f7' };
};

const CelestialDetailBox = ({ name, data, themeColor = '#a855f7', onResearch }: { name: string, data: any, themeColor?: string, onResearch?: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const element = getSignElement(data.sign);
  const symbol = getSignSymbol(data.sign);

  return (
    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden group/celestial relative">
      {onResearch && (
        <button 
          onClick={(e) => { e.stopPropagation(); onResearch(); }}
          className="absolute top-2 right-12 z-20 opacity-0 group-hover/celestial:opacity-100 transition-opacity bg-stone-800/80 hover:bg-stone-700 p-1.5 rounded-lg text-stone-300 hover:text-white border border-white/10 shadow-xl"
          title="Deep Research"
        >
          <Search className="w-3 h-3" />
        </button>
      )}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-3 flex justify-between items-center hover:bg-white/5 transition-colors relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center border border-white/10 group-hover/celestial:border-purple-500/50 transition-colors">
            <span className="text-lg" style={{ color: element.color }}>{symbol}</span>
          </div>
          <div>
            <span className="text-stone-300 text-sm font-medium block leading-none">{name}</span>
            <span className="text-[10px] text-stone-500 uppercase tracking-tighter">{element.name} Aspect</span>
          </div>
        </div>
        <div className="text-right">
           <span className="text-purple-300 block text-xs font-bold tracking-wide">{data.sign}</span>
           <span className="text-stone-500 text-[10px] uppercase">H{data.house} / {data.degree}°</span>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 text-xs font-light leading-relaxed border-t border-white/5 mt-1 bg-black/40">
              <div className="flex gap-4 mb-4 mt-2">
                 <div className="flex-1 bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                   <div className="text-[9px] text-stone-500 uppercase mb-1">Polarity</div>
                   <div className="text-stone-200">{(['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius'].includes(data.sign)) ? 'Masculine' : 'Feminine'}</div>
                 </div>
                 <div className="flex-1 bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                   <div className="text-[9px] text-stone-500 uppercase mb-1">Modality</div>
                   <div className="text-stone-200">{(['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(data.sign)) ? 'Cardinal' : (['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(data.sign)) ? 'Fixed' : 'Mutable'}</div>
                 </div>
              </div>
              {data.meaning && (
                <p className="mb-3 text-stone-300"><strong style={{ color: themeColor }}>Meaning in H{data.house}: </strong>{data.meaning}</p>
              )}
              {data.treeOfLifeConnection && (
                <p className="text-stone-400 italic"><strong className="text-stone-300 not-italic">Tree of Life: </strong>{data.treeOfLifeConnection}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PointBox = ({ name, data }: { name: string, data: any }) => (
  <div className="bg-purple-900/10 rounded-xl p-3 border border-purple-500/20 text-center">
    <span className="block text-xs text-purple-300/70 uppercase tracking-wider mb-1">{name}</span>
    <div className="font-medium text-stone-200">{data.sign}</div>
    <div className="text-[10px] text-stone-500">H{data.house} / {data.degree}°</div>
  </div>
);

/**
 * GematriaVisualizer Component
 * Visualizes the mathematical reduction and geometric patterns of name and birthday.
 * [GEMATRIA MAPPING & GEOMETRIC VIBRATION]
 */
const GematriaVisualizer = ({ gematria, name, dob }: { gematria: CosmicData['gematria'], name: string, dob?: string }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null);

  const sephirothMap: Record<number, string> = {
    1: 'Kether (The Crown)',
    2: 'Chokmah (Wisdom)',
    3: 'Binah (Understanding)',
    4: 'Chesed (Mercy)',
    5: 'Geburah (Strength)',
    6: 'Tiphareth (Beauty)',
    7: 'Netzach (Victory)',
    8: 'Hod (Majesty)',
    9: 'Yesod (Foundation)',
    10: 'Malkuth (Kingdom)'
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const svg = d3.select(containerRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 500;
    
    // Create Nodes and Links
    const nodes: any[] = [];
    const links: any[] = [];

    // Central reduction node
    nodes.push({ id: 'reduction', label: gematria.reduction.toString(), group: 'reduction' });

    // Name nodes
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const numbers = (gematria.nameSequence || "").match(/\d+/g) || [];
    const displayChars = cleanName.split('');
    const displayNumbers = numbers.slice(0, displayChars.length);

    displayChars.forEach((char, i) => {
      nodes.push({ id: `char-${i}`, label: char, group: 'char' });
      if (displayNumbers[i]) {
        nodes.push({ id: `val-${i}`, label: displayNumbers[i], group: 'val' });
        links.push({ source: `char-${i}`, target: `val-${i}`, value: 1 });
        links.push({ source: `val-${i}`, target: 'reduction', value: 2 });
      }
    });

    // DOB nodes
    if (gematria.dobSequence) {
        const dobDigits = gematria.dobSequence.split('');
        dobDigits.forEach((digit, i) => {
            nodes.push({ id: `dob-${i}`, label: digit, group: 'dob' });
            links.push({ source: `dob-${i}`, target: 'reduction', value: 1.5 });
        });
    }

    // Force Simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(d => d.value === 2 ? 100 : 60))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30));

    // Glow Filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow-gematria");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add geometric background pattern
    const bgPattern = svg.append("g").attr("class", "bg-geometric").attr("opacity", 0.1);
    for (let i = 0; i < 6; i++) {
        bgPattern.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", (i + 1) * 60)
            .attr("fill", "none")
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "2 8")
            .append("animateTransform")
            .attr("attributeName", "transform")
            .attr("type", "rotate")
            .attr("from", `0 ${width / 2} ${height / 2}`)
            .attr("to", `${i % 2 === 0 ? 360 : -360} ${width / 2} ${height / 2}`)
            .attr("dur", `${20 + i * 10}s`)
            .attr("repeatCount", "indefinite");
    }

    // Draw Links
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", d => {
            const sId = typeof d.source === 'string' ? d.source : d.source.id;
            if (sId?.startsWith('dob')) return "rgba(16, 185, 129, 0.2)";
            return "rgba(168, 85, 247, 0.2)";
        })
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", d => {
            const tId = typeof d.target === 'string' ? d.target : d.target.id;
            return tId === 'reduction' ? "4,4" : "none";
        });

    const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended) as any
        )
        .on("mouseenter", (event, d) => {
            let text = "";
            if (d.group === 'reduction') text = `Reduction: ${d.label} - ${sephirothMap[parseInt(d.label)] || 'Core Frequency'}`;
            else if (d.group === 'char') text = `Identity: ${d.label}`;
            else if (d.group === 'val') text = `Value: ${d.label}`;
            else if (d.group === 'dob') text = `Temporal: ${d.label}`;
            setTooltip({ x: event.clientX, y: event.clientY, text });
        })
        .on("mousemove", (event) => {
             setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
        })
        .on("mouseleave", () => setTooltip(null));

    node.append("circle")
        .attr("r", d => d.group === 'reduction' ? 38 : 20)
        .attr("fill", d => {
            if (d.group === 'reduction') return "rgba(232, 121, 249, 0.1)";
            if (d.group === 'dob') return "rgba(16, 185, 129, 0.1)";
            return "rgba(59, 130, 246, 0.1)";
        })
        .attr("stroke", d => {
            if (d.group === 'reduction') return "#e879f9";
            if (d.group === 'dob') return "#10b981";
            if (d.group === 'char') return "#3b82f6";
            return "#a855f7";
        })
        .attr("stroke-width", 2)
        .style("filter", "url(#glow-gematria)");

    node.append("text")
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("fill", "#fff")
        .attr("font-size", d => d.group === 'reduction' ? "20px" : "11px")
        .attr("font-weight", "bold")
        .attr("font-family", "monospace");

    simulation.on("tick", () => {
        link
            .attr("x1", d => (d.source as any).x)
            .attr("y1", d => (d.source as any).y)
            .attr("x2", d => (d.target as any).x)
            .attr("y2", d => (d.target as any).y);

        node
            .attr("transform", d => `translate(${(d as any).x},${(d as any).y})`);
    });

    function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return () => { simulation.stop(); };
  }, [gematria, name]);

  return (
    <div className="w-full flex flex-col items-center bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 my-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Grid className="w-24 h-24 text-white" />
      </div>

      <div className="w-full flex justify-between items-center mb-10 relative z-10">
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <Hexagon size={14} className="text-blue-400" />
                <h4 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-bold">Gematria Neural Lattice</h4>
            </div>
            <span className="text-[9px] text-stone-600 font-mono italic">INTERACTIVE FORCE-DIRECTED MAPPING</span>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[9px] uppercase tracking-widest text-stone-500">Identity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] uppercase tracking-widest text-stone-500">Temporal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span className="text-[9px] uppercase tracking-widest text-stone-500">Reduction</span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[6/5] bg-black/20 rounded-[2.5rem] border border-white/5 cursor-crosshair">
          <svg 
            ref={containerRef} 
            className="w-full h-full" 
            viewBox="0 0 600 500" 
            preserveAspectRatio="xMidYMid meet" 
          />
          <AnimatePresence>
              {tooltip && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    style={{ position: 'fixed', left: tooltip.x + 20, top: tooltip.y + 20 }}
                    className="z-[9999] px-4 py-2 bg-stone-900/90 backdrop-blur-md border border-white/20 rounded-xl text-[10px] text-white font-mono shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-none whitespace-nowrap overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      {tooltip.text}
                  </motion.div>
              )}
          </AnimatePresence>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 w-full grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1.5">
              <span className="text-[9px] text-stone-600 uppercase tracking-widest block font-bold">Signature Archetype</span>
              <span className="text-sm text-white font-light lowercase truncate block">{name}</span>
          </div>
          <div className="space-y-1.5">
              <span className="text-[9px] text-stone-600 uppercase tracking-widest block font-bold">Resonant Identity</span>
              <span className="text-sm text-blue-400 font-mono">{gematria.nameValue}</span>
          </div>
          <div className="space-y-1.5">
              <span className="text-[9px] text-stone-600 uppercase tracking-widest block font-bold">Core Reduction</span>
              <span className="text-sm text-purple-400 font-bold">{gematria.reduction}</span>
          </div>
          <div className="space-y-1.5">
              <span className="text-[9px] text-stone-600 uppercase tracking-widest block font-bold">Sephirotic Force</span>
              <span className="text-sm text-stone-400">{sephirothMap[gematria.reduction]?.split('(')[0] || 'Unmanifest'}</span>
          </div>
      </div>
    </div>
  );
};

const NumberBox = ({ label, value, delay = 0, onResearch }: { label: string, value: number, delay?: number, onResearch?: () => void }) => (
  <div className="group relative bg-white/5 rounded-2xl p-4 border border-white/10 text-center flex flex-col justify-center items-center hover:bg-white/10 transition-all">
    {onResearch && (
      <button 
        onClick={(e) => { e.stopPropagation(); onResearch(); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800/80 hover:bg-stone-700 p-1.5 rounded-lg text-stone-300 hover:text-white border border-white/10 z-10 shadow-xl"
        title="Research Significance"
      >
        <Search className="w-3 h-3" />
      </button>
    )}
    <span className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">{label}</span>
    <motion.span 
      initial={{ opacity: 0, scale: 0.5, y: 10 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      transition={{ duration: 0.5, delay, type: 'spring' }}
      className="text-4xl font-light text-white"
    >
      {value}
    </motion.span>
  </div>
);

const CorrespondenceBox = ({ title, number, correspondence, color, onResearch }: { title: string, number: number, correspondence: any, color: string, onResearch: () => void }) => {
  const colorMap: any = {
    emerald: 'text-emerald-400 bg-emerald-900/10 border-emerald-500/20 shadow-emerald-500/5',
    blue: 'text-blue-400 bg-blue-900/10 border-blue-500/20 shadow-blue-500/5',
    purple: 'text-purple-400 bg-purple-900/10 border-purple-500/20 shadow-purple-500/5'
  };
  
  const activeStyles = colorMap[color] || colorMap.emerald;

  return (
    <div className={`p-6 rounded-2xl border transition-all hover:bg-black/40 relative group ${activeStyles}`}>
       <button 
        onClick={onResearch}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800/80 hover:bg-stone-700 p-2 rounded-lg text-stone-300 hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold border border-white/10 z-10 shadow-xl"
      >
        <Search className="w-3 h-3" />
        Research Deeper
      </button>

       <div className="flex justify-between items-start mb-6">
          <div>
             <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-1">{title} Number</h4>
             <span className="text-4xl font-bold text-white tracking-widest">{number}</span>
          </div>
          <div className="text-right">
             <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-1">Sephirah</h4>
             <button 
              onClick={onResearch}
              className="text-2xl font-light text-white tracking-wide hover:text-emerald-300 transition-colors cursor-pointer"
             >
               {correspondence.sephirah}
             </button>
          </div>
       </div>

       <div className="mb-4">
          <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Path Correspondence</h4>
          <p className="text-stone-300 text-sm font-medium italic">"{correspondence.path}"</p>
       </div>

       <div className="bg-black/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <p className="text-sm font-light leading-relaxed text-stone-300 italic">
             {correspondence.meaning}
          </p>
       </div>
    </div>
  );
};
