import React, { useMemo, useEffect, useCallback, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Devotionals } from "@/src/screens/Home/Devotionals/Devotionals";
import { DevotionalMonth, DevotionalsSidebar } from "@/src/screens/Home/Devotionals/DevotionalsSidebar";
import { VideoIntro } from "@/src/screens/Home/Devotionals/VideoIntro";
import { CompletionPage } from "@/src/screens/Home/Devotionals/CompletionPage";
import { NoDevotionalPage } from "@/src/screens/Home/Devotionals/NoDevotionalPage";
import { useDevotionalEntry } from "@/src/hooks/useDevotionals";
import { useDevotionalsStore } from "@/src/stores/devotionalsStore";
import { DevotionalEntry, devotionApi } from "@/src/api/devotionApi";
import { showToast } from "@/src/utils/toast";
import { ResponseModal } from "@/src/screens/Home/Devotionals/ResponseModal";
import { DevotionalStorage } from "@/src/utils/DevotionalStorage";

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
    setEntry,        
    isLoading,         
    loadTodayEntry,
    loadEntryByDay,
  } = useDevotionalEntry();

  // Local state
  const [bookmarkedParagraphs, setBookmarkedParagraphs] = useState<number[]>([]);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [hasNoDevotional, setHasNoDevotional] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [isProcessingNavigation, setIsProcessingNavigation] = useState(false);

  const selectedTheme = useMemo(
    () => themeOptions.find((theme) => theme.id === selectedThemeId) ?? themeOptions[0],
    [selectedThemeId, themeOptions]
  );

  // Load today's entry on mount
  useEffect(() => {
    const initLoad = async () => {
      try {
        const todayEntry = await loadTodayEntry();
        
        if (!todayEntry) {
          setHasNoDevotional(true);
          setIsLoadingEntry(false);
          return;
        }
        
        setHasNoDevotional(false);
        
        if (todayEntry?.devotional_id) {
          setCurrentDevotionalId(todayEntry.devotional_id);
        }
        if (todayEntry?.day_number) {
          setCurrentDayNumber(todayEntry.day_number);
        }

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
        setHasNoDevotional(true);
        setIsLoadingEntry(false);
      }
    };
    initLoad();
  }, [loadTodayEntry]);

  // Load bookmarked paragraphs when entry changes
  useEffect(() => {
    const loadBookmarkedParagraphs = async () => {
      if (!entry?.id) {
        setBookmarkedParagraphs([]);
        return;
      }

      try {
        const paragraphIds = await devotionApi.getBookmarkedParagraphs(entry.id);
        setBookmarkedParagraphs(paragraphIds);
      } catch (error) {
        console.error('Failed to load bookmarked paragraphs:', error);
        setBookmarkedParagraphs([]);
      }
    };

    loadBookmarkedParagraphs();
  }, [entry?.id]);

  // Reset modal state when entry changes
  useEffect(() => {
    // Close modal when navigating to a new entry
    setShowResponseModal(false);
  }, [entry?.id]);

  const content = useMemo(() => {
    if (!entry) {
      return {
        title: "Welcome to Devotionals",
        body: "Loading today's devotional...",
        dateLabel: undefined,
      };
    }
    
    const cleanedContent = cleanDevotionalContent(entry.content);
    
    return {
      title: entry.title,
      body: cleanedContent,
      dateLabel: entry.date || undefined,
    };
  }, [entry]);

  const navigateToDay = useCallback(async (devotionalId: number, dayNumber: number) => {
    console.log('🔄 Navigating to:', { devotionalId, dayNumber });
    
    setIsNavigating(true);
    setShowVideoIntro(false);
    setIsLoadingEntry(true);
    setHasNoDevotional(false);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    setPendingVideoUrl(null);
    
    try {
      const fetchedEntry = await loadEntryByDay(devotionalId, dayNumber);
      
      if (!fetchedEntry) {
        console.warn('❌ No entry returned for day:', dayNumber);
        showToast({
          type: 'info',
          title: 'Day Not Available',
          message: `Day ${dayNumber} is not available in this devotional.`,
        });
        setIsLoadingEntry(false);
        setIsNavigating(false);
        return null;
      }
      
      console.log('✅ Entry loaded successfully:', {
        id: fetchedEntry.id,
        day: fetchedEntry.day_number,
        date: fetchedEntry.date,
      });
      
      setHasNoDevotional(false);
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
    } catch (error: any) {
      console.error('❌ Navigation failed:', error);
      
      // Handle 403 - Future devotional access denied
      if (error?.response?.status === 403) {
        const message = error?.response?.data?.message || 'This devotional is not available yet';
        console.log('🔒 Access denied (future date):', message);
        
        showToast({
          type: 'info',
          title: 'Not Available Yet',
          message: message,
        });
        
        // Stay on current entry
        setIsLoadingEntry(false);
        setIsNavigating(false);
        return null;
      }
      
      // Other errors
      console.error('Unexpected error:', error?.response?.status);
      setHasNoDevotional(true);
      setIsLoadingEntry(false);
      return null;
    } finally {
      setIsNavigating(false);
    }
  }, [loadEntryByDay]);

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

  /**
   * Handle saving devotional reflection
   */
  const handleSaveResponse = async (heart: string, takeaway: string) => {
    if (!entry?.id || isProcessingNavigation) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No devotional entry loaded',
      });
      return;
    }

    setIsSubmittingResponse(true);
    setIsProcessingNavigation(true);

    try {
      // Submit response to backend
      await devotionApi.submitResponse(entry.id, {
        heart_response: heart || undefined,
        takeaway_response: takeaway || undefined,
      });

      // Update entry state immediately
      const updatedEntry = { ...entry, has_submitted_response: true };
      setEntry(updatedEntry);
      
      // Update cache immediately
      await DevotionalStorage.saveEntry(updatedEntry);

      // Close modal
      setShowResponseModal(false);

      // Show success toast
      showToast({
        type: 'success',
        title: 'Reflection Saved',
        message: 'Your thoughts have been recorded',
      });

      // Wait for state to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      // Try to navigate to next day
      await proceedToNextDay();
      
    } catch (error: any) {
      console.error('❌ Failed to save response:', error);
      
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save your reflection. Please try again.',
      });
    } finally {
      setIsSubmittingResponse(false);
      setIsProcessingNavigation(false);
    }
  };

  /**
   * Handle skipping the response
   * Saves empty responses to backend to ensure modal won't show again
   */
  const handleSkipResponse = async () => {
    if (isProcessingNavigation || !entry?.id) return;
    
    setIsProcessingNavigation(true);
    setShowResponseModal(false);
    console.log('⏭️ User skipped reflection');
    
    try {
      // Submit empty responses to backend to mark as "submitted"
      // This ensures the modal won't show again even if cache is cleared
      await devotionApi.submitResponse(entry.id, {
        heart_response: undefined,
        takeaway_response: undefined,
      });
      
      console.log('✅ Skip saved to backend');
      
      // Update local state
      const updatedEntry = { ...entry, has_submitted_response: true };
      setEntry(updatedEntry);
      await DevotionalStorage.saveEntry(updatedEntry);
      
    } catch (error) {
      console.error('❌ Failed to save skip to backend:', error);
      
      // Even if backend fails, update local state
      // User experience is more important than perfect sync
      const updatedEntry = { ...entry, has_submitted_response: true };
      setEntry(updatedEntry);
      await DevotionalStorage.saveEntry(updatedEntry);
    }
    
    // Wait for state to settle
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try to navigate to next day
    await proceedToNextDay();
    
    setIsProcessingNavigation(false);
  };

  /**
   * Helper function to navigate to next day or show completion
   */
  const proceedToNextDay = async () => {
    const devotionalId = entry?.devotional_id || currentDevotionalId;
    if (!devotionalId) {
      console.error('No devotional ID available');
      return;
    }
    
    const totalDays = entry?.total_days || currentMonth?.entries_count || 31;
    
    // Check if this was the last day
    if (currentDayNumber >= totalDays) {
      showToast({
        type: 'success',
        title: 'Congratulations!',
        message: 'You have completed your devotional',
      });
      setShowCompletion(true);
      return;
    }
    
    // Try to navigate to next day
    const newDay = currentDayNumber + 1;
    const result = await navigateToDay(devotionalId, newDay);
    
    // If navigation failed due to 403, user will see toast and stay on current day
    // The entry's has_submitted_response is already marked as true, so modal won't show again
    if (!result) {
      console.log('Navigation to next day failed or was denied');
    }
  };

  const handleBeginDevotional = async () => {
    console.log('🎯 BEGIN DEVOTIONAL CLICKED'); 
    
    setShowVideoIntro(false);
    setPendingVideoUrl(null);
    setIsLoadingEntry(false);
    
    if (entry?.id) {
      try {
        console.log('📡 Calling API to mark as viewed...'); 
        
        await devotionApi.markViewed(entry.id);
        console.log('✅ Entry marked as viewed:', entry.id);
        
        // Update local state immediately
        setEntry((prev) => {
          if (!prev) return null;
          return { ...prev, viewed: true };
        });
        
        // Update cache
        const updatedEntry = { ...entry, viewed: true };
        await DevotionalStorage.saveEntry(updatedEntry);
        
        console.log('📦 Cache updated - video will not show again');
      } catch (error) {
        console.error('❌ Failed to mark entry as viewed:', error);
      }
    }
  };

  const handleVideoBack = () => {
    setShowVideoIntro(false);
    setPendingVideoUrl(null);
    setIsLoadingEntry(false);
  };

  const handleBookmarkParagraphs = async (paragraphIds: number[]) => {
    if (!entry || paragraphIds.length === 0) {
      console.warn('No entry loaded or no paragraphs selected');
      return;
    }

    setIsBookmarking(true);

    try {
      const paragraphs = content.body
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

      const selectedTexts = paragraphIds
        .map(id => paragraphs[id - 1])
        .filter(Boolean);

      const result = await devotionApi.bookmarkParagraphs(entry.id, {
        paragraph_ids: paragraphIds,
        paragraph_texts: selectedTexts,
      });

      setBookmarkedParagraphs(prev => {
        const newBookmarks = new Set([...prev, ...paragraphIds]);
        return Array.from(newBookmarks);
      });

      showToast({
        type: 'success',
        title: 'Bookmarked',
        message: result.message || `${paragraphIds.length} paragraph${paragraphIds.length > 1 ? 's' : ''} saved`,
      });
    } catch (error) {
      console.error('Failed to bookmark paragraphs:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save bookmark',
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleUnbookmarkParagraphs = async (paragraphIds: number[]) => {
    if (!entry || paragraphIds.length === 0) {
      console.warn('No entry loaded or no paragraphs selected');
      return;
    }

    setIsBookmarking(true);

    try {
      const result = await devotionApi.removeBookmarkedParagraphs(entry.id, paragraphIds);

      setBookmarkedParagraphs(prev => prev.filter(id => !paragraphIds.includes(id)));

      showToast({
        type: 'success',
        title: 'Unbookmarked',
        message: result.message || `${paragraphIds.length} paragraph${paragraphIds.length > 1 ? 's' : ''} removed`,
      });
    } catch (error) {
      console.error('Failed to unbookmark paragraphs:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove bookmark',
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handlePrevPage = useCallback(async () => {
    if (currentDayNumber <= 1 || isNavigating) return;
    
    const devotionalId = entry?.devotional_id || currentDevotionalId;
    if (!devotionalId) return;
    
    const newDay = currentDayNumber - 1;
    await navigateToDay(devotionalId, newDay);
  }, [currentDayNumber, entry?.devotional_id, currentDevotionalId, navigateToDay, isNavigating]);

  /**
   * Handle next page navigation
   * Shows response modal if user hasn't submitted response
   * (Video watching is optional - not enforced)
   */
  const handleNextPage = useCallback(async () => {
    if (isNavigating || isProcessingNavigation) return;
    
    const devotionalId = entry?.devotional_id || currentDevotionalId;
    if (!devotionalId) return;
    
    const totalDays = entry?.total_days || currentMonth?.entries_count || 31;
    
    // Check if we're at the last day
    if (currentDayNumber >= totalDays) {
      showToast({
        type: 'success',
        title: 'Congratulations!',
        message: 'You have completed your devotional',
      });
      setShowCompletion(true);
      return;
    }
    
    // ===== REMOVED: Video check is no longer mandatory =====
    // Video will show on entry load if not viewed, but user can skip it
    // and still navigate. If they come back later without watching,
    // video shows again (handled in entry loading logic).
    
    // Check if user should reflect first (ONLY if they haven't submitted yet)
    if (entry && !entry.has_submitted_response && !showResponseModal) {
      console.log('📝 Prompting user to reflect before continuing');
      setShowResponseModal(true);
      return;
    }
    
    // If modal is already showing, don't proceed
    if (showResponseModal) {
      console.log('⚠️ Modal is open, waiting for user action');
      return;
    }
    
    // All checks passed - proceed to next day
    console.log('✅ Proceeding to next day');
    const newDay = currentDayNumber + 1;
    await navigateToDay(devotionalId, newDay);
  }, [currentDayNumber, entry, currentDevotionalId, currentMonth, navigateToDay, isNavigating, isProcessingNavigation, showResponseModal]);

  // Show completion page
  if (showCompletion) {
    return <CompletionPage onBack={() => setShowCompletion(false)} />;
  }

  // Show "No Devotional" page
  if (hasNoDevotional && !isLoading && !isLoadingEntry && !isNavigating) {
    return (
      <>
        <NoDevotionalPage
          theme={selectedTheme}
          onBack={() => {
            setHasNoDevotional(false);
            loadTodayEntry().then((todayEntry) => {
              if (todayEntry) {
                setHasNoDevotional(false);
              }
            });
          }}
          onOpenSidebar={() => setSidebarVisible(true)}
          dateLabel={content.dateLabel}
        />
        
        <DevotionalsSidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onSelectDay={handleDaySelected}
          surfaceColor={selectedTheme.sidebarBackground}
          textColor={selectedTheme.sidebarTextColor}
          accentColor={selectedTheme.accentColor}
        />
      </>
    );
  }

  // Show loading screen
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
      {/* Main Devotionals Component */}
      {!isLoadingEntry && !showVideoIntro && (
        <Devotionals
          onOpenSidebar={() => setSidebarVisible(true)}
          settingsVisible={settingsVisible}
          onToggleSettings={() => setSettingsVisible(!settingsVisible)}
          themeOptions={themeOptions}
          content={content}
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
          bookmarkedParagraphs={bookmarkedParagraphs}
          onBookmarkParagraphs={handleBookmarkParagraphs}
          onUnbookmarkParagraphs={handleUnbookmarkParagraphs}
          isBookmarking={isBookmarking}
          hasSubmittedResponse={entry?.has_submitted_response || false}
          currentMonth={currentMonth}
          onShowSettings={() => setSettingsVisible(true)}
          onHideSettings={() => setSettingsVisible(false)}
        />
      )}

      {/* Sidebar */}
      <DevotionalsSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onSelectDay={handleDaySelected}
        surfaceColor={selectedTheme.sidebarBackground}
        textColor={selectedTheme.sidebarTextColor}
        accentColor={selectedTheme.accentColor}
      />

      {/* Loading Overlay */}
      {(isLoading || isLoadingEntry || isNavigating) && !showVideoIntro && (
        <View style={[styles.loadingOverlay, { backgroundColor: selectedTheme.backgroundColor }]}>
          <ActivityIndicator size="large" color={selectedTheme.textColor} />
          <Text style={[styles.loadingText, { color: selectedTheme.textColor }]}>
            Loading devotional...
          </Text>
        </View>
      )}

      {/* Video Intro */}
      {showVideoIntro && (
        <VideoIntro 
          key={`video-${videoKey}-${pendingVideoUrl}`}
          onBeginDevotional={handleBeginDevotional} 
          videoUri={pendingVideoUrl || undefined}
          onBack={handleVideoBack}
        />
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <ResponseModal
          visible={showResponseModal}
          onSave={handleSaveResponse}
          onSkip={handleSkipResponse}
          theme={selectedTheme}
          isSubmitting={isSubmittingResponse}
          dateLabel={content.dateLabel}
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