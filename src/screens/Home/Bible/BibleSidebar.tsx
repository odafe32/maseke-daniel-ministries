import React, { useMemo, useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemeText } from "@/src/components";
import { getColor, wp } from "@/src/utils";
import { useRouter } from "expo-router";
import { useBible, useBibleBooks } from "@/src/hooks/useBible";
import { Book, Testament as ApiTestament } from "@/src/api/bibleApi";
import { BibleStorage } from "@/src/utils/bibleStorage";
import { useBibleStore } from "@/src/stores/bibleStore";

type BibleSidebarProps = {
  visible: boolean;
  onClose: () => void;
  onSelectChapter?: (payload: { book: Book; chapter: number }) => void;
  surfaceColor?: string;
  textColor?: string;
  accentColor?: string;
  currentBook?: Book | null;
};

export function BibleSidebar({ visible, onClose, onSelectChapter, surfaceColor, textColor, accentColor, currentBook }: BibleSidebarProps) {
  const colors = getColor();
  const router = useRouter();
  const { testaments, isLoadingTestaments } = useBible();
  const bibleStore = useBibleStore();

  const [selectedTestament, setSelectedTestament] = useState<ApiTestament | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [downloadingBook, setDownloadingBook] = useState<Book | null>(null);

  // Custom modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [modalBook, setModalBook] = useState<Book | null>(null);

  // Determine if accent color is light (needs dark text) or dark (needs light text)
  const getButtonTextColor = (accentColor: string) => {
    // Convert hex to RGB to check brightness
    let hex = accentColor.replace('#', '');

    // Handle 3-digit hex codes (e.g., #fff → #ffffff)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return dark text for light backgrounds, light text for dark backgrounds
    return brightness > 128 ? '#333' : '#fff';
  };

  const sidebarSurface = surfaceColor ?? colors.card;
  const primaryText = textColor ?? colors.primary;
  const accent = accentColor ?? colors.primary;
  const buttonTextColor = getButtonTextColor(accent);

  // Reset selections when sidebar closes, or auto-select testament when sidebar opens with currentBook
  useEffect(() => {
    if (!visible) {
      setSelectedTestament(null);
      setSelectedBook(null);
    } else if (visible && currentBook && testaments.length > 0) {
      // Find the testament that contains the currentBook
      const testament = testaments.find(t => 
        t.books && t.books.some(b => b.id === currentBook.id)
      );
      if (testament) {
        setSelectedTestament(testament);
      }
    }
  }, [visible, currentBook, testaments]);

  const { books: testamentBooks, isLoading: isLoadingBooks } = useBibleBooks(selectedTestament?.id);

  // Check if a book is downloaded locally
  const isBookDownloaded = async (bookId: number): Promise<boolean> => {
    try {
      const localData = await BibleStorage.getBibleData();
      return localData ? localData.books.some(book => book.id === bookId) : false;
    } catch {
      return false;
    }
  };

  // Check internet connectivity
  const checkInternetConnection = async (): Promise<boolean> => {
    try {
      // Simple connectivity check by trying to reach a reliable endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      // If fetch fails or times out, assume no internet
      return false;
    }
  };

  const canGoBack = useMemo(
    () => Boolean(selectedBook || selectedTestament),
    [selectedBook, selectedTestament]
  );

  const headerTitle = useMemo(() => {
    if (selectedBook) {
      return selectedBook.name;
    }
    if (selectedTestament) {
      return selectedTestament.name;
    }
    return "Bible";
  }, [selectedBook, selectedTestament]);

  const handleBack = () => {
    if (selectedBook) {
      setSelectedBook(null);
      return;
    }
    if (selectedTestament) {
      setSelectedTestament(null);
      return;
    }
  };

  const handleClose = () => {
    setSelectedBook(null);
    setSelectedTestament(null);
    onClose();
  };

  const handleNotesPress = () => {
    handleClose();
    router.push("/saved-notes");
  };

  const handleTestamentPress = (testament: ApiTestament) => {
    setSelectedTestament(testament);
  };

  const handleBookPress = async (book: Book) => {
    // Check if book is already downloaded
    const downloaded = await isBookDownloaded(book.id);

    if (downloaded) {
      // Book is already downloaded, select it
      setSelectedBook(book);
      return;
    }

    // Book not downloaded - check internet connectivity
    const hasInternet = await checkInternetConnection();

    if (!hasInternet) {
      // User is offline - show custom modal
      setModalBook(book);
      setShowOfflineModal(true);
      return;
    }

    // User is online - show download modal with choice
    setModalBook(book);
    setShowDownloadModal(true);
  };

  const handleChapterPress = (chapter: number) => {
    if (!selectedBook) return;
    handleClose();
    onSelectChapter?.({
      book: selectedBook,
      chapter,
    });
  };

  const renderList = () => {
    if (isLoadingTestaments) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryText} />
        </View>
      );
    }

    if (!selectedTestament) {
      return testaments.map((testament) => (
        <SidebarRow
          key={testament.id}
          label={testament.name}
          onPress={() => handleTestamentPress(testament)}
          textColor={primaryText}
          accentColor={accent}
        />
      ));
    }

    if (isLoadingBooks) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryText} />
        </View>
      );
    }

    if (!selectedBook) {
      return testamentBooks.map((book) => (
        <SidebarRow
          key={book.id}
          label={`${book.name}`}
          onPress={() => handleBookPress(book)}
          textColor={primaryText}
          accentColor={accent}
        />
      ));
    }

    const chapters = Array.from({ length: selectedBook.chapters_count }, (_, index) => index + 1);
    return chapters.map((chapter) => (
      <SidebarRow
        key={chapter}
        label={`Chapter ${chapter}`}
        onPress={() => handleChapterPress(chapter)}
        textColor={primaryText}
        accentColor={accent}
      />
    ));
  };

  return (
    <>
      <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.sidebar, { backgroundColor: sidebarSurface }]}>
            <View style={styles.header}>
              {canGoBack ? (
                <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                  <Feather name="chevron-left" size={20} color={primaryText} />
                </TouchableOpacity>
              ) : (
                <View style={styles.iconSpacer} />
              )}

              <ThemeText variant="h3" style={[styles.headerTitle, { color: primaryText }]}>
                {headerTitle}
              </ThemeText>

              <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                <Feather name="x" size={20} color={primaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.list}>{renderList()}</ScrollView>

            <TouchableOpacity style={styles.notesRow} onPress={handleNotesPress}>
              <Feather name="bookmark" size={18} color={primaryText} />
              <ThemeText variant="bodyBold" style={[styles.notesLabel, { color: primaryText }]}>
                Notes
              </ThemeText>
              <Feather name="chevron-right" size={18} color={primaryText} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Download Modal */}
      <Modal animationType="fade" transparent visible={showDownloadModal} onRequestClose={() => setShowDownloadModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowDownloadModal(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalContainer, { backgroundColor: sidebarSurface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: primaryText }]}>Download Book</Text>
              <TouchableOpacity
                onPress={() => setShowDownloadModal(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={20} color={primaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Feather name="download" size={48} color={accent} style={styles.modalIcon} />
              <Text style={[styles.modalMessage, { color: primaryText }]}>
                Download "{modalBook?.name}" for offline reading?
              </Text>
              <Text style={[styles.modalSubtext, { color: primaryText, opacity: 0.7 }]}>
                {modalBook?.chapters_count} chapters • ~{Math.round((modalBook?.chapters_count || 0) * 2.5)}KB
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => {
                  // Access online without downloading
                  setShowDownloadModal(false);
                  setSelectedBook(modalBook);
                }}
              >
                <Text style={[styles.modalButtonText, { color: primaryText }]}>Access Online</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: accent }]}
                onPress={async () => {
                  if (modalBook) {
                    setShowDownloadModal(false);
                    setSelectedBook(modalBook); // Allow online access immediately
                    onClose(); // Close sidebar

                    // Select first chapter to start reading immediately
                    onSelectChapter?.({ book: modalBook, chapter: 1 });

                    // Start background download
                    setModalBook(modalBook);
                    setDownloadingBook(modalBook);

                    try {
                      await bibleStore.downloadBook(modalBook.id);
                      setDownloadingBook(null);
                      // Book is now available offline
                    } catch (error) {
                      setDownloadingBook(null);
                      Alert.alert('Download Failed', 'Failed to download the book. Please check your internet connection and try again.');
                    }
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: buttonTextColor }]}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Offline Modal */}
      <Modal animationType="fade" transparent visible={showOfflineModal} onRequestClose={() => setShowOfflineModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowOfflineModal(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.modalContainer, { backgroundColor: sidebarSurface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: primaryText }]}>Offline Access</Text>
              <TouchableOpacity
                onPress={() => setShowOfflineModal(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={20} color={primaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Feather name="wifi-off" size={48} color={accent} style={styles.modalIcon} />
              <Text style={[styles.modalMessage, { color: primaryText }]}>
                "{modalBook?.name}" requires an internet connection to access.
              </Text>
              <Text style={[styles.modalSubtext, { color: primaryText, opacity: 0.7 }]}>
                Come online to read this book or download it for offline access.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: accent }]}
                onPress={() => setShowOfflineModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type SidebarRowProps = {
  label: string;
  onPress: () => void;
  textColor?: string;
  accentColor?: string;
};

const SidebarRow = ({ label, onPress, textColor = "#0C154C", accentColor = "#0C154C" }: SidebarRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <ThemeText variant="bodyBold" style={[styles.rowLabel, { color: textColor }]}>
      {label}
    </ThemeText>
    <Feather name="chevron-right" size={18} color={accentColor} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  downloadingText: {
    marginTop: wp(12),
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: wp(40),
  },
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sidebar: {
    width: "72%",
    height: "100%",
    paddingTop: wp(14),
    paddingHorizontal: wp(18),
    paddingBottom: wp(18),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: wp(12),
  },
  headerTitle: {
    fontFamily: "DMSans-Bold",
  },
  iconButton: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    justifyContent: "center",
    alignItems: "center",
  },
  iconSpacer: {
    width: wp(32),
  },
  list: {
    paddingBottom: wp(24),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: wp(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(12, 21, 76, 0.08)",
  },
  rowLabel: {
    fontFamily: "DMSans-Medium",
    color: "#0C154C",
  },
  notesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(8),
    paddingVertical: wp(14),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(12, 21, 76, 0.08)",
  },
  notesLabel: {
    flex: 1,
    marginLeft: wp(4),
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 16,
    padding: wp(20),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(16),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: wp(4),
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: wp(24),
  },
  modalIcon: {
    marginBottom: wp(12),
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: wp(8),
    lineHeight: 22,
  },
  modalSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: wp(12),
    paddingHorizontal: wp(16),
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  confirmButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});