import React, { useMemo, useEffect, useCallback } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Devotionals } from "@/src/screens/Home/Devotionals/Devotionals";
import { DevotionalMonth, DevotionalsSidebar } from "@/src/screens/Home/Devotionals/DevotionalsSidebar";
import { VideoIntro } from "@/src/screens/Home/Devotionals/VideoIntro";
import { CompletionPage } from "@/src/screens/Home/Devotionals/CompletionPage";
import { useDevotionalEntry } from "@/src/hooks/useDevotionals";
import { useDevotionalsStore } from "@/src/stores/devotionalsStore";
import { devotionApi } from "@/src/api/devotionApi";
import { showToast } from "@/src/utils/toast";

const cleanDevotionalContent = (html: string): string => {
  if (!html) return '';
  
  let text = html;
  
  // First, handle HTML tags
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&mdash;/g, ' ');
  text = text.replace(/&ndash;/g, ' ');
  
  // Replace decorative dash sequences (2 or more) with space
  text = text.replace(/[—–\-]{2,}/g, ' ');
  
  // Replace box drawing characters
  text = text.replace(/[━─═]/g, ' ');
  
  // Remove bullet points used as decorators (• TEXT •)
  text = text.replace(/•\s*([A-Z]+)\s*•/g, '$1:');
  
  // Remove standalone bullets at start of line
  text = text.replace(/^\s*•\s*/gm, '');
  
  // Clean up multiple spaces
  text = text.replace(/[ \t]+/g, ' ');
  
  // Clean up multiple newlines (max 2)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Trim each line
  text = text.split('\n').map(line => line.trim()).join('\n');
  
  // Remove empty lines at start/end
  text = text.replace(/^\n+/, '').replace(/\n+$/, '');
  
  return text.trim();
};

export default function DevotionalsPage() {
  const {
    sidebarVisible,
    setSidebarVisible,
    settingsVisible,
    setSettingsVisible,
    selectedThemeId,
    setSelectedThemeId,
    fontSize,
    setFontSize,
    currentMonth,
    setCurrentMonth,
    currentDayNumber,
    setCurrentDayNumber,
    showVideoIntro,
    setShowVideoIntro,
    pendingVideoUrl,
    setPendingVideoUrl,
    videoKey,
    incrementVideoKey,
    isLoadingEntry,
    setIsLoadingEntry,
    currentDevotionalId,
    setCurrentDevotionalId,
    isNavigating,
    setIsNavigating,
    showCompletion,
    setShowCompletion,
    themeOptions,
  } = useDevotionalsStore();

  const { 
    entry, 
    isLoading, 
    isLiking,
    isBookmarking,
    loadTodayEntry, 
    loadEntryByDay,
    toggleBookmark,
  } = useDevotionalEntry();

  const selectedTheme = useMemo(
    () => themeOptions.find((theme) => theme.id === selectedThemeId) ?? themeOptions[0],
    [selectedThemeId, themeOptions]
  );

  // Load today's entry on mount
  useEffect(() => {
    const initLoad = async () => {
      try {
        const todayEntry = await loadTodayEntry();
        if (todayEntry?.devotional_id) {
          setCurrentDevotionalId(todayEntry.devotional_id);
        }
        if (todayEntry?.day_number) {
          setCurrentDayNumber(todayEntry.day_number);
        }

        // Check if video needs to be shown
        const videoUrl = todayEntry?.video_url ?? null;
        const hasBeenViewed = todayEntry?.viewed ?? false;
        
        if (videoUrl && !hasBeenViewed) {
          setPendingVideoUrl(videoUrl);
          incrementVideoKey();
          setShowVideoIntro(true);
        } else {
          setIsLoadingEntry(false);
        }
      } catch (error) {
        console.error('Failed to load today entry:', error);
        setIsLoadingEntry(false);
      }
    };
    initLoad();
  }, [loadTodayEntry]);

  const content = useMemo(() => {
    if (!entry) {
      return {
        title: "Welcome to Devotionals",
        body: "Loading today's devotional...",
      };
    }
    
    // Clean the content
    const cleanedContent = cleanDevotionalContent(entry.content);
    
    return {
      title: entry.title,
      body: cleanedContent,
      dateLabel: entry.date || undefined,
    };
  }, [entry]);

  // Navigate to a specific day and show video if available
  const navigateToDay = useCallback(async (devotionalId: number, dayNumber: number) => {
    setIsNavigating(true);
    setShowVideoIntro(false);
    setIsLoadingEntry(true);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    setPendingVideoUrl(null);
    
    try {
      const fetchedEntry = await loadEntryByDay(devotionalId, dayNumber);
      setCurrentDayNumber(dayNumber);
      
      const videoUrl = fetchedEntry?.video_url ?? null;
      const hasBeenViewed = fetchedEntry?.viewed ?? false;
      
      if (videoUrl && !hasBeenViewed) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setPendingVideoUrl(videoUrl);
        incrementVideoKey();
        setShowVideoIntro(true);
      } else {
        setIsLoadingEntry(false);
      }
      
      return fetchedEntry;
    } catch (error) {
      console.error('Failed to load entry:', error);
      setIsLoadingEntry(false);
      return null;
    } finally {
      setIsNavigating(false);
    }
  }, [loadEntryByDay]);

  // Handle day selection from sidebar
  const handleDaySelected = async (payload: { month: DevotionalMonth; day: number; devotionalId?: number }) => {
    setSidebarVisible(false);
    
    const devotionalId = payload.devotionalId || currentDevotionalId;
    if (!devotionalId) {
      console.error('No devotional ID available');
      return;
    }
    
    setCurrentMonth(payload.month);
    if (payload.devotionalId) {
      setCurrentDevotionalId(payload.devotionalId);
    }
    
    await navigateToDay(devotionalId, payload.day);
  };

  const handleBeginDevotional = () => {
    setShowVideoIntro(false);
    setPendingVideoUrl(null);
    setIsLoadingEntry(false);
    if (entry?.id) {
      devotionApi.markViewed(entry.id).catch(console.error);
    }
  };

  const handleVideoBack = () => {
    setShowVideoIntro(false);
    setPendingVideoUrl(null);
    setIsLoadingEntry(false);
  };

const handleBookmarkToggle = async () => {
  if (!entry) {
    console.warn('No entry loaded yet');
    return;
  }
  
  if (isBookmarking) {
    console.warn('Already bookmarking');
    return;
  }
  
  try {
    const result = await toggleBookmark();
    if (result) {
      showToast({
        type: result.bookmarked ? 'success' : 'info',
        title: result.bookmarked ? 'Bookmarked' : 'Bookmark Removed',
        message: result.bookmarked ? 'Devotional saved to your bookmarks' : 'Devotional removed from bookmarks',
      });
    }
  } catch (error) {
    console.error('Failed to toggle bookmark:', error);
    showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to update bookmark',
    });
  }
};

  // Handle prev page
  const handlePrevPage = useCallback(async () => {
    if (currentDayNumber <= 1 || isNavigating) return;
    
    const devotionalId = entry?.devotional_id || currentDevotionalId;
    if (!devotionalId) return;
    
    const newDay = currentDayNumber - 1;
    await navigateToDay(devotionalId, newDay);
  }, [currentDayNumber, entry?.devotional_id, currentDevotionalId, navigateToDay, isNavigating]);

  // Handle next page
  const handleNextPage = useCallback(async () => {
    if (isNavigating) return;
    
    const devotionalId = entry?.devotional_id || currentDevotionalId;
    if (!devotionalId) return;
    
    const totalDays = entry?.total_days || currentMonth?.entries_count || 31;
    if (currentDayNumber >= totalDays) {
      setShowCompletion(true);
      return;
    }
    
    const newDay = currentDayNumber + 1;
    await navigateToDay(devotionalId, newDay);
  }, [currentDayNumber, entry?.devotional_id, entry?.total_days, currentMonth?.entries_count, currentDevotionalId, navigateToDay, isNavigating]);

  if (showCompletion) {
    return <CompletionPage onBack={() => setShowCompletion(false)} />;
  }

  if ((isLoading || isLoadingEntry || isNavigating) && !entry && !showVideoIntro) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: selectedTheme.backgroundColor }]}>
        <ActivityIndicator size="large" color={selectedTheme.textColor} />
        <Text style={[styles.loadingText, { color: selectedTheme.textColor }]}>
          Loading devotional...
        </Text>
      </View>
    );
  }

  return (
    <>
      {!isLoadingEntry && !showVideoIntro && (
        <Devotionals
          onOpenSidebar={() => setSidebarVisible(true)}
          settingsVisible={settingsVisible}
          onToggleSettings={() => setSettingsVisible(!settingsVisible)}
          onShowSettings={() => setSettingsVisible(true)}
          onHideSettings={() => setSettingsVisible(false)}
          themeOptions={themeOptions}
          content={content}
          currentMonth={currentMonth}
          currentDayNumber={entry?.day_number || currentDayNumber}
          selectedThemeId={selectedThemeId}
          onSelectTheme={(id) => setSelectedThemeId(id)}
          fontSize={fontSize}
          onFontSizeChange={(delta) => setFontSize(Math.max(12, Math.min(30, fontSize + delta)))}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          devotionalEntryId={entry?.id}
          totalDays={entry?.total_days || currentMonth?.entries_count || 31}
          isNavigating={isNavigating}
          isBookmarking={isBookmarking}
          onBookmarkToggle={handleBookmarkToggle}
        />
      )}

      <DevotionalsSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onSelectDay={handleDaySelected}
        surfaceColor={selectedTheme.sidebarBackground}
        textColor={selectedTheme.sidebarTextColor}
        accentColor={selectedTheme.accentColor}
      />

      {/* Loading Overlay - shows when navigating/loading */}
      {(isLoading || isLoadingEntry || isNavigating) && !showVideoIntro && (
        <View style={[styles.loadingOverlay, { backgroundColor: selectedTheme.backgroundColor }]}>
          <ActivityIndicator size="large" color={selectedTheme.textColor} />
          <Text style={[styles.loadingText, { color: selectedTheme.textColor }]}>
            Loading devotional...
          </Text>
        </View>
      )}

      {showVideoIntro && (
        <VideoIntro 
          key={`video-${videoKey}-${pendingVideoUrl}`}
          onBeginDevotional={handleBeginDevotional} 
          videoUri={pendingVideoUrl || undefined}
          onBack={handleVideoBack}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
});