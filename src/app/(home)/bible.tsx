import React, { useMemo, useState, useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Bible } from "@/src/screens";
import { useBible } from "@/src/hooks/useBible";
import { useNotes } from "@/src/hooks/useNotes";
import { Book } from "@/src/api/bibleApi";
import { BibleStorage } from "@/src/utils/bibleStorage";
import { BibleDownloadManager } from "@/src/components/BibleDownloadManager";

const bibleThemes = [
    {
        id: "classic",
        backgroundColor: "#FFFFFF",
        textColor: "#0C154C",
        panelBackground: "#fff",
        panelTextColor: "#0C154C",
        accentColor: "#fff",
        sidebarBackground: "#FFFFFF",
        sidebarTextColor: "#0C154C",
        label: "Classic"
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
        label: "Sepia"
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
        label: "Mist"
    },
    {
        id: "dusk",
        backgroundColor: "#eaf6f6",
        textColor: "#121116",
        panelBackground: "#eaf6f6",
        panelTextColor: "#121116",
        accentColor: "#2D2B54",
        sidebarBackground: "#eaf6f6",
        sidebarTextColor: "#121116",
        headerButtonBackground: "#ffffff",
        headerButtonBorderColor: "#ffffff",
        headerButtonBorderWidth: 1,
        label: "Dusk"
    },
    {
        id: "midnight",
        backgroundColor: "#000",
        textColor: "#F4F4F8",
        panelBackground: "#000",
        panelTextColor: "#F4F4F8",
        accentColor: "#000",
        sidebarBackground: "#000",
        sidebarTextColor: "#F4F4F8",
        label: "Midnight"
    },
];

export default function BiblePage() {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(true);
    const [selectedThemeId, setSelectedThemeId] = useState("classic");
    const [fontSize, setFontSize] = useState(18);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 26;

    // Track current book and chapter
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [currentChapterNumber, setCurrentChapterNumber] = useState<number>(1);

    // Offline Bible data state
    const [hasBibleData, setHasBibleData] = useState<boolean>(false);
    const [showDownloadManager, setShowDownloadManager] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    const { currentChapter, fetchChapter, clearCurrentChapter, isLoadingChapter, downloadProgress } = useBible();

    // Initialize notes store
    useNotes();

    // Load preferences on component mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const prefs = await BibleStorage.getPreferences();
                setSelectedThemeId(prefs.themeId);
                setFontSize(prefs.fontSize);

                // Check if Bible data exists
                const bibleDataExists = await BibleStorage.hasBibleData();
                setHasBibleData(bibleDataExists);

                if (!bibleDataExists) {
                    // Show download manager if no Bible data
                    setShowDownloadManager(true);
                } else if (prefs.lastRead) {
                    // Auto-load last read chapter if Bible data exists
                    console.log('Auto-loading last read chapter:', prefs.lastRead);

                    // Find the book in local data to set it
                    const localData = await BibleStorage.getBibleData();
                    if (localData && prefs.lastRead) {
                        const lastReadBook = localData.books.find(book => book.id === prefs.lastRead!.bookId);
                        if (lastReadBook) {
                            setCurrentBook(lastReadBook);
                            setCurrentChapterNumber(prefs.lastRead!.chapterNumber);
                            // Fetch the chapter content
                            fetchChapter(lastReadBook.id, prefs.lastRead!.chapterNumber);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            } finally {
                // Always set initializing to false after loading
                setIsInitializing(false);
            }
        };

        loadPreferences();
    }, []);

    // Handle download completion
    const handleDownloadComplete = () => {
        setShowDownloadManager(false);
        setHasBibleData(true);
    };

    // Handle download cancellation
    const handleDownloadCancel = () => {
        setShowDownloadManager(false);
        // User can still use the app but will need to download later
    };

    // Save theme preference when it changes
    useEffect(() => {
        BibleStorage.saveTheme(selectedThemeId).catch(error => {
            console.error('Failed to save theme preference:', error);
        });
    }, [selectedThemeId]);

    // Save font size preference when it changes
    useEffect(() => {
        BibleStorage.saveFontSize(fontSize).catch(error => {
            console.error('Failed to save font size preference:', error);
        });
    }, [fontSize]);

    // Save reading progress when chapter changes
    useEffect(() => {
        if (currentBook && currentChapterNumber) {
            BibleStorage.saveLastRead(currentBook.id, currentChapterNumber).catch(error => {
                console.error('Failed to save reading progress:', error);
            });
        }
    }, [currentBook, currentChapterNumber]);

    // Default content when no chapter is selected
    const defaultContent = useMemo(() => ({
        dateLabel: "Welcome",
        title: "Select a Chapter",
        body: "Tap the menu button to browse the Bible and select a chapter to read.",
    }), []);

    const readingContent = currentChapter || defaultContent;

    const handleOpenSidebar = () => setSidebarVisible(true);
    const handleCloseSidebar = () => setSidebarVisible(false);

    const handleChapterSelected = ({ book, chapter }: { book: Book; chapter: number }) => {
        setCurrentBook(book);
        setCurrentChapterNumber(chapter);
        fetchChapter(book.id, chapter);
        setSidebarVisible(false);
    };

    const handleToggleSettings = () => setSettingsVisible((prev) => !prev);

    const handleSelectTheme = (themeId: string) => {
        setSelectedThemeId(themeId);
    };

    const handleFontSizeChange = (delta: number) => {
        setFontSize((prev) => Math.min(30, Math.max(12, prev + delta)));
    };

    const handlePrevChapter = () => {
        if (currentBook && currentChapterNumber > 1) {
            const newChapter = currentChapterNumber - 1;
            setCurrentChapterNumber(newChapter);
            fetchChapter(currentBook.id, newChapter);
        }
    };

    const handleNextChapter = () => {
        if (currentBook && currentChapterNumber < currentBook.chapters_count) {
            const newChapter = currentChapterNumber + 1;
            setCurrentChapterNumber(newChapter);
            fetchChapter(currentBook.id, newChapter);
        }
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : totalPages));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : 1));
    };

    return(
        <>
            {isInitializing ? (
                // Loading screen while checking preferences and data
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0C154C" />
                    <Text style={styles.loadingText}>Loading Bible...</Text>
                </View>
            ) : (
                <>
                    <Bible
                        sidebarVisible={sidebarVisible}
                        onOpenSidebar={handleOpenSidebar}
                        onCloseSidebar={handleCloseSidebar}
                        onChapterSelected={handleChapterSelected}
                        content={readingContent}
                        currentBook={currentBook}
                        currentChapterNumber={currentChapterNumber}
                        isLoadingChapter={isLoadingChapter}
                        settingsVisible={settingsVisible}
                        onToggleSettings={handleToggleSettings}
                        themeOptions={bibleThemes}
                        selectedThemeId={selectedThemeId}
                        onSelectTheme={handleSelectTheme}
                        fontSize={fontSize}
                        onFontSizeChange={handleFontSizeChange}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPrevPage={handlePrevChapter}
                        onNextPage={handleNextChapter}
                        downloadProgress={downloadProgress}
                    />

                    {showDownloadManager && (
                        <BibleDownloadManager
                            onComplete={handleDownloadComplete}
                            onCancel={handleDownloadCancel}
                        />
                    )}
                </>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#0C154C',
        fontWeight: '500',
    },
});