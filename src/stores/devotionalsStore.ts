import { create } from 'zustand';
import { DevotionalTheme } from '@/src/screens/Home/Devotionals/Devotionals';
import { DevotionalMonth } from '@/src/screens/Home/Devotionals/DevotionalsSidebar';

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
}

export const useDevotionalsStore = create<DevotionalsState>((set) => ({
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

  // Actions
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
}));
