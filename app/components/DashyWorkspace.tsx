import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Edit2, Plus, Trash2, GripHorizontal, Check, X,
  ExternalLink, Layers, Search, LayoutGrid, Terminal, Command
} from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

export interface DashyConfig {
  appConfig: {
    theme: string;
    layout: 'auto' | 'horizontal' | 'vertical';
    iconSize: 'small' | 'medium' | 'large';
  };
  pageInfo: {
    title: string;
    description: string;
    navLinks: { title: string; path: string }[];
  };
  sections: DashySection[];
}

export interface DashySection {
  name: string;
  icon: string;
  displayData: 'grid' | 'list';
  items: DashyItem[];
}

export interface DashyItem {
  title: string;
  description: string;
  icon: string;
  url?: string;
  target?: string;
  component?: string; // If it maps to a platform tab
}

const DEFAULT_CONFIG: DashyConfig = {
  appConfig: {
    theme: 'nord',
    layout: 'auto',
    iconSize: 'medium'
  },
  pageInfo: {
    title: 'Cosmic Control Center',
    description: 'Personalized dashboard for your astral navigation nodes',
    navLinks: []
  },
  sections: [
    {
      name: 'Core Synthesis',
      icon: 'fas fa-brain',
      displayData: 'grid',
      items: [
        { title: 'Glass Dashboard', description: 'Main Telemetry Overview', icon: 'fas fa-border-all', component: 'glass_dashboard' },
        { title: 'The Big Picture', description: 'Overall Cosmic Synthesis', icon: 'fas fa-eye', component: 'the_big_picture' },
        { title: 'Virtual Workspace', description: 'Holographic Node Canvas', icon: 'fas fa-project-diagram', component: 'virtual_workspace' },
        { title: 'Astral OS', description: 'Unified Command Interface', icon: 'fas fa-terminal', component: 'astral_os' }
      ]
    },
    {
      name: 'Astrological Sciences',
      icon: 'fas fa-star',
      displayData: 'grid',
      items: [
        { title: 'Astrology Engine', description: 'Vedic & Western Charts', icon: 'fas fa-meteor', component: 'astrology_engine' },
        { title: 'Soul Path', description: 'North/South Node Destiny', icon: 'fas fa-route', component: 'soul_path' },
        { title: 'Star Chart 3D', description: 'Interactive Hologram', icon: 'fas fa-globe', component: 'star_chart' },
        { title: 'Chinese Zodiac', description: 'Bazi & I Ching Analysis', icon: 'fas fa-yin-yang', component: 'chinese_zodiac' }
      ]
    },
    {
      name: 'Numerical Mysticism',
      icon: 'fas fa-calculator',
      displayData: 'grid',
      items: [
        { title: 'Gematria HUD', description: 'Numerical Decoding', icon: 'fas fa-hashtag', component: 'gematria_calc' },
        { title: 'Kabbalistic Tree', description: 'Sephirot Emanations', icon: 'fas fa-tree', component: 'kabbalah' },
        { title: 'Angel Numbers', description: 'Synchronicities', icon: 'fas fa-feather', component: 'angel_numbers' },
        { title: 'Golden Ratio', description: 'Phi Proportions', icon: 'fas fa-infinity', component: 'golden_ratio' }
      ]
    },
    {
      name: 'Esoteric Archives',
      icon: 'fas fa-book',
      displayData: 'grid',
      items: [
        { title: 'Tarot Arcana', description: 'Divination Spreads', icon: 'fas fa-cards', component: 'tarot' },
        { title: 'Past Life Echoes', description: 'Karmic Imprints', icon: 'fas fa-history', component: 'past_life_echoes' },
        { title: 'Akashic Records', description: 'Deep Memory Access', icon: 'fas fa-scroll', component: 'akashic' },
        { title: 'Freemasonry 33', description: 'Masonic Symbolism', icon: 'fas fa-compass', component: 'freemason33' }
      ]
    }
  ]
};

export const DashyWorkspace = ({ 
  setActiveTab 
}: { 
  setActiveTab: (tab: string) => void 
}) => {
  const [config, setConfig] = useState<DashyConfig>(DEFAULT_CONFIG);
  const [isEditing, setIsEditing] = useState(false);
  const [editorText, setEditorText] = useState(JSON.stringify(DEFAULT_CONFIG, null, 2));

  useEffect(() => {
    const saved = localStorage.getItem('dashy_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setEditorText(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error("Failed to parse Dashy config", e);
      }
    }
  }, []);

  const handleSaveConfig = () => {
    try {
      const parsed = JSON.parse(editorText);
      setConfig(parsed);
      localStorage.setItem('dashy_config', JSON.stringify(parsed));
      setIsEditing(false);
      soundEngine.click();
    } catch (e) {
      alert("Invalid JSON configuration");
    }
  };

  const handleItemClick = (item: DashyItem) => {
    soundEngine.select();
    if (item.component) {
      setActiveTab(item.component);
    } else if (item.url) {
      window.open(item.url, item.target || '_blank');
    }
  };

  return (
    <div className="w-full h-full bg-stone-950 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-4 md:p-8">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{config.pageInfo.title}</h1>
          <p className="text-stone-400 mt-1">{config.pageInfo.description}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-stone-300 rounded-xl transition-colors"
          >
            {isEditing ? <X size={16} /> : <Settings size={16} />}
            <span className="text-xs uppercase tracking-widest">{isEditing ? 'Cancel' : 'Configure'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-stone-900 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={14} className="text-cyan-400" /> JSON Configuration
                </h3>
                <button 
                  onClick={handleSaveConfig}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg text-xs font-bold uppercase transition-colors"
                >
                  <Check size={14} /> Save & Apply
                </button>
              </div>
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="w-full h-96 bg-black/50 border border-white/5 rounded-xl p-4 text-stone-300 font-mono text-xs focus:outline-none focus:border-cyan-500/30 resize-none"
                spellCheck={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Sections */}
      <div className={`flex flex-col gap-8 ${config.appConfig.layout === 'horizontal' ? 'md:flex-row md:flex-wrap' : ''}`}>
        {config.sections.map((section, idx) => (
          <div key={idx} className={`${config.appConfig.layout === 'horizontal' ? 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]' : 'w-full'}`}>
            <h2 className="text-lg font-medium text-stone-200 mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="p-1.5 bg-white/5 rounded-lg text-stone-400">
                <Layers size={14} />
              </span>
              {section.name}
            </h2>
            
            <div className={section.displayData === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'flex flex-col gap-2'}>
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  onClick={() => handleItemClick(item)}
                  className={`
                    group relative bg-stone-900 border border-white/5 hover:border-white/20 hover:bg-white/5 
                    transition-all overflow-hidden text-left flex
                    ${section.displayData === 'grid' ? 'flex-col items-center justify-center p-4 rounded-2xl aspect-square text-center hover:scale-105' : 'items-center gap-4 p-3 rounded-xl'}
                  `}
                >
                  {item.component ? (
                    <div className={`
                      flex items-center justify-center bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform
                      ${section.displayData === 'grid' ? 'w-12 h-12 mb-3' : 'w-10 h-10'}
                    `}>
                      <Command size={section.displayData === 'grid' ? 24 : 18} />
                    </div>
                  ) : (
                    <div className={`
                      flex items-center justify-center bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform
                      ${section.displayData === 'grid' ? 'w-12 h-12 mb-3' : 'w-10 h-10'}
                    `}>
                      <ExternalLink size={section.displayData === 'grid' ? 24 : 18} />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className={`font-medium text-stone-200 ${section.displayData === 'grid' ? 'text-xs' : 'text-sm'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-stone-500 line-clamp-2 ${section.displayData === 'grid' ? 'text-[9px] mt-1' : 'text-xs'}`}>
                      {item.description}
                    </p>
                  </div>

                  {item.url && section.displayData === 'list' && (
                    <ExternalLink size={14} className="text-stone-600 group-hover:text-cyan-400 transition-colors ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {config.sections.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center border border-dashed border-white/10 rounded-3xl">
            <LayoutGrid size={48} className="text-stone-700 mb-4" />
            <p className="text-stone-400">No sections configured.</p>
            <p className="text-stone-500 text-sm mt-1">Click "Configure" to add your first Dashy section.</p>
          </div>
        )}
      </div>

    </div>
  );
};
