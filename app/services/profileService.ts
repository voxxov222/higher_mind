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

export const useProfileStore = create<ProfileStore>((set, get) => ({
  config: null,
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
