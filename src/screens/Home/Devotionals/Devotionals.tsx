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
} from "react-native";
import { Feather } from "@expo/vector-icons";
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
  content: { title: string; body: string; dateLabel?: string };
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
  isLiked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
  isLiking?: boolean;
  onSaveResponse?: (heart: string, takeaway: string) => Promise<void>;
  isSubmittingResponse?: boolean;
  hasSubmittedResponse?: boolean;
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
  isLiked = false,
  likeCount = 0,
  onToggleLike,
  isLiking = false,
  onSaveResponse,
  isSubmittingResponse = false,
  hasSubmittedResponse = false,
}: DevotionalsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

  const headerTitle = useMemo(() => {
    return formatDateLabel(content.dateLabel);
  }, [content.dateLabel]);

  const accentIsWhite = isHexWhite(selectedTheme?.accentColor);
  const statusBarBackground = selectedTheme?.backgroundColor ?? "#fff";
  const statusBarStyle = isHexDark(statusBarBackground) ? "light" : "dark";
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
  const bookmarkIconColor = isDarkTheme ? '#FFFFFF' : (selectedTheme?.accentColor ?? selectedTheme?.textColor);

  const isSelectionMode = selectedParagraphs.length > 0;

  const paragraphs = useMemo(() => {
    if (!content?.body) return [];
    
    // Return the entire content as a single paragraph - no splitting
    const cleanedContent = content.body.trim();
    
    return [{ id: 1, text: cleanedContent }];
  }, [content?.body]);

  // Handle paragraph selection for both bookmarking and unbookmarking
  const toggleParagraphSelection = (id: number) => {
    setSelectedParagraphs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Handle unbookmarking individual paragraphs via icon click
  const handleUnbookmarkSingle = (id: number) => {
    console.log(`🔖 Unbookmarking paragraph ${id} (icon click)`);
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

  const handleBookmarkToggle = () => {
    if (!isSelectionMode || selectedParagraphs.length === 0) return;
    
    // Check if selected paragraphs are bookmarked or not
    const selectedBookmarked = selectedParagraphs.filter(id => bookmarkedParagraphs.includes(id));
    const selectedUnbookmarked = selectedParagraphs.filter(id => !bookmarkedParagraphs.includes(id));
    
    if (selectedBookmarked.length > 0 && selectedUnbookmarked.length === 0) {
      // All selected are bookmarked -> unbookmark them
      console.log(`🔖 Unbookmarking selected paragraphs: ${selectedParagraphs.join(', ')}`);
      onUnbookmarkParagraphs?.(selectedParagraphs);
    } else {
      // Some or all are unbookmarked -> bookmark the unbookmarked ones
      console.log(`🔖 Bookmarking selected paragraphs: ${selectedUnbookmarked.join(', ')}`);
      if (selectedUnbookmarked.length > 0 && onBookmarkParagraphs) {
        onBookmarkParagraphs(selectedUnbookmarked);
      }
    }
    
    setSelectedParagraphs([]);
  };

  const handleNextPage = () => {
    onNextPage();
  };

  return (
    <View style={[styles.container, { backgroundColor: statusBarBackground }]}>
      <StatusBar backgroundColor={statusBarBackground} style={statusBarStyle} animated />
      
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
            disabled={isBookmarking || !isSelectionMode}
            style={[
              styles.headerButton,
              {
                borderColor: headerButtonBorderColor,
                borderWidth: headerButtonBorderWidth,
                backgroundColor: headerButtonBackground,
                opacity: isSelectionMode ? 1 : 0.5,
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isBookmarking ? (
              <ActivityIndicator size="small" color={selectedTheme?.textColor} />
            ) : (
              <View style={styles.bookmarkButtonContainer}>
                {(() => {
                  // Check if selected paragraphs are bookmarked
                  const selectedBookmarked = selectedParagraphs.filter(id => bookmarkedParagraphs.includes(id));
                  const allSelectedAreBookmarked = selectedParagraphs.length > 0 && selectedBookmarked.length === selectedParagraphs.length;
                  
                  return (
                    <Feather
                      name="bookmark"
                      size={20}
                      color={selectedTheme?.textColor}
                      fill={allSelectedAreBookmarked ? selectedTheme?.textColor : 
                            isSelectionMode ? selectedTheme?.accentColor : "transparent"}
                    />
                  );
                })()}
                {isSelectionMode && selectedParagraphs.length > 0 && (
                  <View style={[
                    styles.selectionBadge, 
                    { 
                      backgroundColor: selectedTheme?.id === 'classic' ? '#0C154C' :
                                     selectedTheme?.id === 'midnight' ? '#1F5BFF' :
                                     selectedTheme?.accentColor ?? '#0C154C'
                    }
                  ]}>
                    <Text style={[
                      styles.selectionBadgeText,
                      { 
                        color: selectedTheme?.id === 'classic' ? '#FFFFFF' :
                               selectedTheme?.id === 'midnight' ? '#FFFFFF' :
                               '#FFFFFF'
                      }
                    ]}>
                      {selectedParagraphs.length}
                    </Text>
                  </View>
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
        >
        <DevotionalBannerEnhanced
        title="IN OUR SUFFERING, LORD BE NEAR:"
        subtitle="A 5-DAY DEVOTIONAL"
        scripture="The Lord is close to the brokenhearted and saves those who are crushed in spirit. - Psalm 34:18"
        theme="sage"
        height={220}
      />
          <Text
            style={[
              styles.readingTitle,
              { color: selectedTheme?.textColor, fontSize: fontSize + 4 },
            ]}
          >
            {content.title}
          </Text>
          
          {paragraphs.length > 0 ? (
            <View style={styles.versesContainer}>
              {paragraphs.map((paragraph) => {
                const isSelected = selectedParagraphs.includes(paragraph.id);
                const isBookmarked = bookmarkedParagraphs.includes(paragraph.id);
                
                return (
                  <View
                    key={paragraph.id}
                    style={[
                      styles.verseLine,
                      isBookmarked && { 
                        backgroundColor: bookmarkedBackgroundColor,
                        borderLeftWidth: 3,
                        borderLeftColor: selectedTheme?.accentColor ?? '#FFD700',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleParagraphSelection(paragraph.id)}
                      style={styles.verseTextContainer}
                    >
                      <Text
                        style={[
                          styles.verseText,
                          {
                            color: selectedTheme?.textColor,
                            fontSize,
                            lineHeight: readingBodyLineHeight,
                          },
                          isBookmarked && styles.bookmarkedText,
                          isSelected && {
                            textDecorationLine: "underline",
                            textDecorationColor: selectedTheme?.accentColor ?? selectedTheme?.textColor,
                          },
                        ]}
                      >
                        {paragraph.text}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Bookmark icon overlay in top-right corner - clickable for unbookmarking */}
                    {isBookmarked && (
                      <TouchableOpacity
                        onPress={() => handleUnbookmarkSingle(paragraph.id)}
                        style={styles.paragraphBookmarkOverlay}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        disabled={isBookmarking}
                      >
                        <View style={[
                          styles.bookmarkIconContainer,
                          { backgroundColor: selectedTheme?.backgroundColor ?? '#fff' }
                        ]}>
                          <Feather
                            name="bookmark"
                            size={14}
                            color={selectedTheme?.id === 'classic' ? '#0C154C' : 
                                   selectedTheme?.id === 'midnight' ? '#1F5BFF' : 
                                   selectedTheme?.accentColor ?? '#FFD700'}
                            fill={selectedTheme?.id === 'classic' ? '#0C154C' : 
                                  selectedTheme?.id === 'midnight' ? '#1F5BFF' : 
                                  selectedTheme?.accentColor ?? '#FFD700'}
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
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