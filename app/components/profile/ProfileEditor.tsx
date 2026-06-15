import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Sparkles, 
  Zap, Save, 
  RefreshCw, Edit3,
  Compass, Moon, Sun
} from 'lucide-react';
import { useProfileStore } from '../../services/profileService';
import { fetchCosmicChatResponse } from '../../services/geminiService';
import { UserProfileConfig } from '../../types';
import clsx from 'clsx';

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SPIRITUAL_PRACTICES = [
  "Meditation", "Astrology", "Tarot", "Journaling", "Yoga", 
  "Energy Work", "Ritual", "Breathwork", "Chanting", "Moon Phases"
];

const RESONANCE_LEVELS: Record<number, { name: string, color: string, description: string }> = {
  1: { name: "Awakening", color: "#FFB6C1", description: "Just beginning spiritual journey. Curious and seeking." },
  2: { name: "Exploring", color: "#FFD700", description: "Actively studying. Learning and questioning." },
  3: { name: "Deepening", color: "#87CEEB", description: "Regular practice. Noticeable shifts. Committed." },
  4: { name: "Connected", color: "#9370DB", description: "Aligned with wisdom. Intuitive and embodied." },
  5: { name: "Mastery", color: "#FFD700", description: "Living cosmic truth. Guiding others." }
};

const ProfileEditor = ({ onClose }: { onClose: () => void }) => {
  const { config, setConfig, saveProfile } = useProfileStore();
  const [localConfig, setLocalConfig] = useState<UserProfileConfig | null>(null);
  const [isAIAssisting, setIsAIAssisting] = useState(false);
  const [step, setStep] = useState<'info' | 'astrology' | 'practices' | 'bio'>('info');

  useEffect(() => {
    if (config) setLocalConfig(JSON.parse(JSON.stringify(config)));
  }, [config]);

  if (!localConfig) return null;

  const handleUpdate = (field: string, value: any) => {
    setLocalConfig(prev => {
      if (!prev) return prev;
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        const updated = { ...prev };
        let current: any = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      }
    });
  };

  const handleAIAssist = async () => {
    if (!localConfig) return;
    setIsAIAssisting(true);
    try {
      const response = await fetchCosmicChatResponse(
        `Please help me improve my astral bio. My current info is: name ${localConfig.displayName}, sun ${localConfig.astrology?.sunSign}, practices ${localConfig.bio.spiritualPractices?.join(', ')}. Write a 2-3 sentence profound bio that captures my cosmic essence.`,
        [],
        null // We could pass current config if needed
      );
      
      if ((response as any).suggestedProfileUpdate?.bio) {
        handleUpdate('bio.text', (response as any).suggestedProfileUpdate.bio);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handleSave = async () => {
    if (localConfig) {
      setConfig(localConfig);
      await saveProfile();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-3xl p-4 md:p-8"
    >
      <div className="w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        {/* Progress Sidebar */}
        <div className="w-full md:w-64 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <h2 className="text-xl font-bold tracking-tight">Profile</h2>
              </div>

              <div className="space-y-2">
                 {[
                   { id: 'info', label: 'Identity', icon: <User className="w-4 h-4" /> },
                   { id: 'astrology', label: 'Blueprint', icon: <Compass className="w-4 h-4" /> },
                   { id: 'practices', label: 'Practices', icon: <Zap className="w-4 h-4" /> },
                   { id: 'bio', label: 'Essence', icon: <Edit3 className="w-4 h-4" /> }
                 ].map(s => (
                   <button
                    key={s.id}
                    onClick={() => setStep(s.id as any)}
                    className={clsx(
                      "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all",
                      step === s.id ? "bg-white/10 text-white font-bold" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                   >
                     {s.icon}
                     <span className="text-sm uppercase tracking-widest leading-none">{s.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="mt-8 pt-8 border-t border-white/5">
              <button 
                onClick={handleSave}
                className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all mb-3 flex items-center justify-center gap-2"
              >
                 <Save className="w-4 h-4" />
                 Sync Changes
              </button>
              <button 
                onClick={onClose}
                className="w-full text-white/40 hover:text-white font-bold uppercase tracking-widest text-[10px] py-2 transition-all"
              >
                 Exit Space
              </button>
           </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[80vh] scrollbar-hide">
           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-10"
             >
                {step === 'info' && (
                  <>
                    <Header title="Stellar Identity" description="Refine how you manifest in the digital realm." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Input 
                        label="Account Handle" 
                        value={localConfig.username} 
                        onChange={(v) => handleUpdate('username', v)} 
                        icon={<span className="text-purple-400">@</span>}
                       />
                       <Input 
                        label="Display Name" 
                        value={localConfig.displayName} 
                        onChange={(v) => handleUpdate('displayName', v)} 
                       />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                       <Input 
                        label="Banner Image URL" 
                        value={localConfig.bannerUrl || ''} 
                        onChange={(v) => handleUpdate('bannerUrl', v)} 
                       />
                       <div className="space-y-3">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block">Preferred Color</label>
                          <div className="flex gap-4 items-center">
                             <input 
                               type="color" 
                               value={localConfig.theme.primaryColor || '#9333ea'} 
                               onChange={(e) => handleUpdate('theme.primaryColor', e.target.value)}
                               className="w-12 h-12 rounded-xl bg-transparent border border-white/10 p-1 cursor-pointer"
                             />
                             <span className="text-xs opacity-40 font-mono uppercase tracking-widest">{localConfig.theme.primaryColor || '#9333ea'}</span>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block">Resonance Level</label>
                       <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {Object.entries(RESONANCE_LEVELS).map(([level, info]) => (
                            <button
                              key={level}
                              onClick={() => handleUpdate('astrology.resonanceLevel', parseInt(level))}
                              className={clsx(
                                "p-4 rounded-3xl border transition-all text-left group",
                                (localConfig.astrology?.resonanceLevel || 1) === parseInt(level) 
                                  ? "bg-white/10 border-white/20 ring-2 ring-purple-500/50" 
                                  : "bg-white/5 border-white/5 hover:bg-white/10 text-white/40"
                              )}
                            >
                               <div className="font-bold text-xs mb-1 group-hover:text-white transition-colors">{info.name}</div>
                               <div className="text-[8px] uppercase tracking-widest opacity-50">Level {level}</div>
                            </button>
                          ))}
                       </div>
                    </div>
                  </>
                )}

                {step === 'astrology' && (
                  <>
                    <Header title="Soul Blueprint" description="Declare your cosmic origins/placements." />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <SignPicker 
                        label="Sun Sign" 
                        value={localConfig.astrology?.sunSign || ''} 
                        onChange={(v) => handleUpdate('astrology.sunSign', v)} 
                        icon={<Sun className="w-4 h-4 text-yellow-400" />}
                       />
                       <SignPicker 
                        label="Moon Sign" 
                        value={localConfig.astrology?.moonSign || ''} 
                        onChange={(v) => handleUpdate('astrology.moonSign', v)} 
                        icon={<Moon className="w-4 h-4 text-blue-300" />}
                       />
                       <SignPicker 
                        label="Rising Sign" 
                        value={localConfig.astrology?.risingSign || ''} 
                        onChange={(v) => handleUpdate('astrology.risingSign', v)} 
                        icon={<Compass className="w-4 h-4 text-purple-400" />}
                       />
                    </div>

                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                       <div className="flex items-center gap-4 mb-6">
                          <Zap className="w-6 h-6 text-purple-400" />
                          <div>
                             <h4 className="font-bold text-lg">Master Number</h4>
                             <p className="text-xs text-white/40">Enter your core vibration (11, 22, 33)</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          {[11, 22, 33].map(num => (
                            <button
                              key={num}
                              onClick={() => handleUpdate('astrology.masterNumber', num)}
                              className={clsx(
                                "flex-1 p-6 rounded-2xl border transition-all text-center",
                                localConfig.astrology?.masterNumber === num 
                                  ? "bg-purple-600/20 border-purple-500 text-white" 
                                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                              )}
                            >
                               <span className="text-2xl font-bold">{num}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  </>
                )}

                {step === 'practices' && (
                  <>
                    <Header title="Ritual & Practice" description="What spiritual vectors do you actively engage?" />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                       {SPIRITUAL_PRACTICES.map(p => (
                         <button
                          key={p}
                          onClick={() => {
                            const current = localConfig.bio.spiritualPractices || [];
                            const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
                            handleUpdate('bio.spiritualPractices', next);
                          }}
                          className={clsx(
                            "p-4 rounded-3xl border transition-all text-[10px] uppercase font-bold tracking-widest",
                            (localConfig.bio.spiritualPractices || []).includes(p)
                              ? "bg-white/20 border-white/30 text-white"
                              : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                          )}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                  </>
                )}

                {step === 'bio' && (
                  <>
                    <Header title="Cosmic Essence" description="Summon words to describe your journey." />
                    <div className="space-y-6">
                       <div className="relative">
                          <textarea
                            value={localConfig.bio.text}
                            onChange={(e) => handleUpdate('bio.text', e.target.value)}
                            placeholder="Celestial architect mapping the intersection..."
                            className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 h-48 text-lg font-light leading-relaxed focus:outline-none focus:border-purple-500/40 transition-all resize-none"
                            maxLength={300}
                          />
                          <div className="absolute bottom-4 right-8 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            {localConfig.bio.text.length}/300
                          </div>
                       </div>

                       <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 rounded-[32px] bg-purple-500/5 border border-purple-500/10">
                          <div className="flex items-center gap-4">
                             <RefreshCw className={clsx("w-6 h-6 text-purple-400", isAIAssisting && "animate-spin")} />
                             <div>
                                <h4 className="font-bold text-sm">Divine Scribe</h4>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Generate bio with AI</p>
                             </div>
                          </div>
                          <button 
                            onClick={handleAIAssist}
                            disabled={isAIAssisting}
                            className="w-full md:w-auto px-8 py-3 rounded-2xl bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                          >
                             {isAIAssisting ? 'Summoning...' : 'Summon Wisdom'}
                          </button>
                       </div>
                    </div>
                  </>
                )}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Header = ({ title, description }: { title: string; description: string }) => (
  <div>
    <h3 className="text-3xl font-bold tracking-tight mb-2">{title}</h3>
    <p className="text-sm text-white/40">{description}</p>
  </div>
);

const Input = ({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode }) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block">{label}</label>
    <div className="relative group">
       {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">{icon}</div>}
       <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-6 focus:outline-none focus:border-purple-500/50 transition-all text-sm",
          icon ? "pl-12" : "pl-6"
        )}
       />
    </div>
  </div>
);

const SignPicker = ({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon: React.ReactNode }) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block">{label}</label>
    <div className="relative flex items-center group">
       <div className="absolute left-6 pointer-events-none group-focus-within:scale-110 transition-transform">{icon}</div>
       <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 appearance-none focus:outline-none focus:border-purple-500/50 transition-all text-sm font-bold"
       >
         <option value="" className="bg-zinc-900">Select Sign</option>
         {ZODIAC_SIGNS.map(s => (
           <option key={s} value={s} className="bg-zinc-900">{s}</option>
         ))}
       </select>
    </div>
  </div>
);

export default ProfileEditor;
