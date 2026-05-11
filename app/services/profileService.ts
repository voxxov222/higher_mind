import { create } from 'zustand';
import { UserProfileConfig, CosmicWidget } from '../types';

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
  saveProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  config: null,
  isEditing: false,
  setConfig: (config) => set({ config }),
  setEditing: (isEditing) => set({ isEditing }),
  updateMindMap: (mindMap) => {
    const config = get().config;
    if (!config) return;
    // We'll store it in a special widget or a top level field if we update types later
    // For now let's find a 'cosmic_stats' or similar widget to store it in, or just keep it in researchVault
    set({ config: { ...config, researchVault: [...config.researchVault, { id: 'mindmap', title: 'Cosmic Mind Map', content: JSON.stringify(mindMap), category: 'synthesis', timestamp: Date.now() }] } });
  },
  updateWidget: (widgetId, updates) => {
    const config = get().config;
    if (!config) return;
    const widgets = config.layout.widgets.map((w) =>
      w.id === widgetId ? { ...w, ...updates } : w
    );
    set({ config: { ...config, layout: { ...config.layout, widgets } } });
  },
  addWidget: (widget) => {
    const config = get().config;
    if (!config) return;
    set({ config: { ...config, layout: { ...config.layout, widgets: [...config.layout.widgets, widget] } } });
  },
  removeWidget: (widgetId) => {
    const config = get().config;
    if (!config) return;
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
    // Implementation for Firebase save will go here
    console.log('Saving profile...', get().config);
  },
}));
