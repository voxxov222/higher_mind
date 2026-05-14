import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Settings, Share2, Plus, Layout as LayoutIcon, 
  Palette, Grid, Globe, Twitter, Instagram, 
  Github, Music, Video, Star, Zap, Info, MessageSquare, 
  Moon, Sun, Compass, Sparkles, Edit3, X, Save,
  Users, Users2, MessageCircle
} from 'lucide-react';
import StarField from './StarField';
import HolographicPanel from './HolographicPanel';
import { SoulAvatar } from './SoulAvatar';
import { useProfileStore } from '../../services/profileService';
import { UserProfileConfig, CosmicWidget } from '../../types';
import CommunityFeed from '../social/CommunityFeed';
import LiveMessenger from '../social/LiveMessenger';
import { Wall } from '../social/Wall';
import ProfileEditor from './ProfileEditor';
import clsx from 'clsx';

const CosmicProfile = ({ initialConfig }: { initialConfig?: UserProfileConfig }) => {
  const { config, isEditing, setConfig, setEditing, updateWidget, addWidget, removeWidget, updateTheme, saveProfile } = useProfileStore();
  const [activeLayout, setActiveLayout] = useState<'bento' | 'free' | 'column'>('bento');
  const [currentView, setCurrentView] = useState<'profile' | 'community' | 'messages'>('profile');
  const [showEditor, setShowEditor] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; profile: UserProfileConfig } | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else if (!config) {
      // Default initial state for demo
      const defaultConfig: UserProfileConfig = {
        userId: 'demo-user',
        username: 'cosmic_traveler',
        displayName: 'Aria Starlight',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
        avatarType: 'image',
        bannerUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=1200&h=400',
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
          widgets: [
            { id: '1', type: 'bio', title: 'Cosmic Bio', layout: { x: 0, y: 0, w: 2, h: 1 } },
            { id: '2', type: 'astrology', title: 'Soul Blueprint', layout: { x: 2, y: 0, w: 1, h: 2 } },
            { id: '3', type: 'energy', title: 'Energy State', layout: { x: 0, y: 1, w: 1, h: 1 } },
            { id: '4', type: 'socials', title: 'Connections', layout: { x: 1, y: 1, w: 1, h: 1 } },
          ],
          mainLayoutType: 'bento',
          snapToGrid: true
        },
        socialLinks: [
          { platform: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
          { platform: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
        ],
        bio: {
          text: "Celestial architect mapping the intersection of ancient wisdom and futuristic tech. Always dreaming in stardust.",
          moodStatus: "Exploring the 5th Dimension"
        },
        researchVault: []
      };
      setConfig(defaultConfig);
    }
  }, [initialConfig, setConfig, config]);

  if (!config) return <div className="h-screen bg-black flex items-center justify-center text-white">Initializing Universe...</div>;

  return (
    <div className="min-h-screen text-white relative font-sans overflow-hidden">
      <StarField />
      
      {/* Dynamic Overlay Gradient based on theme */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${config.theme.primaryColor}22 0%, transparent 70%)`
        }}
      />

      {/* Top Navigation / Controls */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-0.5 animate-pulse">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-sm font-bold tracking-[0.4em] uppercase text-white/90 group-hover:text-white transition-colors">Cosmos OS</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
            {[
              { id: 'profile', icon: <User className="w-4 h-4" />, label: 'My Space' },
              { id: 'community', icon: <Globe className="w-4 h-4" />, label: 'Community' },
              { id: 'messages', icon: <MessageCircle className="w-4 h-4" />, label: 'Messages' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setCurrentView(v.id as any)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-2 rounded-full transition-all",
                  currentView === v.id ? "bg-white/10 text-white font-bold" : "text-white/40 hover:text-white"
                )}
              >
                {v.icon}
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">{v.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Refine Profile</span>
          </button>
          
          <button className="p-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        
        <AnimatePresence mode="wait">
          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Profile Header Block */}
              <section className="mb-12 relative group">
                <div className="relative h-[300px] rounded-[40px] overflow-hidden border border-white/10 group">
                   <img 
                     src={config.bannerUrl} 
                     alt="Banner" 
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000 scale-105 group-hover:scale-100"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                   
                   {/* Floating UI Elements over banner */}
                   <div className="absolute bottom-8 left-8 flex items-end gap-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 blur-[30px] opacity-40 animate-pulse" />
                        <div className="w-32 h-32 rounded-3xl border-2 border-white/20 p-1 bg-black/40 backdrop-blur-md relative z-10 overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                          <img src={config.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                        </div>
                      </div>
                      
                      <div className="mb-2">
                         <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-bold tracking-tight text-white">{config.displayName}</h1>
                            <div className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] uppercase font-bold tracking-widest text-white/50">Verified Soul</div>
                         </div>
                         <p className="text-white/60 font-light flex items-center gap-2">
                           <span className="text-purple-400">@</span>{config.username}
                           <span className="w-1 h-1 rounded-full bg-white/20" />
                           <span className="italic text-white/40">{config.bio.moodStatus}</span>
                         </p>
                      </div>
                   </div>
                </div>
              </section>

              {/* Dynamic Grid System */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                 {config.layout.widgets.map((widget) => (
                   <WidgetRenderer key={widget.id} widget={widget} config={config} />
                 ))}
                 
                 {isEditing && (
                   <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className="flex flex-col items-center justify-center p-12 rounded-[40px] border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-white/30 hover:text-purple-400 group"
                   >
                      <Plus className="w-8 h-8 mb-4 group-hover:rotate-90 transition-transform duration-500" />
                      <span className="text-xs font-bold uppercase tracking-widest">Add Module</span>
                   </motion.button>
                 )}
              </div>
              
              {/* Wall Section */}
              <div className="w-full">
                 <Wall profileId={config.userId} readOnly={false} />
              </div>
            </motion.div>
          )}

          {currentView === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <CommunityFeed />
            </motion.div>
          )}

          {currentView === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-5xl mx-auto"
            >
              <LiveMessenger 
                recipientId={activeChat?.id} 
                recipientProfile={activeChat?.profile}
                onClose={() => setActiveChat(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {showEditor && <ProfileEditor onClose={() => setShowEditor(false)} />}
      </AnimatePresence>

      {/* Editor Sidebar/Panel (Conditional) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed top-24 right-6 bottom-6 w-80 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400">Space Customizer</h2>
               <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-8">
               {/* Sections */}
               <div>
                 <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-4">Mood & Color</span>
                 <div className="grid grid-cols-5 gap-2">
                   {['#a855f7', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b'].map(color => (
                     <button 
                       key={color}
                       onClick={() => updateTheme({ primaryColor: color })}
                       className={`w-full aspect-square rounded-full transition-transform hover:scale-110 ${config.theme.primaryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''}`}
                       style={{ background: color }}
                     />
                   ))}
                 </div>
               </div>

               <div>
                 <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-4">Background Layer</span>
                 <div className="space-y-2">
                   {['stars', 'nebula', 'aurora', 'none'].map(effect => (
                     <button 
                       key={effect}
                       onClick={() => updateTheme({ backgroundEffect: effect as any })}
                       className={`w-full text-left p-3 rounded-xl border text-[10px] uppercase tracking-widest font-bold transition-all ${config.theme.backgroundEffect === effect ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                     >
                       {effect}
                     </button>
                   ))}
                 </div>
               </div>
               
               <div>
                 <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-4">Layout Architecture</span>
                 <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all">
                       <Grid className="w-4 h-4 text-purple-400" />
                       <span className="text-[8px] uppercase tracking-widest font-bold">Bento Matrix</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 opacity-50 cursor-not-allowed">
                       <LayoutIcon className="w-4 h-4 text-blue-400" />
                       <span className="text-[8px] uppercase tracking-widest font-bold">Fluid Canvas</span>
                    </button>
                 </div>
               </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
               <button 
                onClick={async () => {
                  await saveProfile();
                  setEditing(false);
                }}
                className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 rounded-2xl hover:scale-[1.02] transition-all active:scale-95"
               >
                 Propagate Changes
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WidgetRenderer = ({ widget, config }: { widget: CosmicWidget; config: UserProfileConfig }) => {
  const isEditing = useProfileStore(s => s.isEditing);
  const removeWidget = useProfileStore(s => s.removeWidget);

  const colSpan = widget.layout.w === 2 ? 'md:col-span-2' : '';
  const rowSpan = widget.layout.h === 2 ? 'md:row-span-2' : '';

  return (
    <HolographicPanel 
      title={widget.title} 
      className={clsx(colSpan, rowSpan, "relative")}
      glowColor={config.theme.primaryColor + '33'}
      icon={getIconForType(widget.type)}
    >
      {isEditing && (
        <button 
          onClick={() => removeWidget(widget.id)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all z-20"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="h-full">
        {renderWidgetContent(widget, config)}
      </div>
    </HolographicPanel>
  );
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'bio': return <Edit3 className="w-4 h-4 opacity-70" />;
    case 'astrology': return <Zap className="w-4 h-4 opacity-70" />;
    case 'socials': return <Share2 className="w-4 h-4 opacity-70" />;
    case 'energy': return <Sparkles className="w-4 h-4 opacity-70" />;
    default: return <Info className="w-4 h-4 opacity-70" />;
  }
};

const renderWidgetContent = (widget: CosmicWidget, config: UserProfileConfig) => {
  switch (widget.type) {
    case 'bio':
      return (
        <div className="p-2">
          <p className="text-xl font-light leading-relaxed text-white/80 italic">"{config.bio.text}"</p>
          <div className="mt-6 flex flex-wrap gap-2">
             {['Architect', 'Dreamer', 'Digital Nomad', 'Stargazer'].map(tag => (
               <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-white/40">{tag}</span>
             ))}
          </div>
        </div>
      );
    case 'socials':
      return (
        <div className="grid grid-cols-2 gap-3 h-full items-center">
           {config.socialLinks.map(link => (
             <a 
               key={link.platform} 
               href={link.url} 
               target="_blank" 
               rel="noreferrer"
               className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center gap-2 group"
             >
                {link.platform === 'Twitter' ? <Twitter className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" /> : <Instagram className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />}
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{link.platform}</span>
             </a>
           ))}
        </div>
      );
    case 'energy':
      return (
        <div className="flex flex-col justify-center h-full">
           <div className="flex items-end justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-white/40">Vibrational State</span>
              <span className="text-2xl font-bold text-purple-400">92%</span>
           </div>
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
              />
           </div>
           <p className="text-[10px] text-white/40 mt-4 italic">High resonance with lunar cycles</p>
        </div>
      );
    case 'astrology':
      return (
        <div className="flex flex-col h-full">
           <div className="flex-1 min-h-[250px] relative">
              <SoulAvatar color={config.theme.primaryColor} />
              <div className="absolute top-0 left-0 p-4">
                 <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40 mb-1">Soul Signature</div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    <span className="text-xs font-light text-white/60">Resonating...</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-2 mt-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                 <div className="flex items-center gap-3">
                   <Sun className="w-4 h-4 text-yellow-400" />
                   <span className="text-[10px] uppercase tracking-widest text-white/50">Sun</span>
                 </div>
                 <span className="text-xs font-bold">Leo</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                 <div className="flex items-center gap-3">
                   <Moon className="w-4 h-4 text-blue-300" />
                   <span className="text-[10px] uppercase tracking-widest text-white/50">Moon</span>
                 </div>
                 <span className="text-xs font-bold">Pisces</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                 <div className="flex items-center gap-3">
                   <Compass className="w-4 h-4 text-purple-400" />
                   <span className="text-[10px] uppercase tracking-widest text-white/50">Rising</span>
                 </div>
                 <span className="text-xs font-bold">Scorpio</span>
              </div>
           </div>
        </div>
      );
    default:
      return <div className="p-4 text-white/40 italic">Module under construction...</div>;
  }
};

export default CosmicProfile;
