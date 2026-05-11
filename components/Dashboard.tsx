import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CosmicData, UserProfileConfig } from '../types';
import { Sparkles, Moon, Sun, Star, Activity, Hexagon, Fingerprint, Network, Menu, X, Camera, Video, ExternalLink, User as UserIcon, LogOut, Edit3, Globe, Compass, Type, BookOpen, Minimize2, Maximize2, Search, BarChart2, PieChart, Zap } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, Pie, PieChart as RechartsPieChart
} from 'recharts';
import { fetchTimelineDepth, fetchTimelineDeepDiveOption, fetchGeneralDeepDive } from '../services/geminiService';
import { User } from 'firebase/auth';

interface DashboardProps {
  data: CosmicData | null;
  onGenerate: (name: string, date: string, time: string, location: string) => void;
  isLoading: boolean;
  activeTab: 'torus' | 'planets' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns';
  setActiveTab: (tab: 'torus' | 'planets' | 'numbers' | 'kabbalah' | 'kabbalistic_numerology' | 'cycles' | 'daily' | 'houses' | 'synthesis' | 'strategy' | 'timeline' | 'name' | 'akashic' | 'patterns') => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  loadedInputs: any;
  profileConfig: UserProfileConfig;
  onUpdateProfile: (config: UserProfileConfig) => void;
}

const ProfileModal = ({ isOpen, onClose, profileConfig, onUpdateProfile, loadedInputs }: { isOpen: boolean, onClose: () => void, profileConfig: UserProfileConfig, onUpdateProfile: (c: UserProfileConfig) => void, loadedInputs: any }) => {
  const [bio, setBio] = useState(profileConfig.bio || '');
  const [bgUrl, setBgUrl] = useState(profileConfig.backgroundUrl || '');
  const [themeColor, setThemeColor] = useState(profileConfig.themeColor || '#a855f7');
  const [astrologicalSign, setAstrologicalSign] = useState(profileConfig.astrologicalSign || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-stone-900 border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-xl font-light text-white mb-6">Customize Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Astrological Sign</label>
            <input type="text" value={astrologicalSign} onChange={e => setAstrologicalSign(e.target.value)} placeholder="e.g. Scorpio Sun, Cancer Moon" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-stone-200 outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Biography</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Share your cosmic journey..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-stone-200 outline-none focus:border-purple-500 h-24 resize-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Background Image URL</label>
            <input type="text" value={bgUrl} onChange={e => setBgUrl(e.target.value)} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-stone-200 outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Theme Color</label>
            <div className="flex gap-2">
              {['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e'].map(color => (
                <button key={color} onClick={() => setThemeColor(color)} className={`w-8 h-8 rounded-full border-2 ${themeColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          
          <button onClick={() => {
            onUpdateProfile({ bio, backgroundUrl: bgUrl, themeColor, astrologicalSign });
            onClose();
          }} className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition-colors">
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ActionMenu = ({ user, data, onSignIn, onSignOut, onEditProfile }: { user: User | null, data: CosmicData | null, onSignIn: () => void, onSignOut: () => void, onEditProfile: () => void }) => {
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
                       {user.photoURL ? (
                         <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                       ) : (
                         <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300"><UserIcon size={16}/></div>
                       )}
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-white">{user.displayName || 'Traveler'}</span>
                         <span className="text-xs text-stone-400 truncate w-32">{user.email}</span>
                       </div>
                     </div>
                     <button onClick={() => { setOpen(false); onEditProfile(); }} className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"><Edit3 size={12}/> Edit Profile Configurations</button>
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

export const Dashboard: React.FC<DashboardProps> = ({ data, onGenerate, isLoading, activeTab, setActiveTab, user, onSignIn, onSignOut, loadedInputs, profileConfig, onUpdateProfile }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const [deepDiveData, setDeepDiveData] = useState<{ 
    title: string; 
    detailedAnalysis: string; 
    followUpOptions: string[]; 
    type: 'general' | 'timeline';
    originalEvent?: any;
  } | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);

  useEffect(() => {
    // Un-minimize when a tab is selected
    setIsMinimized(false);
  }, [activeTab]);

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
    } catch (error) {
      console.error(error);
      setDeepDiveData(null);
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
    } catch (error) {
      console.error(error);
      setDeepDiveData(null);
    } finally {
      setIsDeepDiveLoading(false);
    }
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

  const ResearchBox = ({ title, content, children, className = "" }: { title: string, content: string, children: React.ReactNode, className?: string }) => (
    <div className={`group relative bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all ${className}`}>
      <button 
        onClick={() => handleGeneralDeepDive(title, content)}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800/80 hover:bg-stone-700 p-2 rounded-lg text-stone-300 hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold border border-white/10 z-10 shadow-xl"
      >
        <Search className="w-3 h-3" />
        Research
      </button>
      {children}
    </div>
  );

  const DeepDiveModal = () => {
    if (!deepDiveData) return null;
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          className="bg-stone-900 border border-white/20 p-8 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative scrollbar-thin scrollbar-thumb-white/20"
        >
          <button 
            onClick={() => setDeepDiveData(null)} 
            className="absolute top-6 right-6 text-stone-400 hover:text-white bg-white/5 p-2 rounded-full border border-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-light text-white tracking-wide">Esoteric Research: <span className="font-medium text-purple-200">{deepDiveData.title}</span></h2>
          </div>

          {isDeepDiveLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-stone-400 font-light italic animate-pulse">Accessing the universal knowledge matrix...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="prose prose-invert max-w-none text-stone-300 leading-relaxed font-light text-lg">
                <p className="whitespace-pre-wrap">{deepDiveData.detailedAnalysis}</p>
              </div>

              {deepDiveData.followUpOptions.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/30"></div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold whitespace-nowrap px-4 py-1 bg-purple-900/20 rounded-full border border-purple-500/20">Explore Further Branches</h4>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/30"></div>
                  </div>
                  <div className="grid gap-3">
                    {deepDiveData.followUpOptions.map((opt, i) => (
                      <motion.button 
                        key={i} 
                        whileHover={{ x: 5, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                        onClick={() => handleDeepDiveNext(opt)}
                        className="w-full text-left bg-white/5 border border-white/10 p-5 rounded-2xl text-stone-300 hover:text-white transition-all flex items-center justify-between group shadow-lg hover:shadow-purple-500/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <Compass className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-light italic leading-relaxed">{opt}</span>
                        </div>
                        <Search className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-purple-400" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const themeColor = profileConfig?.themeColor || '#a855f7';

  useEffect(() => {
    if (loadedInputs) {
      setName(loadedInputs.name || '');
      setDate(loadedInputs.date || '');
      setTime(loadedInputs.time || '');
      setLocation(loadedInputs.location || '');
    }
  }, [loadedInputs]);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-8 flex flex-col justify-between overflow-hidden">
      <ActionMenu user={user} data={data} onSignIn={onSignIn} onSignOut={onSignOut} onEditProfile={() => setIsProfileModalOpen(true)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profileConfig={profileConfig || {}} onUpdateProfile={onUpdateProfile} loadedInputs={loadedInputs} />

      {/* Header */}
      <header className="flex justify-between items-center z-10 pointer-events-auto">
        <h1 className="text-3xl font-light text-white tracking-widest drop-shadow-lg flex items-center gap-3">
          <Hexagon style={{ color: themeColor }} />
          ASTRAL MIND
        </h1>
      </header>

      {/* User Customized Profile Presentation */}
      <AnimatePresence>
        {user && profileConfig?.bio && activeTab === 'torus' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-24 left-8 pointer-events-auto max-w-sm backdrop-blur-md bg-black/40 border border-white/10 p-6 rounded-2xl z-20">
            <h2 className="text-xl font-light text-white mb-1 flex items-center gap-2">
              {user.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />}
              {loadedInputs?.name || user.displayName}
            </h2>
            {profileConfig?.astrologicalSign && (
              <p className="text-sm tracking-widest mb-3 uppercase font-semibold" style={{ color: themeColor }}>{profileConfig.astrologicalSign}</p>
            )}
            <p className="text-sm font-light text-stone-300 leading-relaxed italic border-l-2 pl-3" style={{ borderColor: themeColor }}>
              "{profileConfig?.bio}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-start z-10 my-8">
        {!data ? (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl text-white mb-2 font-medium tracking-wide flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Initialize Reading
            </h2>
            <p className="text-stone-300 text-sm mb-8 leading-relaxed">Enter your birth details to generate your immersive cosmic consciousness chart, integrating astrology, numerology, and mathematically generated visual alignments.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); onGenerate(name, date, time, location); }} className="space-y-4">
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
        ) : isMinimized ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-3 shadow-2xl cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setIsMinimized(false)}
          >
            <Maximize2 className="w-6 h-6 text-white" />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-xl h-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={() => setIsMinimized(true)}
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-white/10 p-2 rounded-full border border-white/10 text-stone-400 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <div className="flex border-b border-white/10 p-2 gap-2 overflow-x-auto no-scrollbar pr-14">
              <Tab active={activeTab === 'torus'} onClick={() => setActiveTab('torus')} icon={<Activity className="w-4 h-4"/>}>Soul Blueprint</Tab>
              <Tab active={activeTab === 'planets'} onClick={() => setActiveTab('planets')} icon={<Moon className="w-4 h-4"/>}>Astrology</Tab>
              <Tab active={activeTab === 'houses'} onClick={() => setActiveTab('houses')} icon={<Globe className="w-4 h-4"/>}>Houses</Tab>
              <Tab active={activeTab === 'numbers'} onClick={() => setActiveTab('numbers')} icon={<Fingerprint className="w-4 h-4"/>}>Numerology</Tab>
              <Tab active={activeTab === 'kabbalah'} onClick={() => setActiveTab('kabbalah')} icon={<Hexagon className="w-4 h-4"/>}>Mysticism</Tab>
              <Tab active={activeTab === 'kabbalistic_numerology'} onClick={() => setActiveTab('kabbalistic_numerology')} icon={<Network className="w-4 h-4"/>}>Kabbalistic Numerology</Tab>
              <Tab active={activeTab === 'cycles'} onClick={() => setActiveTab('cycles')} icon={<Star className="w-4 h-4"/>}>Cycles</Tab>
              <Tab active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} icon={<Sun className="w-4 h-4"/>}>Forecasts</Tab>
              <Tab active={activeTab === 'synthesis'} onClick={() => setActiveTab('synthesis')} icon={<Network className="w-4 h-4"/>}>Synthesis</Tab>
              <Tab active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} icon={<Compass className="w-4 h-4"/>}>Life Strategy</Tab>
              <Tab active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Activity className="w-4 h-4"/>}>Timeline</Tab>
              <Tab active={activeTab === 'name'} onClick={() => setActiveTab('name')} icon={<Type className="w-4 h-4"/>}>Name Analysis</Tab>
              <Tab active={activeTab === 'akashic'} onClick={() => setActiveTab('akashic')} icon={<BookOpen className="w-4 h-4"/>}>Akashic Records</Tab>
              <Tab active={activeTab === 'patterns'} onClick={() => setActiveTab('patterns')} icon={<Fingerprint className="w-4 h-4"/>}>Synchronicities</Tab>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/20">
              <AnimatePresence mode="wait">
                <DeepDiveModal />
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
                          <ResearchBox title="Core Esoteric Theme" content={data.patterns.coreTheme} className="bg-teal-900/10 border-teal-500/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                            <h4 className="text-[10px] uppercase tracking-widest text-teal-400 mb-2">Core Theme</h4>
                            <p className="text-sm text-stone-200 leading-relaxed font-light">{data.patterns.coreTheme}</p>
                          </ResearchBox>
                          
                          <div className="grid gap-4 md:grid-cols-2">
                            {data.patterns.synchronicities.map((sync, i) => (
                              <ResearchBox key={i} title={`Synchronicity: ${sync.title}`} content={sync.description} className="bg-white/5">
                                <h4 className="text-sm font-medium text-teal-300 mb-2 flex items-center gap-2"><Network className="w-4 h-4"/> {sync.title}</h4>
                                <p className="text-sm text-stone-300 font-light leading-relaxed">{sync.description}</p>
                              </ResearchBox>
                            ))}
                          </div>
                          
                          <ResearchBox title="Cosmic Interesting Facts Exploration" content={data.patterns.interestingFacts.join('\n')}>
                            <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Interesting Facts</h4>
                            <ul className="space-y-3">
                              {data.patterns.interestingFacts.map((fact, i) => (
                                <li key={i} className="text-sm text-stone-300 font-light leading-relaxed flex items-start gap-3">
                                  <span className="text-teal-500/50 mt-1">•</span>
                                  <span>{fact}</span>
                                </li>
                              ))}
                            </ul>
                          </ResearchBox>
                        </div>
                      </>
                    )}
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
                          <ResearchBox title="Akashic: Soul Origin" content={data.akashic.soulOrigin}>
                            <Section title="Soul Origin" content={data.akashic.soulOrigin} />
                          </ResearchBox>
                          <ResearchBox title="Akashic: Past Life Themes" content={data.akashic.pastLifeThemes}>
                            <Section title="Past Life Themes" content={data.akashic.pastLifeThemes} />
                          </ResearchBox>
                          <ResearchBox title="Akashic: Karmic Debts" content={data.akashic.karmicDebts}>
                            <Section title="Karmic Debts & Lessons" content={data.akashic.karmicDebts} />
                          </ResearchBox>
                          <ResearchBox title="Akashic: Soul Gifts" content={data.akashic.soulGifts}>
                            <Section title="Soul Gifts" content={data.akashic.soulGifts} />
                          </ResearchBox>
                          
                          <ResearchBox title="Guide Message Research" content={data.akashic.guardianMessage} className="bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                            <h4 className="text-sm uppercase tracking-widest text-indigo-300 mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4" /> Message from your Guides
                            </h4>
                            <p className="text-md text-indigo-100 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4">{data.akashic.guardianMessage}</p>
                          </ResearchBox>
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
                          <ResearchBox title="Personal Universe Correlation" content={data.lifeStrategy.universeCorrelation}>
                            <h4 className="text-xs uppercase tracking-widest text-teal-300 mb-3 block">Personal Universe Correlation</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-200">{data.lifeStrategy.universeCorrelation}</p>
                          </ResearchBox>

                          <ResearchBox title="Kabbalah & Numerology Depth" content={data.lifeStrategy.kabbalahNumerologyDepth}>
                            <h4 className="text-xs uppercase tracking-widest text-teal-300 mb-3 block">Kabbalah & Numerology Depth</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-200">{data.lifeStrategy.kabbalahNumerologyDepth}</p>
                          </ResearchBox>

                          <ResearchBox title="Personal Goal Plan" content={data.lifeStrategy.goalPlan} className="bg-teal-900/10 border-teal-500/20">
                            <h4 className="text-xs uppercase tracking-widest text-teal-400 mb-3 block">Goal Plan</h4>
                            <p className="text-sm font-medium leading-relaxed text-stone-200">{data.lifeStrategy.goalPlan}</p>
                          </ResearchBox>

                          <ResearchBox title="Strategy: Moving Forward" content={data.lifeStrategy.movingForward} className="bg-black/30 border-white/5">
                            <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3 block">Moving Forward</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-300">{data.lifeStrategy.movingForward}</p>
                          </ResearchBox>
                        </div>
                      </>
                    )}
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
                          <ResearchBox title="Morning & Evening Stars Significance" content={data.advancedCycles.morningEveningStars.meaning}>
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
                          </ResearchBox>

                          <ResearchBox title="Arabic Lots Interpretation" content={data.advancedCycles.arabicLots.meaning}>
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
                          </ResearchBox>

                          {data.advancedCycles.planetPhases && (
                            <ResearchBox title="Planetary Phases Analysis" content={data.advancedCycles.planetPhases.map(p => `${p.name}: ${p.phase}`).join(', ')}>
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
                            </ResearchBox>
                          )}

                          {data.advancedCycles.soliArcs && (
                            <ResearchBox title="Soli-Arcs Cosmic Fusion" content={data.advancedCycles.soliArcs.map(a => a.description).join('; ')} className="bg-orange-900/10 border-orange-500/20">
                              <h4 className="text-xs uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2"><Sun className="w-4 h-4"/> Soli-Arcs</h4>
                              <div className="space-y-3">
                                {data.advancedCycles.soliArcs.map((arc, i) => (
                                  <div key={i} className="flex flex-col gap-1 border-b border-orange-500/10 pb-2">
                                    <span className="text-xs text-orange-200 font-medium">{arc.description}</span>
                                    <p className="text-xs text-stone-400 font-light">{arc.meaning}</p>
                                  </div>
                                ))}
                              </div>
                            </ResearchBox>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'houses' && (
                  <motion.div key="houses" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    {!data.houses ? (
                      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 text-center space-y-4">
                        <Globe className="w-16 h-16 text-indigo-400 mx-auto opacity-30" />
                        <h3 className="text-xl text-white font-light tracking-widest uppercase">Realms Uncharted</h3>
                        <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed italic">
                          "The 12 astrological houses that structure your earthly existence await their final mapping."
                        </p>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto">Re-initialize your data to generate the detailed descriptions for all 12 realms of life.</p>
                        <button 
                          onClick={() => loadedInputs ? onGenerate(loadedInputs.name, loadedInputs.date, loadedInputs.time, loadedInputs.location) : window.location.reload()}
                          className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-indigo-900/50"
                        >
                          Map the 12 Realms
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                          <Globe className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-xl font-light text-white">The 12 Realms</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {data.houses.map((house) => (
                             <ResearchBox key={house.houseNumber} title={`Astrological House ${house.houseNumber}: ${house.realmName}`} content={house.description}>
                               <div className="flex justify-between items-center mb-2">
                                 <h4 className="text-sm font-medium text-indigo-300">House {house.houseNumber}</h4>
                                 <span className="text-xs uppercase tracking-widest text-indigo-400 font-light">{house.realmName}</span>
                               </div>
                               <p className="text-xs font-light leading-relaxed text-stone-300">{house.description}</p>
                             </ResearchBox>
                          ))}
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

                        <div className="space-y-4 mb-8">
                          <ResearchBox title="Daily Horoscope Research" content={data.dailyInsight.horoscope}>
                            <h4 className="text-xs uppercase tracking-widest text-blue-400 mb-2">Horoscope</h4>
                            <p className="text-sm font-light leading-relaxed text-stone-200">{data.dailyInsight.horoscope}</p>
                          </ResearchBox>

                          <ResearchBox title="Daily Affirmation Deep Dive" content={data.dailyInsight.affirmation} className="bg-purple-900/20 border-purple-500/20">
                            <h4 className="text-xs uppercase tracking-widest text-purple-400 mb-2">Affirmation</h4>
                            <p className="text-sm font-medium italic text-purple-200">"{data.dailyInsight.affirmation}"</p>
                          </ResearchBox>

                          <div className="grid grid-cols-2 gap-4">
                            <ResearchBox title="Daily Cautionary Influence" content={data.dailyInsight.caution} className="bg-red-900/10 border-red-500/10">
                              <h4 className="text-xs uppercase tracking-widest text-red-400/80 mb-2">Caution</h4>
                              <p className="text-xs font-light text-stone-300 leading-relaxed">{data.dailyInsight.caution}</p>
                            </ResearchBox>
                            <ResearchBox title="Daily Key Universal Interest" content={data.dailyInsight.keyInterest} className="bg-emerald-900/10 border-emerald-500/20">
                              <h4 className="text-xs uppercase tracking-widest text-emerald-400/80 mb-2">Key Interest</h4>
                              <p className="text-xs font-light text-stone-300 leading-relaxed">{data.dailyInsight.keyInterest}</p>
                            </ResearchBox>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ResearchBox title="Age Significance Meaning" content={data.dailyInsight.ageSignificance} className="bg-black/30 border-white/5">
                              <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Age Significance</h4>
                              <p className="text-sm text-stone-300">{data.dailyInsight.ageSignificance}</p>
                            </ResearchBox>
                            
                            <ResearchBox title="Time & Date Space Correlation" content={data.dailyInsight.timeDateCorrelation} className="bg-black/30 border-white/5">
                              <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Time & Date Correlation</h4>
                              <p className="text-sm text-stone-300">{data.dailyInsight.timeDateCorrelation}</p>
                            </ResearchBox>
                          </div>
                        </div>

                        {/* Weekly */}
                        {data.weeklyInsight && (
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                              <h3 className="text-lg font-light text-indigo-300">Weekly Forecast</h3>
                              <span className="text-[10px] uppercase tracking-widest text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/20">{data.weeklyInsight.theme}</span>
                            </div>
                            <ResearchBox title={`Weekly Outlook: ${data.weeklyInsight.theme}`} content={data.weeklyInsight.horoscope} className="bg-indigo-900/10 border-indigo-500/10">
                              <p className="text-sm font-light leading-relaxed text-stone-300">{data.weeklyInsight.horoscope}</p>
                            </ResearchBox>
                          </div>
                        )}

                        {/* Monthly */}
                        {data.monthlyInsight && (
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 border-b border-fuchsia-500/20 pb-4">
                              <h3 className="text-lg font-light text-fuchsia-300">Monthly Forecast</h3>
                              <span className="text-[10px] uppercase tracking-widest text-fuchsia-400 bg-fuchsia-900/30 px-2 py-0.5 rounded border border-fuchsia-500/20">{data.monthlyInsight.theme}</span>
                            </div>
                            <ResearchBox title={`Monthly Outlook: ${data.monthlyInsight.theme}`} content={data.monthlyInsight.horoscope} className="bg-fuchsia-900/10 border-fuchsia-500/10">
                              <p className="text-sm font-light leading-relaxed text-stone-300">{data.monthlyInsight.horoscope}</p>
                            </ResearchBox>
                          </div>
                        )}

                        {/* Yearly */}
                        {data.yearlyInsight && (
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
                              <h3 className="text-lg font-light text-amber-300">Yearly Forecast</h3>
                              <span className="text-[10px] uppercase tracking-widest text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded border border-amber-500/20">{data.yearlyInsight.theme}</span>
                            </div>
                            <ResearchBox title={`Yearly Outlook: ${data.yearlyInsight.theme}`} content={data.yearlyInsight.horoscope} className="bg-amber-900/10 border-amber-500/10">
                              <p className="text-sm font-light leading-relaxed text-stone-300">{data.yearlyInsight.horoscope}</p>
                            </ResearchBox>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
                {activeTab === 'torus' && (
                  <motion.div key="torus" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6 text-stone-200 font-light leading-relaxed">
                    <ResearchBox title="Torus: Body & Flow" content={data.torusAnalysis.bodyAndFlow}>
                      <Section title="Body & Flow" content={data.torusAnalysis.bodyAndFlow} />
                    </ResearchBox>
                    <ResearchBox title="Torus: Mind & Spirit" content={data.torusAnalysis.mindAndSpiritual}>
                      <Section title="Mind & Spirit" content={data.torusAnalysis.mindAndSpiritual} />
                    </ResearchBox>
                    <ResearchBox title="Torus: Cosmic Alignment" content={data.torusAnalysis.cosmicAlignment}>
                      <Section title="Cosmic Alignment" content={data.torusAnalysis.cosmicAlignment} />
                    </ResearchBox>
                    <ResearchBox title="Torus Reading Synthesis" content={data.torusAnalysis.overallAnalogy} className="bg-purple-900/20 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                      <h4 className="text-purple-300 font-medium mb-2">Synthesis</h4>
                      <p className="text-sm">{data.torusAnalysis.overallAnalogy}</p>
                    </ResearchBox>
                  </motion.div>
                )}
                
                {activeTab === 'planets' && (
                  <motion.div key="planets" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="p-5 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-3xl border border-purple-500/30 shadow-xl overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Zap className="w-24 h-24 text-amber-400" />
                        </div>
                        <h4 className="text-[10px] uppercase tracking-widest text-purple-400 mb-1">Dominant Force</h4>
                        <div className="flex items-end gap-2 mb-2">
                           <span className="text-2xl font-light text-white">{data.planets[0].name}</span>
                           <span className="text-xs text-purple-300 pb-1 italic">in {data.planets[0].sign}</span>
                        </div>
                        <p className="text-[10px] text-stone-400 leading-relaxed italic">The most resonant celestial frequency in your natal matrix.</p>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-3xl border border-emerald-500/30 shadow-xl overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Globe className="w-24 h-24 text-emerald-400" />
                        </div>
                        <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 mb-1">Elemental Signature</h4>
                        <div className="flex items-end gap-2 mb-2">
                           <span className="text-2xl font-light text-white">
                             {(() => {
                               const counts: any = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
                               data.planets.forEach(p => {
                                 if (['Aries', 'Leo', 'Sagittarius'].includes(p.sign)) counts.Fire++;
                                 else if (['Taurus', 'Virgo', 'Capricorn'].includes(p.sign)) counts.Earth++;
                                 else if (['Gemini', 'Libra', 'Aquarius'].includes(p.sign)) counts.Air++;
                                 else if (['Cancer', 'Scorpio', 'Pisces'].includes(p.sign)) counts.Water++;
                               });
                               return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
                             })()}
                           </span>
                           <span className="text-xs text-emerald-300 pb-1 italic">Dominance</span>
                        </div>
                        <p className="text-[10px] text-stone-400 leading-relaxed italic">Your soul's primary elemental resonance in this incarnation.</p>
                      </div>
                    </div>

                    <div className="mb-8 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <BarChart2 className="w-24 h-24 text-purple-500" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-xl font-light text-white mb-2 flex items-center gap-2">
                          <BarChart2 className="w-5 h-5 text-purple-400" />
                          Planetary Power Distribution
                        </h3>
                        <p className="text-xs text-stone-400 mb-6 font-light">Calculated based on house placement and elemental dignity.</p>
                        <AstrologyCharts planets={data.planets} />
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 mb-4 italic text-center">Click any planetary body to explore its deep meaning and Tree of Life connection.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {data.planets.map(p => (
                        <ResearchBox key={p.name} title={`Planetary Influence: ${p.name}`} content={p.meaning} className="bg-transparent p-0 border-0 hover:border-0">
                          <CelestialDetailBox name={p.name} data={p} themeColor={themeColor} />
                        </ResearchBox>
                      ))}
                    </div>
                    <h3 className="text-sm uppercase tracking-widest text-stone-400 mb-3 text-center">Nodes & Points</h3>
                    <div className="grid grid-cols-1 gap-3">
                       <ResearchBox title="North Node Deep Dive" content={data.nodes.north.meaning} className="p-0 border-0"><CelestialDetailBox name="North Node" data={data.nodes.north} themeColor={themeColor} /></ResearchBox>
                       <ResearchBox title="South Node Deep Dive" content={data.nodes.south.meaning} className="p-0 border-0"><CelestialDetailBox name="South Node" data={data.nodes.south} themeColor={themeColor} /></ResearchBox>
                       <ResearchBox title="Vertex Connection" content={data.points.vertex.meaning} className="p-0 border-0"><CelestialDetailBox name="Vertex" data={data.points.vertex} themeColor={themeColor} /></ResearchBox>
                       <ResearchBox title="Part of Fortune Analysis" content={data.points.partOfFortune.meaning} className="p-0 border-0"><CelestialDetailBox name="Part of Fortune" data={data.points.partOfFortune} themeColor={themeColor} /></ResearchBox>
                       <ResearchBox title="Chiron Healing Research" content={data.points.chiron.meaning} className="p-0 border-0"><CelestialDetailBox name="Chiron" data={data.points.chiron} themeColor={themeColor} /></ResearchBox>
                       <ResearchBox title="Black Moon Lilith Shadow" content={data.points.blackMoonLilith.meaning} className="p-0 border-0"><CelestialDetailBox name="Lilith" data={data.points.blackMoonLilith} themeColor={themeColor} /></ResearchBox>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'cycles' && data.advancedCycles && (
                  <motion.div key="cycles" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                    <ResearchBox title="Morning & Evening Stars Significance" content={data.advancedCycles.morningEveningStars.meaning}>
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
                    </ResearchBox>

                    <ResearchBox title="Arabic Lots Interpretation" content={data.advancedCycles.arabicLots.meaning} className="bg-white/5 border-white/10">
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
                    </ResearchBox>

                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-3 ml-2">Notable Asteroids</h4>
                      <div className="space-y-3">
                        {data.advancedCycles.notableAsteroids.map(ast => (
                          <ResearchBox key={ast.name} title={`Asteroid Research: ${ast.name}`} content={ast.meaning} className="bg-black/30 border-white/5">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-emerald-300 font-medium">{ast.name}</span>
                              <span className="text-xs text-stone-400">{ast.sign}</span>
                            </div>
                            <p className="text-xs leading-relaxed text-stone-300">{ast.meaning}</p>
                          </ResearchBox>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'numbers' && (
                   <motion.div key="numbers" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <NumberBox label="Life Path" value={data.numerology.lifePath} delay={0.1} />
                        <NumberBox label="Expression" value={data.numerology.expression} delay={0.2} />
                        <NumberBox label="Soul Urge" value={data.numerology.soulUrge} delay={0.3} />
                      </div>

                      {data.gematria.dobSequence && (
                        <div className="text-center font-mono text-xs text-stone-500 my-2">
                           <span className="text-[10px] tracking-widest uppercase block mb-1">Birth Date Path</span>
                           {data.gematria.dobSequence}
                        </div>
                      )}

                      <div className="p-5 bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 rounded-2xl">
                        <ResearchBox title="Gematria Analysis & Patterns" content={data.gematria.pattern + " reduction: " + data.gematria.reduction} className="bg-transparent p-0 border-0">
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
                        </ResearchBox>
                      </div>

                      {data.gematria.numberProperties && (
                         <ResearchBox title="Number Properties Research" content={data.gematria.numberProperties} className="bg-teal-900/20 border-teal-500/20">
                           <h4 className="text-[10px] uppercase tracking-widest text-teal-400 mb-2">Number Properties</h4>
                           <p className="text-sm text-stone-300 leading-relaxed font-light">{data.gematria.numberProperties}</p>
                         </ResearchBox>
                      )}
                   </motion.div>
                )}

                {activeTab === 'kabbalah' && (
                  <motion.div key="kabbalah" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 mt-12 p-6">
                    <ResearchBox title="Mystical Sephirah & Path" content={data.kabbalah.sephirah + " " + data.kabbalah.path} className="max-w-md mx-auto bg-transparent border-0">
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
                    </ResearchBox>
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
                           <ResearchBox title="Tree of Life Synthesis" content={data.kabbalisticNumerology.treeSynthesis} className="bg-emerald-900/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                             <h4 className="text-xs uppercase tracking-widest text-emerald-400 mb-2">Soul Journey Synthesis</h4>
                             <p className="text-sm font-medium leading-relaxed text-emerald-50">{data.kabbalisticNumerology.treeSynthesis}</p>
                           </ResearchBox>

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
              </AnimatePresence>
            </div>
            <div className="p-4 border-t border-white/10 bg-black/20 text-center">
              <button onClick={() => window.location.reload()} className="text-xs uppercase tracking-widest text-stone-500 hover:text-white transition-colors">Reset Environment</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const Tab = ({ active, children, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${active ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
  >
    {icon} {children}
  </button>
);

const Section = ({ title, content }: { title: string, content: string }) => (
  <div>
    <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-2">{title}</h3>
    <p className="text-sm bg-white/5 p-4 rounded-2xl border border-white/5">{content}</p>
  </div>
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
    // Strength based on house
    let strength = 0;
    const house = parseInt(p.house);
    if ([1, 4, 7, 10].includes(house)) strength = 10;
    else if ([2, 5, 8, 11].includes(house)) strength = 7;
    else strength = 4;

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
        <div className="h-64 w-full bg-black/20 rounded-2xl border border-white/5 p-2">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2 pl-4 pt-2">Power Radar</h4>
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

        <div className="h-64 w-full bg-black/20 rounded-2xl border border-white/5 p-2">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2 pl-4 pt-2">Elemental Balance</h4>
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

const CelestialDetailBox = ({ name, data, themeColor = '#a855f7' }: { name: string, data: any, themeColor?: string }) => {
  const [expanded, setExpanded] = React.useState(false);
  const element = getSignElement(data.sign);
  const symbol = getSignSymbol(data.sign);

  return (
    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden group/celestial">
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

const NumberBox = ({ label, value, delay = 0 }: { label: string, value: number, delay?: number }) => (
  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center flex flex-col justify-center items-center">
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
