import React, { useState, useRef, useEffect } from "react";
import { SavedNotes } from "@/src/screens/Home/Profile/SavedNotes";
import { useRouter } from "expo-router";
import { Animated } from "react-native";
import { savedNotesData, SavedNote, NoteType } from "@/src/constants/data";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";

export default function SavedNotesPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | NoteType>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleFilterChange = (filter: 'all' | NoteType) => {
    setActiveFilter(filter);
  };

  const handleNotePress = (note: SavedNote) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getDisplayDate = (note: SavedNote) => {
    const date = formatDate(note.date);
    return activeFilter === 'all' 
      ? `${note.type === 'devotional' ? 'Dev' : 'Bible'}. ${date}`
      : date;
  };

  const filteredNotes = activeFilter === 'all' 
    ? savedNotesData 
    : savedNotesData.filter(note => note.type === activeFilter);

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <SavedNotes 
        onBack={handleBack}
        savedNotesData={savedNotesData}
        filteredNotes={filteredNotes}
        loading={loading}
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
      />
    </AuthPageWrapper>
  );
}