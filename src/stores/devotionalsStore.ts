import { create } from 'zustand';
import { DevotionalMonth } from '@/src/screens/Home/Devotionals/DevotionalsSidebar';
import { DevotionalStorage, REFRESH_CONFIG } from '@/src/utils/DevotionalStorage';


export interface DevotionalTheme {
  id: string;
  backgroundColor: string;
  textColor: string;
  panelBackground: string;
  panelTextColor: string;
  accentColor: string;
  sidebarBackground: string;
  sidebarTextColor: string;
  headerButtonBackground?: string;
  headerButtonBorderColor?: string;
  headerButtonBorderWidth?: number;
}
interface RefreshState {
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  lastRefresh: Date | null;
  isAutoRefreshing: boolean;
  refreshCount: number; // Track number of refreshes
}

interface DevotionalsState {
  // UI State
  sidebarVisible: boolean;
  settingsVisible: boolean;
  selectedThemeId: string;
  fontSize: number;
  currentMonth: DevotionalMonth | null;
  currentDayNumber: number;
  showVideoIntro: boolean;
  pendingVideoUrl: string | null;
  videoKey: number;
  isLoadingEntry: boolean;
  currentDevotionalId: number | null;
  isNavigating: boolean;
  showCompletion: boolean;

  // Refresh State
  refreshState: RefreshState;

  // Refresh trigger for sidebar
  refreshTrigger: number;

  // Pull-to-refresh state
  isRefreshing: boolean;

  // Theme options
  themeOptions: DevotionalTheme[];

  // Actions
  setSidebarVisible: (visible: boolean) => void;
  setSettingsVisible: (visible: boolean) => void;
  setSelectedThemeId: (id: string) => void;
  setFontSize: (size: number) => void;
  setCurrentMonth: (month: DevotionalMonth | null) => void;
  setCurrentDayNumber: (day: number) => void;
  setShowVideoIntro: (show: boolean) => void;
  setPendingVideoUrl: (url: string | null) => void;
  incrementVideoKey: () => void;
  setIsLoadingEntry: (loading: boolean) => void;
  setCurrentDevotionalId: (id: number | null) => void;
  setIsNavigating: (navigating: boolean) => void;
  setShowCompletion: (show: boolean) => void;

  // Refresh Actions
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setLastRefresh: (date: Date | null) => void;
  setIsAutoRefreshing: (refreshing: boolean) => void;
  incrementRefreshCount: () => void;
  resetRefreshCount: () => void;
  
  // Refresh trigger action
  triggerRefresh: () => void;
  
  // Pull-to-refresh action
  setIsRefreshing: (refreshing: boolean) => void;
  
  // Utility Actions
  initializeFromStorage: () => Promise<void>;
  saveRefreshPreferences: () => Promise<void>;
}

export const useDevotionalsStore = create<DevotionalsState>((set, get) => ({
  // Initial state
  sidebarVisible: false,
  settingsVisible: true,
  selectedThemeId: "classic",
  fontSize: 18,
  currentMonth: null,
  currentDayNumber: 1,
  showVideoIntro: false,
  pendingVideoUrl: null,
  videoKey: 0,
  isLoadingEntry: false,
  currentDevotionalId: null,
  isNavigating: false,
  showCompletion: false,

  // Initial refresh state
  refreshState: {
    autoRefreshEnabled: true,
    refreshInterval: REFRESH_CONFIG.AUTO_REFRESH_INTERVAL,
    lastRefresh: null,
    isAutoRefreshing: false,
    refreshCount: 0,
  },

  // Initial refresh trigger
  refreshTrigger: 0,

  // Initial pull-to-refresh state
  isRefreshing: false,

  themeOptions: [
    {
      id: "classic",
      backgroundColor: "#FFFFFF",
      textColor: "#0C154C",
      panelBackground: "#FFFFFF",
      panelTextColor: "#0C154C",
      accentColor: "#FFFFFF",
      sidebarBackground: "#FFFFFF",
      sidebarTextColor: "#0C154C"
    },
    {
      id: "sepia",
      backgroundColor: "#f5ebdd",
      textColor: "#523015",
      panelBackground: "#f5ebdd",
      panelTextColor: "#523015",
      accentColor: "#B47733",
      sidebarBackground: "#F4E3CF",
      sidebarTextColor: "#523015",
      headerButtonBackground: "#ffffff",
      headerButtonBorderColor: "#f5ebdd",
      headerButtonBorderWidth: 1,
    },
    {
      id: "mist",
      backgroundColor: "#e5e5e5",
      textColor: "#081C2B",
      panelBackground: "#e5e5e5",
      panelTextColor: "#081C2B",
      accentColor: "#2E5E86",
      sidebarBackground: "#e5e5e5",
      sidebarTextColor: "#081C2B",
      headerButtonBackground: "#ffffff",
      headerButtonBorderColor: "#ffffff",
      headerButtonBorderWidth: 1,
    },
    {
      id: "midnight",
      backgroundColor: "#000",
      textColor: "#F4F4F8",
      panelBackground: "#000",
      panelTextColor: "#F4F4F8",
      accentColor: "#000",
      sidebarBackground: "#000",
      sidebarTextColor: "#F4F4F8"
    },
  ],

  // Basic Actions
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setSettingsVisible: (visible) => set({ settingsVisible: visible }),
  setSelectedThemeId: (id) => set({ selectedThemeId: id }),
  setFontSize: (size) => set({ fontSize: size }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setCurrentDayNumber: (day) => set({ currentDayNumber: day }),
  setShowVideoIntro: (show: boolean) => set({ showVideoIntro: show }),
  setPendingVideoUrl: (url) => set({ pendingVideoUrl: url }),
  incrementVideoKey: () => set((state) => ({ videoKey: state.videoKey + 1 })),
  setIsLoadingEntry: (loading) => set({ isLoadingEntry: loading }),
  setCurrentDevotionalId: (id) => set({ currentDevotionalId: id }),
  setIsNavigating: (navigating) => set({ isNavigating: navigating }),
  setShowCompletion: (show: boolean) => set({ showCompletion: show }),

  // Refresh Actions
  setAutoRefreshEnabled: (enabled) => {
    set((state) => ({
      refreshState: {
        ...state.refreshState,
        autoRefreshEnabled: enabled,
      }
    }));
    
    // Save to storage
    get().saveRefreshPreferences();
    
    console.log(`✅ Auto-refresh ${enabled ? 'enabled' : 'disabled'}`);
  },

  setRefreshInterval: (interval) => {
    set((state) => ({
      refreshState: {
        ...state.refreshState,
        refreshInterval: interval,
      }
    }));
    
    get().saveRefreshPreferences();
    
    console.log(`✅ Refresh interval set to ${Math.floor(interval / 60000)} minutes`);
  },

  setLastRefresh: (date) => {
    set((state) => ({
      refreshState: {
        ...state.refreshState,
        lastRefresh: date,
      }
    }));
  },

  setIsAutoRefreshing: (refreshing) => {
    set((state) => ({
      refreshState: {
        ...state.refreshState,
        isAutoRefreshing: refreshing,
      }
    }));
    
    if (refreshing) {
      console.log('🔄 Auto-refresh started');
    } else {
      console.log('✅ Auto-refresh completed');
    }
  },

  incrementRefreshCount: () => {
    set((state) => ({
      refreshState: {
        ...state.refreshState,
        refreshCount: state.refreshState.refreshCount + 1,
      }
    }));
  },

  resetRefreshCount: () => {
    set((state) => ({
      refreshState: {
        ...state.refreshState,
        refreshCount: 0,
      }
    }));
  },

  // Refresh trigger action
  triggerRefresh: () => {
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }));
    console.log('🔄 Refresh triggered for sidebar');
  },

  // Pull-to-refresh action
  setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),

  // Utility Actions
  initializeFromStorage: async () => {
    try {
      console.log('🔄 Initializing store from storage...');
      
      const [prefs, theme, fontSize] = await Promise.all([
        DevotionalStorage.getPreferences(),
        DevotionalStorage.getTheme(),
        DevotionalStorage.getFontSize(),
      ]);
      
      // Update store with loaded values
      set((state) => ({
        selectedThemeId: theme,
        fontSize: fontSize,
        refreshState: {
          ...state.refreshState,
          autoRefreshEnabled: prefs.appSettings.enableAutoRefresh,
          refreshInterval: prefs.appSettings.refreshInterval || REFRESH_CONFIG.AUTO_REFRESH_INTERVAL,
        }
      }));
      
      console.log('✅ Store initialized from storage:', {
        theme,
        fontSize,
        autoRefresh: prefs.appSettings.enableAutoRefresh,
        interval: Math.floor((prefs.appSettings.refreshInterval || REFRESH_CONFIG.AUTO_REFRESH_INTERVAL) / 60000) + 'min'
      });
    } catch (error) {
      console.error('❌ Failed to initialize store from storage:', error);
    }
  },

  saveRefreshPreferences: async () => {
    try {
      const { refreshState } = get();
      
      await DevotionalStorage.saveAppSetting('enableAutoRefresh', refreshState.autoRefreshEnabled);
      await DevotionalStorage.saveAppSetting('refreshInterval', refreshState.refreshInterval);
      
      console.log('✅ Refresh preferences saved to storage');
    } catch (error) {
      console.error('❌ Failed to save refresh preferences:', error);
    }
  },
}));

export const useRefreshState = () => {
  const store = useDevotionalsStore();
  
  return {
    autoRefreshEnabled: store.refreshState.autoRefreshEnabled,
    refreshInterval: store.refreshState.refreshInterval,
    lastRefresh: store.refreshState.lastRefresh,
    isAutoRefreshing: store.refreshState.isAutoRefreshing,
    refreshCount: store.refreshState.refreshCount,
    
    setAutoRefreshEnabled: store.setAutoRefreshEnabled,
    setRefreshInterval: store.setRefreshInterval,
    setLastRefresh: store.setLastRefresh,
    setIsAutoRefreshing: store.setIsAutoRefreshing,
    incrementRefreshCount: store.incrementRefreshCount,
    resetRefreshCount: store.resetRefreshCount,
  };
};

// Computed values hook
export const useRefreshComputed = () => {
  const refreshState = useRefreshState();
  
  const refreshIntervalMinutes = Math.floor(refreshState.refreshInterval / 60000);
  const timeSinceLastRefresh = refreshState.lastRefresh 
    ? Date.now() - refreshState.lastRefresh.getTime()
    : null;
  const minutesSinceRefresh = timeSinceLastRefresh 
    ? Math.floor(timeSinceLastRefresh / 60000)
    : null;
    
  const shouldForceRefresh = timeSinceLastRefresh 
    ? timeSinceLastRefresh > REFRESH_CONFIG.FORCE_REFRESH_THRESHOLD
    : true;
  
  return {
    refreshIntervalMinutes,
    timeSinceLastRefresh,
    minutesSinceRefresh,
    shouldForceRefresh,
    
    // Status strings
    refreshStatus: refreshState.isAutoRefreshing 
      ? 'Refreshing...' 
      : refreshState.autoRefreshEnabled 
        ? `Auto-refresh enabled (${refreshIntervalMinutes}min)`
        : 'Auto-refresh disabled',
        
    lastRefreshText: refreshState.lastRefresh 
      ? `Last refresh: ${refreshState.lastRefresh.toLocaleTimeString()}`
      : 'Never refreshed',
  };
};