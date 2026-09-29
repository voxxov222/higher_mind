import { create } from 'zustand';
import { UserProfileConfig, CosmicWidget } from '../types';
import { saveAstralProfile } from './socialService';

interface ProfileStore {
  config: UserProfileConfig | null;
  isEditing: boolean;
  setConfig: (config: UserProfileConfig) => void;
  setEditing: (isEditing: boolean) => void;
  updateMindMap: (mindMap: any) => void;
  updateWidget: (widgetId: string, updates: Partial<CosmicWidget>) => void;
  addWidget: (widget: CosmicWidget) => void;
  removeWidget: (widgetId: string) => void;
  updateTheme: (updates: Partial<UserProfileConfig['theme']>) => void;
  addToVault: (title: string, content: string, category: string, tags?: string[]) => void;
  saveProfile: () => Promise<void>;
}

export const DEFAULT_PROFILE_CONFIG: UserProfileConfig = {
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

export const useProfileStore = create<ProfileStore>((set, get) => ({
  config: DEFAULT_PROFILE_CONFIG,
  isEditing: false,
  setConfig: (config) => set({ config }),
  setEditing: (isEditing) => set({ isEditing }),
  addToVault: (title, content, category, tags = []) => {
    const config = get().config;
    if (!config) return;
    const newItem = {
      id: Math.random().toString(36).substring(7),
      title,
      content,
      category,
      timestamp: Date.now(),
      tags
    };
    set({ config: { ...config, researchVault: [...config.researchVault, newItem] } });
  },
  updateMindMap: (mindMap) => {
    const config = get().config;
    if (!config) return;
    // We'll store it in a special widget or a top level field if we update types later
    // For now let's find a 'cosmic_stats' or similar widget to store it in, or just keep it in researchVault
    set({ config: { ...config, researchVault: [...config.researchVault, { id: 'mindmap', title: 'Cosmic Mind Map', content: JSON.stringify(mindMap), category: 'synthesis', timestamp: Date.now() }] } });
  },
  updateWidget: (widgetId, updates) => {
    const config = get().config;
    if (!config || !config.layout || !config.layout.widgets) return;
    const widgets = config.layout.widgets.map((w) =>
      w.id === widgetId ? { ...w, ...updates } : w
    );
    set({ config: { ...config, layout: { ...config.layout, widgets } } });
  },
  addWidget: (widget) => {
    const config = get().config;
    if (!config || !config.layout || !config.layout.widgets) return;
    set({ config: { ...config, layout: { ...config.layout, widgets: [...config.layout.widgets, widget] } } });
  },
  removeWidget: (widgetId) => {
    const config = get().config;
    if (!config || !config.layout || !config.layout.widgets) return;
    set({
      config: {
        ...config,
        layout: {
          ...config.layout,
          widgets: config.layout.widgets.filter((w) => w.id !== widgetId),
        },
      },
    });
  },
  updateTheme: (updates) => {
    const config = get().config;
    if (!config) return;
    set({ config: { ...config, theme: { ...config.theme, ...updates } } });
  },
  saveProfile: async () => {
    const config = get().config;
    if (!config) return;
    try {
      await saveAstralProfile(config.userId, config);
    } catch (error) {
      console.error('Failed to save profile', error);
    }
  },
}));
