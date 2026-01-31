import React, { useState, useRef, useMemo } from "react";
import { SavedNotes } from "@/src/screens/Home/Profile/SavedNotes";
import { useRouter } from "expo-router";
import { Animated } from "react-native";
import { Note } from "@/src/api/notesApi";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { useNotes } from "@/src/hooks/useNotes";
import { showSuccessToast } from "@/src/utils/toast";
import { devotionApi, DevotionalEntry } from "@/src/api/devotionApi";

type NoteFilter = "all" | "bible" | "devotional";

export default function SavedNotesPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const { notes, isLoadingNotes, deleteNote, ensureChapterVerses, getVerseTextForNote } = useNotes();
  const [activeFilter, setActiveFilter] = useState<NoteFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleFilterChange = (filter: NoteFilter) => {
    setActiveFilter(filter);
  };

  const handleNotePress = (note: Note) => {
    if (note.book?.id && note.chapter) {
      ensureChapterVerses(note.book.id, note.chapter).catch(err =>
        console.error('Failed to ensure chapter verses:', err)
      );
    }

    setSelectedNote(note);
    setModalVisible(true);

    // Start animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    // Reverse animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedNote(null);
    })
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getDisplayDate = (note: Note) => {
    const date = formatDate(note.updated_at ?? note.created_at);
    return activeFilter === 'all' 
      ? `${note.content ? 'Dev' : 'Bible'}. ${date}`
      : date;
  };

  const filteredNotes = useMemo(() => {
    if (activeFilter === 'all') return notes;

    if (activeFilter === 'devotional') {
      return notes.filter(note => Boolean(note.content));
    }

    return notes.filter(note => !note.content);
  }, [notes, activeFilter]);

  const handleDeleteNote = (noteId: number) => {
    return deleteNote(noteId)
      .then(success => {
        if (success) {
          showSuccessToast('Note removed');
        }
        return success;
      })
      .catch(error => {
        console.error('Failed to delete note:', error);
        return false;
      });
  };

  const handleViewNote = async (note: Note) => {
    const isDevotionalNote = Boolean(note.content && note.content.trim().length);
    
    if (isDevotionalNote) {
      try {
        const devotionals = await devotionApi.getDevotionals();
        
        // Find entries from devotionals that match the note's creation date
        let targetEntry: DevotionalEntry | null = null;
        const noteDate = new Date(note.created_at);
        
        for (const devotional of devotionals) {
          try {
            const devotionalDetail = await devotionApi.getDevotional(devotional.id);
            
            // Find the entry closest to the note's creation date
            for (const entry of devotionalDetail.entries) {
              const entryDate = entry.date ? new Date(entry.date) : null;
              
              if (entryDate) {
                const timeDiff = Math.abs(entryDate.getTime() - noteDate.getTime());
                // If within 24 hours, consider it a match
                if (timeDiff < 24 * 60 * 60 * 1000) {
                  targetEntry = entry;
                  break;
                }
              }
            }
            
            if (targetEntry) break;
          } catch (error) {
            // Continue to next devotional if this one fails
            continue;
          }
        }
        
        if (targetEntry) {
          // Navigate to the specific devotional entry
          router.push({
            pathname: '/(home)/devotionals',
            params: {
              devotionalId: targetEntry.devotional_id,
              dayNumber: targetEntry.day_number,
            }
          });
        } else {
          // Fallback to general devotionals screen
          router.push('/(home)/devotionals');
        }
      } catch (error) {
        console.error('Failed to find specific devotional entry:', error);
        // Fallback to general devotionals screen
        router.push('/(home)/devotionals');
      }
    } else {
      // Navigate to bible screen with specific book and chapter
      // Use search params to pass the book ID and chapter
      router.push({
        pathname: '/(home)/bible',
        params: {
          bookId: note.book?.id,
          chapter: note.chapter,
          verses: note.verses?.join(',') || ''
        }
      });
    }
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <SavedNotes 
        onBack={handleBack}
        filteredNotes={filteredNotes}
        loading={isLoadingNotes}
        activeFilter={activeFilter}
        modalVisible={modalVisible}
        selectedNote={selectedNote}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
        onFilterChange={handleFilterChange}
        onNotePress={handleNotePress}
        onCloseModal={handleCloseModal}
        formatDate={formatDate}
        getDisplayDate={getDisplayDate}
        onDeleteNote={handleDeleteNote}
        onViewNote={handleViewNote}
        getVerseText={getVerseTextForNote}
      />
    </AuthPageWrapper>
  );
}