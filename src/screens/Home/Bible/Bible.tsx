import React, { useEffect, useRef, useState } from "react";

import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BibleSidebar } from "./BibleSidebar";
import { Book } from "@/src/api/bibleApi";

type BibleProps = {
  sidebarVisible: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onChapterSelected?: (info: { book: Book; chapter: number }) => void;

  content: {
    dateLabel: string;
    title: string;
    body: string;
  };
  currentBook?: Book | null;
  currentChapterNumber?: number;
  isLoadingChapter?: boolean;
  settingsVisible: boolean;
  onToggleSettings: () => void;
  themeOptions: BibleTheme[];
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  fontSize: number;
  onFontSizeChange: (delta: number) => void;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  downloadProgress?: { current: number; total: number; bookName: string } | null;
};

type BibleTheme = {
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
};

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isHexWhite = (hex?: string) => {
  if (!hex) return false;
  const sanitized = hex.replace("#", "").toLowerCase();
  if (sanitized.length === 3) {
    return sanitized.split("").every((char) => char === "f");
  }
  return sanitized === "ffffff";
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

export function Bible({
  sidebarVisible,
  onOpenSidebar,
  onCloseSidebar,
  onChapterSelected,
  content,
  currentBook,
  currentChapterNumber,
  isLoadingChapter,
  settingsVisible,
  onToggleSettings,
  themeOptions,
  selectedThemeId,
  onSelectTheme,
  fontSize,
  onFontSizeChange,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  downloadProgress,
}: BibleProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const selectedTheme =
    themeOptions.find((theme) => theme.id === selectedThemeId) ?? themeOptions[0];
  const [panelHeight, setPanelHeight] = useState(0);

  const accentIsWhite = isHexWhite(selectedTheme?.accentColor);
  const statusBarBackground = selectedTheme?.backgroundColor ?? "#fff";
  const statusBarStyle = isHexDark(statusBarBackground) ? "light" : "dark";
  const isDarkPanel = isHexDark(selectedTheme?.panelBackground);
  const dividerColor = isDarkPanel
    ? "#cccccc"
    : "#cccccc";
  const controlBorderColor = isDarkPanel
    ? "rgba(255, 255, 255, 0.45)"
    : "rgba(12, 21, 76, 0.24)";
  const panelShadowColor = isDarkPanel
    ? "rgba(0, 0, 0, 0.9)"
    : hexToRgba(selectedTheme?.textColor ?? "#0C154C", 0.35);
  const panelShadowOpacity = isDarkPanel ? 0.95 : 1;
  const panelShadowRadius = isDarkPanel ? 32 : 24;
  const panelShadowOffset = isDarkPanel ? { width: 0, height: -12 } : { width: 0, height: -8 };
  const panelElevation = isDarkPanel ? 36 : 24;

  const isSidebarDark = isHexDark(selectedTheme?.sidebarBackground);
  const sidebarChevronColor = isSidebarDark
    ? "#FFFFFF"
    : selectedTheme?.accentColor ?? selectedTheme?.textColor;

  const fallbackHeaderBackground = accentIsWhite
    ? "transparent"
    : hexToRgba(selectedTheme?.accentColor ?? "#0C154C", 0.08);
  const fallbackHeaderBorderColor = accentIsWhite
    ? "transparent"
    : selectedTheme?.accentColor ?? "#0C154C";
  const fallbackHeaderBorderWidth = accentIsWhite ? 0 : 1;

  const headerButtonBackground =
    selectedTheme?.headerButtonBackground || fallbackHeaderBackground;
  const headerButtonBorderColor =
    selectedTheme?.headerButtonBorderColor || fallbackHeaderBorderColor;
  const headerButtonBorderWidth =
    selectedTheme?.headerButtonBorderWidth ?? fallbackHeaderBorderWidth;

  const headerScale = useRef(new Animated.Value(1)).current;
  const settingsPanelProgress = useRef(new Animated.Value(settingsVisible ? 1 : 0)).current;
  const isUserScrolling = useRef(false);
  const scrollToggleLock = useRef(false);
  const scrollResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readingBodyLineHeight = Math.max(26, fontSize * 1.6);

  useEffect(() => {
    Animated.spring(settingsPanelProgress, {
      toValue: settingsVisible ? 1 : 0,
      damping: 16,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [settingsVisible, settingsPanelProgress]);

  useEffect(() => {
    return () => {
      if (scrollResetTimeout.current) {
        clearTimeout(scrollResetTimeout.current);
      }
    };
  }, []);

  const hiddenOffset = panelHeight ? panelHeight + insets.bottom + 32 : 320;
  const panelAnimatedStyle = {
    transform: [
      {
        translateY: settingsPanelProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [hiddenOffset, 0],
        }),
      },
    ],
    opacity: settingsPanelProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  } as const;

  const resetScrollFlag = () => {
    if (scrollResetTimeout.current) {
      clearTimeout(scrollResetTimeout.current);
    }
    scrollResetTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
      scrollToggleLock.current = false;
    }, 140);
  };

  const handleScrollBeginDrag = () => {
    isUserScrolling.current = true;
    if (scrollResetTimeout.current) {
      clearTimeout(scrollResetTimeout.current);
      scrollResetTimeout.current = null;
    }
    if (settingsVisible && !scrollToggleLock.current) {
      scrollToggleLock.current = true;
      onToggleSettings();
    }
  };

  const handleScrollEndDrag = () => {
    resetScrollFlag();
  };

  const handleMomentumScrollBegin = () => {
    isUserScrolling.current = true;
    if (scrollResetTimeout.current) {
      clearTimeout(scrollResetTimeout.current);
      scrollResetTimeout.current = null;
    }
  };

  const handleMomentumScrollEnd = () => {
    resetScrollFlag();
  };

  const handleContentTouchEnd = () => {
    if (!isUserScrolling.current && !scrollToggleLock.current) {
      onToggleSettings();
      scrollToggleLock.current = true;
      resetScrollFlag();
    }
  };

  const handleBack = () => {
    Animated.spring(headerScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(headerScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      if (router.canGoBack()) {
        router.back();
      }
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: statusBarBackground },
      ]}
    >
      <StatusBar backgroundColor={statusBarBackground} style={statusBarStyle} animated />
      <View style={styles.headerRow}>
        <Animated.View style={{ transform: [{ scale: headerScale }] }}>
          <Pressable
            onPress={handleBack}
            style={[
              styles.headerButton,
              {
                borderColor: headerButtonBorderColor,
                borderWidth: headerButtonBorderWidth,
                backgroundColor: headerButtonBackground,
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={20} color={selectedTheme?.textColor} />
          </Pressable>
        </Animated.View>

        <Text style={[styles.headerTitle, { color: selectedTheme?.textColor }]}>
          {currentBook && currentChapterNumber
            ? `${currentBook.name} ${currentChapterNumber}`
            : content.dateLabel
          }
        </Text>

        <Pressable
          onPress={onOpenSidebar}
          style={[
            styles.headerButton,
            {
              borderColor: headerButtonBorderColor,
              borderWidth: headerButtonBorderWidth,
              backgroundColor: headerButtonBackground,
            },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="menu" size={20} color={selectedTheme?.textColor} />
        </Pressable>
      </View>

      <View style={styles.contentWrapper}>
        {/* Download Progress Bar */}
        {downloadProgress && (
          <View style={[styles.downloadProgressBar, { backgroundColor: selectedTheme?.panelBackground }]}>
            <View style={styles.downloadProgressHeader}>
              <Text style={[styles.downloadProgressTitle, { color: selectedTheme?.panelTextColor }]}>
                Downloading {downloadProgress.bookName}
              </Text>
              <Text style={[styles.downloadProgressCount, { color: selectedTheme?.panelTextColor, opacity: 0.7 }]}>
                {downloadProgress.current} / {downloadProgress.total} chapters
              </Text>
            </View>
            <View style={[styles.downloadProgressTrack, { backgroundColor: selectedTheme?.backgroundColor, opacity: 0.3 }]}>
              <View
                style={[
                  styles.downloadProgressFill,
                  {
                    backgroundColor: selectedTheme?.accentColor,
                    width: `${(downloadProgress.current / downloadProgress.total) * 100}%`
                  }
                ]}
              />
            </View>
          </View>
        )}

        {isLoadingChapter ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={selectedTheme?.textColor ?? "#0C154C"} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.readingContent}
            onTouchEnd={handleContentTouchEnd}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollBegin={handleMomentumScrollBegin}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
          >
            <Text
              style={[
                styles.readingTitle,
                { color: selectedTheme?.textColor, fontSize: fontSize + 4 },
              ]}
            >
              {content.title}
            </Text>
            <Text
              style={[
                styles.readingBody,
                { color: selectedTheme?.textColor, fontSize, lineHeight: readingBodyLineHeight },
              ]}
            >
              {content.body}
            </Text>
          </ScrollView>
        )}
      </View>

      <Animated.View
        pointerEvents={settingsVisible ? "auto" : "none"}
        style={[
          styles.settingsPanel,
          {
            backgroundColor: selectedTheme?.panelBackground,
            paddingBottom: 16 + insets.bottom,
            shadowColor: panelShadowColor,
            shadowOpacity: panelShadowOpacity,
            shadowRadius: panelShadowRadius,
            shadowOffset: panelShadowOffset,
            elevation: panelElevation,
          },
          panelAnimatedStyle,
        ]}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          if (height !== panelHeight) {
            setPanelHeight(height);
          }
        }}
      >
        <View style={styles.swatchRow}>
          {themeOptions.map((theme) => {
            const isSelected = theme.id === selectedThemeId;
            const swatchBorderColor = isSelected
              ? theme.id === "midnight"
                ? "#1F5BFF"
                : isHexWhite(theme.backgroundColor)
                  ? selectedTheme?.textColor ?? "#0C154C"
                  : selectedTheme?.accentColor
              : "transparent";
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: theme.backgroundColor,
                    borderColor: swatchBorderColor,
                  },
                ]}
                onPress={() => onSelectTheme(theme.id)}
                activeOpacity={0.8}
              >
                {isSelected && <View style={styles.swatchInner} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
        </View>

        <View style={styles.panelActions}>
          <TouchableOpacity
            onPress={() => onFontSizeChange(-1)}
            style={[styles.fontControlButton, { borderColor: controlBorderColor }]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.fontControlLabel,
                { color: selectedTheme?.panelTextColor },
              ]}
            >
              A-
            </Text>
          </TouchableOpacity>

          <View style={[styles.pageControl, { borderColor: controlBorderColor }]}>
            <Pressable
              onPress={onPrevPage}
              style={[styles.pageButton, { borderColor: controlBorderColor }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="chevron-left" size={16} color={selectedTheme?.panelTextColor} />
            </Pressable>

            {currentBook && currentChapterNumber ? (
              <Text style={[styles.pageLabel, { color: selectedTheme?.panelTextColor }]}>
                Ch {currentChapterNumber}/{currentBook.chapters_count}
              </Text>
            ) : (
              <Text style={[styles.pageLabel, { color: selectedTheme?.panelTextColor }]}>
                Select Chapter
              </Text>
            )}
            <Pressable
              onPress={onNextPage}
              style={[styles.pageButton, { borderColor: controlBorderColor }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="chevron-right" size={16} color={selectedTheme?.panelTextColor} />
            </Pressable>
          </View>

          <TouchableOpacity
            onPress={() => onFontSizeChange(1)}
            style={[styles.fontControlButton, { borderColor: controlBorderColor }]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.fontControlLabel,
                { color: selectedTheme?.panelTextColor },
              ]}
            >
              A+
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <BibleSidebar
        visible={sidebarVisible}
        onClose={onCloseSidebar}
        surfaceColor={selectedTheme?.sidebarBackground}
        textColor={selectedTheme?.sidebarTextColor}
        accentColor={sidebarChevronColor}
        currentBook={currentBook}
        onSelectChapter={({ book, chapter }) =>
          onChapterSelected?.({ book, chapter })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  contentWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  readingContent: {
    paddingBottom: 140,
    gap: 16,
  },
  readingTitle: {
    fontFamily: "Geist-SemiBold",
    fontSize: 18,
  },
  readingBody: {
    lineHeight: 26,
    fontFamily: "DMSans-Regular",
  },
  settingsPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 18,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 24,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  dividerContainer: {
    position: "relative",
    height: 10,
    justifyContent: "flex-end",
  },
  dividerLine: {
    height: 2,
    width: "100%",
  },
  panelActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fontControlButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(12, 21, 76, 0.24)",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  fontControlLabel: {
    fontFamily: "DMSans-Bold",
    fontSize: 16,
  },
  pageControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 12,
  },
  pageButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 2,
  },
  pageLabel: {
    fontFamily: "DMSans-Medium",
    fontSize: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    marginBottom: 24,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "DMSans-Bold",
    fontSize: 18,
  },
  downloadProgressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  downloadProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadProgressTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
  downloadProgressCount: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
  },
  downloadProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  downloadProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
