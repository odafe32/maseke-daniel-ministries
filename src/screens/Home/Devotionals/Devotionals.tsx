import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router"; // Added for back button
import { DevotionalsSidebar, DevotionalMonth } from "./DevotionalsSidebar";

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
}

interface DevotionalsProps {
  sidebarVisible: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onDaySelected: (payload: { month: DevotionalMonth; day: number }) => void;
  content: { title: string; body: string; dateLabel?: string };
  currentMonth: DevotionalMonth | null;
  currentDayNumber: number;
  settingsVisible: boolean;
  onToggleSettings: () => void;
  onShowSettings: () => void; // Added
  onHideSettings: () => void; // Added
  themeOptions: DevotionalTheme[];
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  fontSize: number;
  onFontSizeChange: (delta: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isHexDark = (hex?: string) => {
  if (!hex) return false;
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5;
};

export function Devotionals({
  sidebarVisible, onOpenSidebar, onCloseSidebar, onDaySelected, content,
  currentMonth, currentDayNumber, settingsVisible, onToggleSettings,
  onShowSettings, onHideSettings, themeOptions, selectedThemeId, 
  onSelectTheme, fontSize, onFontSizeChange, onPrevPage, onNextPage
}: DevotionalsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selectedTheme = themeOptions.find((t) => t.id === selectedThemeId) ?? themeOptions[0];
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  
  // Animation and Scroll Refs (Exact Bible Logic)
  const settingsProgress = useRef(new Animated.Value(settingsVisible ? 1 : 0)).current;
  const lastScrollOffset = useRef(0);
  const scrollToggleLock = useRef(false);
  const SCROLL_DIRECTION_THRESHOLD = 12;

  useEffect(() => {
    Animated.spring(settingsProgress, {
      toValue: settingsVisible ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
    }).start();
  }, [settingsVisible, settingsProgress]);

  const lines = useMemo(() => {
    return content.body.split(/\n+/).filter(Boolean).map((text, id) => ({ id, text }));
  }, [content.body]);

  const toggleLineSelection = (id: number) => {
    setSelectedLines(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const isSelectionMode = selectedLines.length > 0;
  const isDark = isHexDark(selectedTheme.backgroundColor);
  const controlBorderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(12,21,76,0.1)";

  // Scroll logic for hiding/showing menu
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastScrollOffset.current;

    if (Math.abs(diff) >= SCROLL_DIRECTION_THRESHOLD) {
      if (diff > 0 && settingsVisible) {
        onHideSettings(); // Hide when scrolling down
      } else if (diff < 0 && !settingsVisible) {
        onShowSettings(); // Show when scrolling up
      }
    }
    lastScrollOffset.current = Math.max(0, currentOffset);
  };

  const handleContentTouchEnd = () => {
    if (!scrollToggleLock.current) {
      onToggleSettings();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme.backgroundColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* HEADER: Back on Left, Menu on Right */}
      <View style={[styles.headerRow, { marginTop: insets.top }]}>
        <TouchableOpacity 
           onPress={() => router.back()}
           style={[styles.headerButton, { backgroundColor: hexToRgba(selectedTheme.accentColor, 0.08), borderColor: selectedTheme.accentColor }]}
        >
          <Feather name="chevron-left" size={20} color={selectedTheme.textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: selectedTheme.textColor }]}>
          {currentMonth ? `${currentMonth.name} ${currentDayNumber}` : (content.dateLabel || "Devotional")}
        </Text>

        <TouchableOpacity 
           onPress={isSelectionMode ? () => setSelectedLines([]) : onOpenSidebar}
           style={[styles.headerButton, { backgroundColor: hexToRgba(selectedTheme.accentColor, 0.08), borderColor: selectedTheme.accentColor }]}
        >
          {/* Change icon based on selection mode */}
          <Feather 
            name={isSelectionMode ? "bookmark" : "menu"} 
            size={20} 
            color={isSelectionMode ? "#F2B705" : selectedTheme.textColor} 
          />
        </TouchableOpacity>
      </View>

      {/* READING AREA */}
      <ScrollView 
        contentContainerStyle={styles.readingContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchEnd={handleContentTouchEnd}
      >
        <Text style={[styles.readingTitle, { color: selectedTheme.textColor, fontSize: fontSize + 4 }]}>
          {content.title}
        </Text>
        
        {lines.map((line) => (
          <TouchableOpacity 
            key={line.id} 
            activeOpacity={0.9} 
            onPress={() => toggleLineSelection(line.id)}
            style={styles.lineWrapper}
          >
            <Text style={[
              styles.readingBody, 
              { 
                color: selectedTheme.textColor, 
                fontSize, 
                lineHeight: fontSize * 1.6,
                textDecorationLine: selectedLines.includes(line.id) ? "underline" : "none",
                textDecorationColor: selectedTheme.accentColor
              }
            ]}>
              {line.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* SETTINGS PANEL (Color Palette & Controls) */}
      <Animated.View style={[
        styles.settingsPanel, 
        { 
          backgroundColor: selectedTheme.panelBackground,
          paddingBottom: insets.bottom + 20,
          transform: [{ 
            translateY: settingsProgress.interpolate({ 
              inputRange: [0, 1], 
              outputRange: [400, 0] // Hides off screen
            }) 
          }],
          opacity: settingsProgress,
          shadowColor: isDark ? "#000" : selectedTheme.textColor,
        }
      ]}>
        {/* Color Palette */}
        <View style={styles.swatchRow}>
          {themeOptions.map((t) => (
            <TouchableOpacity 
              key={t.id} 
              onPress={() => onSelectTheme(t.id)}
              style={[
                styles.swatch, 
                { 
                  backgroundColor: t.backgroundColor, 
                  borderColor: selectedThemeId === t.id ? (isDark ? "#1F5BFF" : selectedTheme.accentColor) : "transparent" 
                }
              ]} 
            >
               {selectedThemeId === t.id && <View style={styles.swatchInner} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Font and Page Controls */}
        <View style={styles.panelActions}>
          <TouchableOpacity onPress={() => onFontSizeChange(-1)} style={[styles.fontBtn, { borderColor: controlBorderColor }]}>
            <Text style={[styles.btnText, { color: selectedTheme.panelTextColor }]}>A-</Text>
          </TouchableOpacity>

          <View style={[styles.pageControl, { borderColor: controlBorderColor }]}>
            <TouchableOpacity onPress={onPrevPage} disabled={currentDayNumber === 1}>
              <Feather name="chevron-left" size={18} color={selectedTheme.panelTextColor} />
            </TouchableOpacity>
            
            <Text style={[styles.pageLabel, { color: selectedTheme.panelTextColor }]}>
                Day {currentDayNumber}
            </Text>

            <TouchableOpacity onPress={onNextPage}>
              <Feather name="chevron-right" size={18} color={selectedTheme.panelTextColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => onFontSizeChange(1)} style={[styles.fontBtn, { borderColor: controlBorderColor }]}>
            <Text style={[styles.btnText, { color: selectedTheme.panelTextColor }]}>A+</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <DevotionalsSidebar 
        visible={sidebarVisible} 
        onClose={onCloseSidebar} 
        onSelectDay={onDaySelected}
        surfaceColor={selectedTheme.sidebarBackground}
        textColor={selectedTheme.sidebarTextColor}
        accentColor={selectedTheme.accentColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, height: 60 },
  headerButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", fontFamily: "DMSans-Bold" },
  readingContent: { paddingBottom: 160, paddingTop: 20 },
  readingTitle: { fontWeight: "bold", marginBottom: 20, fontFamily: "Geist-SemiBold" },
  lineWrapper: { marginBottom: 15 },
  readingBody: { fontFamily: "DMSans-Regular" },
  settingsPanel: { 
    position: "absolute", bottom: 0, left: 0, right: 0, 
    padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, 
    elevation: 24, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: -8 } 
  },
  swatchRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  swatchInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(12,21,76,0.08)', marginBottom: 15 },
  panelActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fontBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  btnText: { fontFamily: "DMSans-Bold", fontSize: 16 },
  pageControl: { flexDirection: "row", alignItems: "center", gap: 15, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 15, borderRadius: 12 },
  pageLabel: { fontFamily: "DMSans-Medium", fontSize: 14 },
});