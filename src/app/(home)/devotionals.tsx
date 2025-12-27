import React, { useState, useMemo } from "react";
// Change: Import the component (ensure the path matches your actual file)
import { Devotionals, DevotionalTheme } from "@/src/screens/Home/Devotionals/Devotionals";
import { DevotionalMonth } from "@/src/screens/Home/Devotionals/DevotionalsSidebar";

export default function DevotionalsPage() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState("classic");
  const [fontSize, setFontSize] = useState(18);
  const [currentMonth, setCurrentMonth] = useState<DevotionalMonth | null>(null);
  const [currentDayNumber, setCurrentDayNumber] = useState(1);

const themeOptions: DevotionalTheme[] = [
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
    backgroundColor: "#F5EBE0", 
    textColor: "#523015", 
    panelBackground: "#F9E8D4", 
    panelTextColor: "#523015", 
    accentColor: "#B47733", 
    sidebarBackground: "#F2DBC1", 
    sidebarTextColor: "#523015",
    headerButtonBackground: "#FFFFFF", 
    headerButtonBorderColor: "#F5EBE0"
  },
  { 
    id: "mist", 
    backgroundColor: "#EDF2F6", 
    textColor: "#081C2B", 
    panelBackground: "#FFFFFF", 
    panelTextColor: "#081C2B", 
    accentColor: "#2E5E86", 
    sidebarBackground: "#E0E7EF", 
    sidebarTextColor: "#081C2B",
    headerButtonBackground: "#FFFFFF", 
    headerButtonBorderColor: "#FFFFFF"
  },
  { 
    id: "midnight", 
    backgroundColor: "#050505", 
    textColor: "#F4F4F8", 
    panelBackground: "#111111", 
    panelTextColor: "#F4F4F8", 
    accentColor: "#000000", 
    sidebarBackground: "#050505", 
    sidebarTextColor: "#F4F4F8" 
  },
];
  const dummyContent = useMemo(() => ({
    title: currentMonth ? `Reflections for ${currentMonth.name} Day ${currentDayNumber}` : "Welcome to Devotionals",
    body: `Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.\n\nToday's devotion focuses on the power of surrender. When we stop trying to control every outcome, we leave space for God's miracles to unfold in our lives.`
  }), [currentMonth, currentDayNumber]);

  return (
    <Devotionals
      sidebarVisible={sidebarVisible}
      onOpenSidebar={() => setSidebarVisible(true)}
      onCloseSidebar={() => setSidebarVisible(false)}
      onDaySelected={(payload) => {
        setCurrentMonth(payload.month);
        setCurrentDayNumber(payload.day);
      }}
      settingsVisible={settingsVisible}
      onToggleSettings={() => setSettingsVisible(!settingsVisible)}
      onShowSettings={() => setSettingsVisible(true)}  
      onHideSettings={() => setSettingsVisible(false)} 
      themeOptions={themeOptions}
      content={dummyContent}
      currentMonth={currentMonth}
      currentDayNumber={currentDayNumber}
      selectedThemeId={selectedThemeId}
      onSelectTheme={(id) => setSelectedThemeId(id)}
      fontSize={fontSize}
      onFontSizeChange={(delta) => setFontSize(f => Math.max(12, Math.min(30, f + delta)))}
      onPrevPage={() => setCurrentDayNumber(d => Math.max(1, d - 1))}
      onNextPage={() => setCurrentDayNumber(d => d + 1)}
    />
  );
}