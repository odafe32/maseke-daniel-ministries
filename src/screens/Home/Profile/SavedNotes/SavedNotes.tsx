import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { BackHeader, ThemeText, Icon } from "@/src/components";
import { SavedNote, NoteType } from "@/src/constants/data";
import { fs, hp, wp, wpt } from "@/src/utils";

const { width: screenWidth } = Dimensions.get("window");

interface SavedNotesProps {
  onBack: () => void;
  savedNotesData: SavedNote[];
  filteredNotes: SavedNote[];
  loading: boolean;
  activeFilter: 'all' | NoteType;
  modalVisible: boolean;
  selectedNote: SavedNote | null;
  slideAnim: Animated.Value;
  fadeAnim: Animated.Value;
  onFilterChange: (filter: 'all' | NoteType) => void;
  onNotePress: (note: SavedNote) => void;
  onCloseModal: () => void;
  formatDate: (dateString: string) => string;
  getDisplayDate: (note: SavedNote) => string;
}

export function SavedNotes({
  onBack,
  savedNotesData,
  filteredNotes,
  loading,
  activeFilter,
  modalVisible,
  selectedNote,
  slideAnim,
  fadeAnim,
  onFilterChange,
  onNotePress,
  onCloseModal,
  formatDate,
  getDisplayDate,
}: SavedNotesProps) {

  const renderNoteCard = ({ item }: { item: SavedNote }) => (
    <TouchableOpacity 
      style={[
        styles.noteCard, 
        { 
          width: wpt(42),
        }
      ]}
      activeOpacity={0.8}
      onPress={() => onNotePress(item)}
    >
      <ThemeText variant="body" style={styles.noteText} numberOfLines={6}>
        {item.text}
      </ThemeText>
      
      <View style={styles.noteFooter}>
        <View style={styles.savedInfo}>
          <Icon name="bookmark" size={14} color="#3B4897" />
        </View>
        
        <ThemeText variant="caption" style={styles.noteDate}>
          {getDisplayDate(item)}
        </ThemeText>
      </View>
    </TouchableOpacity>
  );

  const renderSkeletonNoteCard = (index: number) => {
    const cardWidth = wpt(42);
    
    return (
      <View key={`skeleton-${index}`} style={[styles.skeletonNoteCard, { width: cardWidth }]}>
        <View style={styles.skeletonTextContainer}>
          <View style={[styles.skeletonBar, { width: '100%', marginBottom: hp(8) }]} />
          <View style={[styles.skeletonBar, { width: '85%', marginBottom: hp(8) }]} />
          <View style={[styles.skeletonBar, { width: '90%', marginBottom: hp(8) }]} />
          <View style={[styles.skeletonBar, { width: '75%' }]} />
        </View>
        
        <View style={styles.skeletonFooter}>
          <View style={styles.skeletonBookmark} />
          <View style={[styles.skeletonBar, { width: wp(60), height: hp(12) }]} />
        </View>
      </View>
    );
  };

  const FilterButton = ({ filter, label }: { filter: 'all' | NoteType; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        ...(activeFilter === filter ? [styles.activeFilterButton] : [])
      ]}
      onPress={() => onFilterChange(filter)}
      activeOpacity={0.7}
    >
      <ThemeText 
        variant="bodySmall" 
        style={[
          styles.filterButtonText,
          ...(activeFilter === filter ? [styles.activeFilterButtonText] : [])
        ]}
      >
        {label}
      </ThemeText>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader title="Saved Notes" onBackPress={onBack} />

        <View style={styles.filterContainer}>
          <FilterButton filter="all" label="All" />
          <FilterButton filter="devotional" label="Devotional Notes" />
          <FilterButton filter="bible" label="Bible Notes" />
        </View>

        {loading ? (
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 12 }).map((_, index) => renderSkeletonNoteCard(index))}
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={({ item }) => renderNoteCard({ item })}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={onCloseModal}
      >
        {/* Backdrop */}
        <Animated.View 
          style={[
            styles.modalBackdrop,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable} 
            activeOpacity={1} 
            onPress={onCloseModal} 
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenWidth, 0],
                  }),
                },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={styles.modalTitleIconContainer}>
                <Feather name="bookmark" size={20} color="#3B4897" />
              </View>
              <View style={styles.modalTitleTextContainer}>
                <ThemeText variant="h3" style={styles.modalTitle}>
                  {selectedNote?.type === 'devotional' ? 'Devotional Note' : 'Bible Note'}
                </ThemeText>
                <ThemeText variant="caption" style={styles.modalSubtitle}>
                  Saved on {selectedNote ? formatDate(selectedNote.date) : ''}
                </ThemeText>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onCloseModal}
              activeOpacity={0.7}
            >
              <Feather name="x" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalBody}>
            <ThemeText variant="body" style={styles.modalNoteText}>
              {selectedNote?.text}
            </ThemeText>
            
            <View style={styles.modalFooter}>
              <View style={styles.modalSummaryContainer}>
                <View style={styles.modalSummaryHeader}>
                  <ThemeText variant="h4" style={styles.modalSummaryTitle}>
                    Note Details
                  </ThemeText>
                </View>
                
                <View style={styles.modalSummaryDetails}>
                  <View style={styles.modalSummaryRow}>
                    <ThemeText variant="body" style={styles.modalSummaryLabel}>
                      Type:
                    </ThemeText>
                    <View style={styles.modalNoteTypeBadge}>
                      <ThemeText variant="bodySmall" style={styles.modalNoteTypeText}>
                        {selectedNote?.type === 'devotional' ? 'Devotional' : 'Bible'}
                      </ThemeText>
                    </View>
                  </View>
                  
                  <View style={styles.modalSummaryDivider} />
                  
                  <View style={styles.modalDateContainer}>
                    <View style={styles.modalDateIconContainer}>
                      <Feather name="calendar" size={14} color="#3B4897" />
                    </View>
                    <View style={styles.modalDateTextContainer}>
                      <ThemeText variant="caption" style={styles.modalDateLabel}>
                        Saved Date:
                      </ThemeText>
                      <ThemeText variant="body" style={styles.modalDateValue}>
                        {selectedNote ? formatDate(selectedNote.date) : ''}
                      </ThemeText>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: hp(16),
    paddingBottom: hp(20),
    gap: hp(20),
  },
  filterContainer: {
    flexDirection: 'row',
    gap: wp(8),
    marginBottom: hp(8),
  },
  filterButton: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
    borderRadius: wp(12),
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  activeFilterButton: {
    backgroundColor: '#E6F0FF',
    borderColor: '#032B6B',
  },
  filterButtonText: {
    color: '#424242',
    fontSize: fs(14),
    fontFamily: 'Geist-SemiBold',
  },
  activeFilterButtonText: {
    color: '#032B6B',
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  noteCard: {
    padding: hp(12),
    borderRadius: wp(12),
    marginBottom: hp(8),
    minHeight: hp(100),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#FFCF4D',
  },
  noteText: {
    color: '#434343',
    fontSize: fs(16),
    lineHeight: 20,
    marginBottom: hp(8),
    flex: 1,
    fontFamily: 'Geist-Regular',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  savedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteDate: {
    color: '#575757',
    fontSize: fs(14),
    fontFamily: 'Geist-Medium',
  },
  skeletonNoteCard: {
    padding: hp(12),
    borderRadius: wp(12),
    marginBottom: hp(8),
    minHeight: hp(100),
    backgroundColor: '#F5F5F5',
  },
  skeletonTextContainer: {
    flex: 1,
    marginBottom: hp(8),
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  skeletonBar: {
    height: hp(14),
    borderRadius: wp(4),
    backgroundColor: '#E3E6EB',
  },
  skeletonBookmark: {
    width: wp(14),
    height: hp(14),
    borderRadius: wp(2),
    backgroundColor: '#E3E6EB',
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skeletonItemContainer: {
    width: wp(48),
    marginBottom: hp(12),
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    gap: wp(8),
  },
  separator: {
    height: hp(12),
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitleIconContainer: {
    width: wp(40),
    height: hp(40),
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleTextContainer: {
    flex: 1,
  },
  modalTitle: {
    color: '#121116',
    fontFamily: 'Geist-Bold',
    fontSize: fs(18),
    marginBottom: 2,
  },
  modalSubtitle: {
    color: '#666',
    fontFamily: 'Geist-Medium',
    fontSize: fs(14),
  },
  closeButton: {
    width: wp(36),
    height: hp(36),
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalBody: {
    flex: 1,
  },
  modalNoteText: {
    color: '#434343',
    fontSize: fs(16),
    lineHeight: 24,
    fontFamily: 'Geist-Regular',
    marginBottom: 20,
  },
  modalFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalSummaryContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSummaryHeader: {
    marginBottom: 16,
  },
  modalSummaryTitle: {
    color: '#121116',
    fontFamily: 'Geist-SemiBold',
    marginBottom: 4,
  },
  modalSummaryDetails: {
    gap: 16,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSummaryLabel: {
    color: '#666',
    fontFamily: 'Geist-Medium',
    fontSize: fs(14),
  },
  modalSummaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  modalNoteTypeBadge: {
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  modalNoteTypeText: {
    color: '#3B4897',
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(12),
  },
  modalDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalDateIconContainer: {
    width: wp(32),
    height: hp(32),
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDateTextContainer: {
    flex: 1,
  },
  modalDateLabel: {
    color: '#666',
    fontFamily: 'Geist-Medium',
    fontSize: fs(12),
    marginBottom: 2,
  },
  modalDateValue: {
    color: '#121116',
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(14),
  },
});