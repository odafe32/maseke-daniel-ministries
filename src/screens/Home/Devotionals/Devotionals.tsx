import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { DevotionalMonth } from "./DevotionalsSidebar";
import DevotionalBannerEnhanced from "./DevotionalBannerEnhanced";

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

interface DevotionalsProps {
  onOpenSidebar: () => void;
  content: { title: string; body: string; dateLabel?: string; isHtml?: boolean; scripture?: string; verse?: string };
  currentMonth: DevotionalMonth | null;
  currentDayNumber: number;
  settingsVisible: boolean;
  onToggleSettings: () => void;
  onShowSettings: () => void;
  onHideSettings: () => void;
  themeOptions: DevotionalTheme[];
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  fontSize: number;
  onFontSizeChange: (delta: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  devotionalEntryId?: number;
  totalDays?: number;
  isNavigating?: boolean;
  bookmarkedParagraphs?: number[];
  onBookmarkParagraphs?: (paragraphIds: number[]) => void;
  onUnbookmarkParagraphs?: (paragraphIds: number[]) => void;
  isBookmarking?: boolean;
  setIsBookmarking?: (bookmarking: boolean) => void;
  isEntryBookmarked?: boolean;
  isLiked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
  isLiking?: boolean;
  onSaveResponse?: (heart: string, takeaway: string) => Promise<void>;
  isSubmittingResponse?: boolean;
  hasSubmittedResponse?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

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

const formatDateLabel = (dateString?: string): string => {
  if (!dateString) return "Devotional";
  
  try {
    let date: Date;
    
    if (dateString.match(/^[A-Za-z]+\s+\d+/)) {
      return dateString;
    }
    
    if (dateString.includes('-')) {
      date = new Date(dateString + 'T00:00:00');
    } else if (dateString.includes('/')) {
      date = new Date(dateString);
    } else {
      return dateString; 
    }
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    
    const getOrdinal = (n: number): string => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    return `${dayName} ${getOrdinal(dayNum)} ${monthName}`;
  } catch {
    return dateString || "Devotional";
  }
};

export function Devotionals({
  onOpenSidebar,
  content,
  currentMonth,
  currentDayNumber,
  settingsVisible,
  onToggleSettings,
  onShowSettings,
  onHideSettings,
  themeOptions,
  selectedThemeId,
  onSelectTheme,
  fontSize,
  onFontSizeChange,
  onPrevPage,
  onNextPage,
  devotionalEntryId,
  totalDays = 31,
  isNavigating = false,
  bookmarkedParagraphs = [],
  onBookmarkParagraphs,
  onUnbookmarkParagraphs,
  isBookmarking = false,
  setIsBookmarking,
  isEntryBookmarked = false,
  isLiked = false,
  likeCount = 0,
  onToggleLike,
  isLiking = false,
  onSaveResponse,
  isSubmittingResponse = false,
  hasSubmittedResponse = false,
  refreshing = false,
  onRefresh,
}: DevotionalsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const selectedTheme = themeOptions.find((t) => t.id === selectedThemeId) ?? themeOptions[0];
  const [selectedParagraphs, setSelectedParagraphs] = useState<number[]>([]);
  const [panelHeight, setPanelHeight] = useState(0);

  const headerScale = useRef(new Animated.Value(1)).current;
  const settingsPanelProgress = useRef(new Animated.Value(settingsVisible ? 1 : 0)).current;
  const isUserScrolling = useRef(false); 
  const scrollToggleLock = useRef(false);
  const scrollResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollOffset = useRef(0);
  const SCROLL_DIRECTION_THRESHOLD = 12;

  const readingBodyLineHeight = Math.max(26, fontSize * 1.6);

  const htmlStyles = useMemo(() => ({
    p: {
      marginBottom: -4,
      lineHeight: readingBodyLineHeight,
      fontSize,
      color: selectedTheme?.textColor,
      fontFamily: 'DMSans-Regular',
    },
    strong: {
      fontSize: fontSize + 2,
      fontFamily: 'DMSans-Bold',
      color: selectedTheme?.textColor,
    },
    b: {
      fontSize: fontSize + 2,
      fontFamily: 'DMSans-Bold',
      color: selectedTheme?.textColor,
    },
    h1: { 
      fontSize: fontSize + 4, 
      fontFamily: 'DMSans-Bold', 
      marginBottom: 0, 
      color: selectedTheme?.textColor 
    },
    h2: { 
      fontSize: fontSize + 3, 
      fontFamily: 'DMSans-Bold', 
      fontWeight: 'bold' as const,
      marginBottom: 0, 
      color: selectedTheme?.textColor 
    },
    h3: { 
      fontSize: fontSize + 2, 
      fontFamily: 'DMSans-Bold', 
      fontWeight: 'bold' as const,
      marginBottom: 0, 
      color: selectedTheme?.textColor 
    },
   
    h4: { 
      fontSize: fontSize + 1, 
      fontFamily: 'DMSans-Bold', 
      fontWeight: 'bold' as const,
      marginBottom: 0, 
      color: selectedTheme?.textColor 
    },
    h5: { 
      fontSize: fontSize + 1, 
      fontFamily: 'DMSans-Bold', 
      fontWeight: 'bold' as const,
      marginBottom: 0, 
      color: selectedTheme?.textColor 
    },
    h6: { 
      fontSize: fontSize, 
      fontFamily: 'DMSans-Bold', 
      fontWeight: 'bold' as const,
      marginBottom: 0, 
      color: selectedTheme?.textColor 
    },
  }), [fontSize, readingBodyLineHeight, selectedTheme?.textColor]);

  const headerTitle = useMemo(() => {
    return formatDateLabel(content.dateLabel);
  }, [content.dateLabel]);

  const accentIsWhite = isHexWhite(selectedTheme?.accentColor);
  const statusBarStyle = "dark";

  const bookmarkIconColor = selectedTheme?.textColor ?? "#0C154C";

  const isDarkPanel = isHexDark(selectedTheme?.panelBackground);
  const dividerColor = "#cccccc";
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

  const isDarkTheme = isHexDark(selectedTheme?.backgroundColor);
  const bookmarkedBackgroundColor = isDarkTheme ? 'rgba(255, 249, 196, 0.2)' : '#FFF9C4';

  const isSelectionMode = selectedParagraphs.length > 0;

  const paragraphs = useMemo(() => {
    if (!content?.body) return [];
    
    // Split content by double newlines (paragraph breaks) and create paragraph objects
    const cleanedContent = content.body.trim();
    const paragraphTexts = cleanedContent.split(/\n\n+/).filter(text => text.trim().length > 0);
    
    return paragraphTexts.map((text, index) => ({
      id: index + 1,
      text: text.trim(),
    }));
  }, [content?.body]);

  // Handle paragraph selection for both bookmarking and unbookmarking
  const toggleParagraphSelection = (id: number) => {
    setSelectedParagraphs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Handle unbookmarking individual paragraphs via icon click
  const handleUnbookmarkSingle = (id: number) => {
    console.log(` Unbookmarking paragraph ${id} (icon click)`);
    onUnbookmarkParagraphs?.([id]);
  };

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
  };

  const handleScrollEndDrag = () => resetScrollFlag();
  const handleMomentumScrollBegin = () => {
    isUserScrolling.current = true;
    if (scrollResetTimeout.current) {
      clearTimeout(scrollResetTimeout.current);
      scrollResetTimeout.current = null;
    }
  };
  const handleMomentumScrollEnd = () => resetScrollFlag();

  const handleContentTouchEnd = () => {
    if (!isUserScrolling.current && !scrollToggleLock.current) {
      onToggleSettings();
      scrollToggleLock.current = true;
      resetScrollFlag();
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastScrollOffset.current;

    if (Math.abs(diff) >= SCROLL_DIRECTION_THRESHOLD) {
      if (diff > 0 && settingsVisible) {
        onHideSettings();
      } else if (diff < 0 && !settingsVisible) {
        onShowSettings();
      }
    }
    lastScrollOffset.current = Math.max(0, currentOffset);
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

  const handleLikeToggle = async () => {
    if (onToggleLike) {
      onToggleLike();
    }
  };

  const handleBookmarkToggle = async () => {
    if (!devotionalEntryId || isBookmarking) return;

    setIsBookmarking?.(true);
    try {
      // Toggle bookmark for the entire entry
      if (onBookmarkParagraphs) {
        await onBookmarkParagraphs([]); // Empty array means bookmark entire entry
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setIsBookmarking?.(false);
    }
  };

  const handleNextPage = () => {
    onNextPage();
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedTheme?.backgroundColor }]}>
      <StatusBar backgroundColor={selectedTheme?.backgroundColor || '#FFFFFF'} style={statusBarStyle} animated translucent={false} />
      
      {/* HEADER - Original Layout */}
      <View style={styles.headerRow}>
        {/* Back Button */}
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

        {/* Title - Flexible with ellipsis */}
        <View style={styles.headerTitleContainer}>
          <Text 
            style={[styles.headerTitle, { color: selectedTheme?.textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {headerTitle}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.headerActions}>
          {/* Bookmark Button - Shows different states for bookmark/unbookmark */}
          <Pressable
            onPress={handleBookmarkToggle}
            disabled={isBookmarking}
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
            {isBookmarking ? (
              <ActivityIndicator size="small" color={bookmarkIconColor} />
            ) : (
              <View style={[
                styles.bookmarkButtonContainer,
              ]}>
                {isEntryBookmarked ? (
                  <MaterialIcons
                    name="bookmark"
                    size={20}
                    color={isDarkTheme ? '#FFFFFF' : (isHexWhite(selectedTheme?.backgroundColor) ? '#000000' : (selectedTheme?.accentColor ?? "#0C154C"))}
                  />
                ) : (
                  <Feather
                    name="bookmark"
                    size={20}
                    color={bookmarkIconColor}
                  />
                )}
            </View>
          )}
        </Pressable>

        {/* Menu Button */}
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
            <Feather
              name="menu"
              size={20}
              color={selectedTheme?.textColor}
            />
          </Pressable>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.readingContent}
          onTouchEnd={handleContentTouchEnd}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollBegin={handleMomentumScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={selectedTheme?.textColor}
              />
            ) : undefined
          }
        >
     <DevotionalBannerEnhanced
            title={content.title}
            subtitle={currentMonth?.name}
            scripture={content.scripture}
            verse={content.verse}
            dayNumber={currentDayNumber}
            totalDays={totalDays}
            height={200}
          />
          <Text
            style={[
              styles.readingTitle,
              { color: selectedTheme?.textColor, fontSize: fontSize + 4 },
            ]}
          >
            {content.title}
          </Text>
          
          {content.isHtml ? (
            <>
              {(() => {
                console.log(' HTML Rendering Debug:');
                console.log(' Content:', content.body?.substring(0, 500));
                console.log(' isHtml flag:', content.isHtml);
                console.log(' Styles:', htmlStyles);
                return null;
              })()}
              <RenderHtml
                contentWidth={width - 32}
                source={{ html: `<div>${content.body}</div>` }}
                tagsStyles={htmlStyles}
                baseStyle={{
                  color: selectedTheme?.textColor,
                  fontFamily: 'DMSans-Regular',
                  fontSize,
                  lineHeight: readingBodyLineHeight,
                }}
                systemFonts={['DMSans-Regular', 'DMSans-Bold']}
              />
            </>
          ) : (
            <Text
              style={[
                styles.readingBody,
                { color: selectedTheme?.textColor, fontSize, lineHeight: readingBodyLineHeight },
              ]}
            >
              {content.body}
            </Text>
          )}
        </ScrollView>
      </View>

      {/* SETTINGS PANEL */}
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
                  { backgroundColor: theme.backgroundColor, borderColor: swatchBorderColor },
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
            <Text style={[styles.fontControlLabel, { color: selectedTheme?.panelTextColor }]}>
              A-
            </Text>
          </TouchableOpacity>

          <View style={[styles.pageControl, { borderColor: controlBorderColor }]}>
            <Pressable
              onPress={onPrevPage}
              style={[styles.pageButton, { borderColor: controlBorderColor }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={currentDayNumber === 1 || isNavigating}
            >
              {isNavigating ? (
                <ActivityIndicator size="small" color={selectedTheme?.panelTextColor} />
              ) : (
                <Feather name="chevron-left" size={16} color={selectedTheme?.panelTextColor} />
              )}
            </Pressable>

            <Text style={[styles.pageLabel, { color: selectedTheme?.panelTextColor }]}>
              {isNavigating ? 'Loading...' : `Day ${currentDayNumber}/${totalDays}`}
            </Text>

            <Pressable
              onPress={handleNextPage}
              style={[styles.pageButton, { borderColor: controlBorderColor }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <ActivityIndicator size="small" color={selectedTheme?.panelTextColor} />
              ) : (
                <Feather name="chevron-right" size={16} color={selectedTheme?.panelTextColor} />
              )}
            </Pressable>
          </View>

          <TouchableOpacity
            onPress={() => onFontSizeChange(1)}
            style={[styles.fontControlButton, { borderColor: controlBorderColor }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.fontControlLabel, { color: selectedTheme?.panelTextColor }]}>
              A+
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  versesContainer: {
    gap: 4, // Minimal gap like a real devotional book
  },
  verseLine: {
    position: 'relative', // Enable absolute positioning for overlay
    marginBottom: 0,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bookmarkedVerse: {
    backgroundColor: '#FFF9C4',
  },
  verseTextContainer: {
    flex: 1,
    paddingVertical: 4,
  },
  verseText: {
    fontFamily: "DMSans-Regular",
  },
  bookmarkedText: {
    fontWeight: '500',
  },
  paragraphBookmarkOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
  bookmarkIconContainer: {
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -20,
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
    gap: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "DMSans-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 0,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  likeButtonContainer: {
    position: 'relative',
  },
  likeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  likeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },
  bookmarkButtonContainer: {
    position: 'relative',
  },
  selectionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  selectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },
});