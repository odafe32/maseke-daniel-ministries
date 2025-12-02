import React, { useState, useRef, useMemo, useEffect } from "react";
import { SavedNotes } from "@/src/screens/Home/Profile/SavedNotes";
import { useRouter } from "expo-router";
import { Animated } from "react-native";
import { Note } from "@/src/api/notesApi";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { useNotes } from "@/src/hooks/useNotes";
import { showSuccessToast } from "@/src/utils/toast";
import { bibleApi } from "@/src/api/bibleApi";

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
        getVerseText={getVerseTextForNote}
      />
    </AuthPageWrapper>
  );
}