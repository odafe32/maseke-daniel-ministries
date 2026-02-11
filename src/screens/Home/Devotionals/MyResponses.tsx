import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDevotionalResponses } from '@/src/hooks/useDevotionalResponses';
import { DevotionalResponse } from '@/src/api/devotionalResponsesApi';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { showToast } from '@/src/utils/toast';
import { fs, hp, wp } from '@/src/utils';

const { height } = Dimensions.get('window');

export default function MyResponses() {
  const router = useRouter();
  const {
    responses,
    isLoadingResponses,
    error,
    fetchResponses,
    clearError,
    submittedCount,
    draftCount,
    updateResponse,
    deleteResponse,
    isUpdatingResponse,
    isDeletingResponse,
  } = useDevotionalResponses();

  const [filter, setFilter] = useState<'all' | 'submitted' | 'draft'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [selectedResponse, setSelectedResponse] = useState<DevotionalResponse | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingHeartResponse, setEditingHeartResponse] = useState('');
  const [editingTakeawayResponse, setEditingTakeawayResponse] = useState('');

  // Delete Modal State
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    loadResponses();
  }, [filter]);

  const loadResponses = async () => {
    if (filter === 'all') {
      await fetchResponses(undefined, 100);
    } else if (filter === 'submitted') {
      await fetchResponses(true, 100);
    } else {
      await fetchResponses(false, 100);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResponses();
    setRefreshing(false);
  };

  // UPDATED: Open Modal instead of Navigation
  const handleResponsePress = (response: DevotionalResponse) => {
    setSelectedResponse(response);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedResponse(null);
  };

  const handleEditResponse = () => {
    if (!selectedResponse) {
      console.log('No selected response for editing');
      return;
    }
    console.log('Editing response:', selectedResponse);
    console.log('Heart response:', selectedResponse.heart_response);
    console.log('Takeaway response:', selectedResponse.takeaway_response);

    setEditingHeartResponse(selectedResponse.heart_response || '');
    setEditingTakeawayResponse(selectedResponse.takeaway_response || '');
    setIsEditModalVisible(true);
  };

  const handleDeleteResponse = () => {
    if (!selectedResponse) return;
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedResponse) return;
    
    try {
      await deleteResponse(selectedResponse.id);
      
      // Close all modals after successful deletion
      setIsDeleteModalVisible(false);
      setIsModalVisible(false);
      setSelectedResponse(null);
      
      // Refresh the responses list
      await loadResponses();
      
      showToast({
        type: 'success',
        title: 'Reflection Deleted',
        message: 'Your reflection has been permanently deleted',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete reflection. Please try again.',
      });
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedResponse) return;
    
    try {
      await updateResponse(selectedResponse.id, {
        heart_response: editingHeartResponse.trim() || undefined,
        takeaway_response: editingTakeawayResponse.trim() || undefined,
      });
      
      // Force a refresh to ensure all UI shows updated data
      await loadResponses();
      
      // Close both modals after saving
      setIsEditModalVisible(false);
      setIsModalVisible(false);
      setSelectedResponse(null);
      
      showToast({
        type: 'success',
        title: 'Reflection Updated',
        message: 'Your changes have been saved successfully',
      });
      
      // The UI will show updated data since we refreshed the responses
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update reflection. Please try again.',
      });
    }
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingHeartResponse('');
    setEditingTakeawayResponse('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredResponses = responses;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reflections</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{submittedCount}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{draftCount}</Text>
          <Text style={styles.statLabel}>Drafts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{responses.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'submitted' && styles.filterTabActive]}
          onPress={() => setFilter('submitted')}
        >
          <Text style={[styles.filterText, filter === 'submitted' && styles.filterTextActive]}>
            Submitted
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'draft' && styles.filterTabActive]}
          onPress={() => setFilter('draft')}
        >
          <Text style={[styles.filterText, filter === 'draft' && styles.filterTextActive]}>
            Drafts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close-circle" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {isLoadingResponses && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading your reflections...</Text>
        </View>
      )}

      {/* Responses List */}
      {!isLoadingResponses && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {filteredResponses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Reflections Yet</Text>
              <Text style={styles.emptyText}>
                Your devotional reflections will appear here
              </Text>
            </View>
          ) : (
            filteredResponses.map((response, index) => (
              <Animated.View
                key={response.id}
                entering={FadeInDown.delay(index * 50)}
              >
                <TouchableOpacity
                  style={styles.responseCard}
                  onPress={() => handleResponsePress(response)}
                >
                  {/* Card Header */}
                  <View style={styles.responseHeader}>
                    <View style={styles.responseHeaderLeft}>
                      <Text style={styles.responseTitle} numberOfLines={1}>
                        {response.entry?.title || 'Untitled'}
                      </Text>
                      <Text style={styles.responseSubtitle}>
                        {response.entry?.devotional_title || 'Unknown Devotional'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        response.submitted
                          ? styles.statusBadgeSubmitted
                          : styles.statusBadgeDraft,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          response.submitted
                            ? styles.statusTextSubmitted
                            : styles.statusTextDraft,
                        ]}
                      >
                        {response.submitted ? 'Submitted' : 'Draft'}
                      </Text>
                    </View>
                  </View>

                  {/* Content Preview */}
                  {(response.heart_response || response.takeaway_response) && (
                    <View style={styles.responseContent}>
                      {response.heart_response && (
                        <View style={styles.responseSection}>
                          <Text style={styles.responseSectionLabel}>
                            Heart Response:
                          </Text>
                          <Text style={styles.responseSectionText} numberOfLines={2}>
                            {response.heart_response}
                          </Text>
                        </View>
                      )}
                      {response.takeaway_response && (
                        <View style={styles.responseSection}>
                          <Text style={styles.responseSectionLabel}>
                            Takeaway:
                          </Text>
                          <Text style={styles.responseSectionText} numberOfLines={2}>
                            {response.takeaway_response}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Card Footer */}
                  <View style={styles.responseFooter}>
                    <View style={styles.responseFooterLeft}>
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.responseDate}>
                        {formatDate(response.created_at)}
                      </Text>
                    </View>
                    {response.entry && (
                      <Text style={styles.dayNumber}>Day {response.entry.day_number}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={closeModal} 
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderBar}>
              <View style={styles.modalHandle} />
            </View>
            
            <View style={styles.modalContentHeader}>
              <Text style={styles.modalTitle}>Reflection Details</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={handleEditResponse} style={styles.modalActionButton}>
                  <Ionicons name="pencil" size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteResponse} style={styles.modalActionButton}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {selectedResponse && (
              <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
                
                {/* Entry Info */}
                <View style={styles.modalInfoCard}>
                  <Text style={styles.modalEntryTitle}>{selectedResponse.entry?.title}</Text>
                  <Text style={styles.modalDevotionalTitle}>
                    {selectedResponse.entry?.devotional_title} • Day {selectedResponse.entry?.day_number}
                  </Text>
                  <View style={styles.modalDateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.modalDateText}>
                      Recorded on {formatDate(selectedResponse.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={styles.modalStatusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      selectedResponse.submitted
                        ? styles.statusBadgeSubmitted
                        : styles.statusBadgeDraft,
                      { alignSelf: 'flex-start' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        selectedResponse.submitted
                          ? styles.statusTextSubmitted
                          : styles.statusTextDraft,
                      ]}
                    >
                      {selectedResponse.submitted ? 'Submitted Response' : 'Draft Response'}
                    </Text>
                  </View>
                </View>

                {/* Full Responses */}
                <View style={styles.fullResponseContainer}>
                  <Text style={styles.fullResponseLabel}>❤️ Heart Response</Text>
                  <View style={styles.fullResponseBox}>
                    <Text style={styles.fullResponseText}>
                      {selectedResponse.heart_response || "No response recorded."}
                    </Text>
                  </View>
                </View>

                <View style={styles.fullResponseContainer}>
                  <Text style={styles.fullResponseLabel}>💡 Takeaway</Text>
                  <View style={styles.fullResponseBox}>
                    <Text style={styles.fullResponseText}>
                      {selectedResponse.takeaway_response || "No response recorded."}
                    </Text>
                  </View>
                </View>

                {/* Spacer for bottom padding */}
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={closeEditModal} 
          />
          <View style={[styles.modalContainer, { height: height * 0.7 }]}>
            <View style={styles.modalHeaderBar}>
              <View style={styles.modalHandle} />
            </View>
            
            <View style={styles.modalContentHeader}>
              <Text style={styles.modalTitle}>Edit Reflection</Text>
              <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.editForm}>
                <View style={styles.editField}>
                  <Text style={styles.editFieldLabel}>❤️ Heart Response</Text>
                  <TextInput
                    style={[styles.editTextInput, !editingHeartResponse && styles.editTextInputEmpty]}
                    value={editingHeartResponse}
                    onChangeText={setEditingHeartResponse}
                    placeholder="Share what's on your heart..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={styles.editFieldLabel}>💡 Takeaway</Text>
                  <TextInput
                    style={[styles.editTextInput, !editingTakeawayResponse && styles.editTextInputEmpty]}
                    value={editingTakeawayResponse}
                    onChangeText={setEditingTakeawayResponse}
                    placeholder="What did you learn or take away from this..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={closeEditModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton]}
                  onPress={handleSaveEdit}
                  disabled={isUpdatingResponse}
                >
                  {isUpdatingResponse ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalContent}>
              <View style={styles.deleteIconContainer}>
                <Ionicons name="trash" size={48} color="#ef4444" />
              </View>
              
              <Text style={styles.deleteModalTitle}>Delete Reflection</Text>
              
              <Text style={styles.deleteModalMessage}>
                Are you sure you want to delete this reflection? This action cannot be undone.
              </Text>
              
              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={[styles.deleteModalButton, styles.deleteCancelButton]}
                  onPress={closeDeleteModal}
                  disabled={isDeletingResponse}
                >
                  <Text style={styles.deleteCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.deleteModalButton, styles.deleteConfirmButton]}
                  onPress={handleConfirmDelete}
                  disabled={isDeletingResponse}
                >
                  {isDeletingResponse ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: wp(12),
    backgroundColor: '#fff',
    borderBottomWidth: wp(1),
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: wp(8,)
  },
  headerTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: wp(40),
  },
  statsContainer: {
    flexDirection: 'row',
    padding: wp(16),
    gap: 12,
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: wp(12),
    padding: wp(16),
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fs(24),
    fontWeight: '700',
    color: '#0C154C',
    marginBottom: hp(4),
  },
  statLabel: {
    fontSize: fs(12),
    color: '#6b7280',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(16),
    paddingVertical: wp(12),
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: wp(1),
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: wp(8),
    paddingHorizontal: wp(16),
    borderRadius: wp(8),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0C154C',
  },
  filterText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: hp(16),
    padding: wp(12),
    backgroundColor: '#fee2e2',
    borderRadius: wp(8),
    borderLeftWidth: wp(4),
    borderLeftColor: '#ef4444',
  },
  errorText: {
    flex: 1,
    fontSize: fs(14),
    color: '#991b1b',
    marginRight: hp(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(32),
  },
  loadingText: {
    marginTop: hp(12),
    fontSize: fs(14),
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: wp(64),
  },
  emptyTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: '#374151',
    marginTop: hp(16),
    marginBottom: hp(8),
  },
  emptyText: {
    fontSize: fs(14),
    color: '#6b7280',
    textAlign: 'center',
  },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: wp(12),
    padding: wp(16),
    marginBottom: hp(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(12),
  },
  responseHeaderLeft: {
    flex: 1,
    marginRight: hp(12),
  },
  responseTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: hp(4),
  },
  responseSubtitle: {
    fontSize: fs(13),
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(4),
    borderRadius: wp(12),
  },
  statusBadgeSubmitted: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeDraft: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: fs(11),
    fontWeight: '600',
  },
  statusTextSubmitted: {
    color: '#065f46',
  },
  statusTextDraft: {
    color: '#92400e',
  },
  responseContent: {
    marginBottom: hp(12),
  },
  responseSection: {
    marginBottom: 8,
  },
  responseSectionLabel: {
    fontSize: fs(12),
    fontWeight: '600',
    color: '#0C154C',
    marginBottom: hp(4),
  },
  responseSectionText: {
    fontSize: fs(14),
    color: '#374151',
    lineHeight: hp(20),
  },
  responseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: wp(12),
    borderTopWidth: wp(1),
    borderTopColor: '#f3f4f6',
  },
  responseFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responseDate: {
    fontSize: fs(12),
    color: '#6b7280',
  },
  dayNumber: {
    fontSize: fs(12),
    fontWeight: '600',
    color: '#8B5CF6',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeaderBar: {
    alignItems: 'center',
    paddingTop: wp(12),
    paddingBottom: hp(8),
  },
  modalHandle: {
    width: wp(40),
    height: hp(5),
    borderRadius: wp(3),
    backgroundColor: '#e5e7eb',
  },
  modalContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingBottom: wp(16),
    borderBottomWidth: wp(1),
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: fs(18),
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: wp(4),
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalActionButton: {
    padding: wp(8),
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: wp(20),
  },
  modalInfoCard: {
    backgroundColor: '#f9fafb',
    padding: wp(16),
    borderRadius: wp(12),
    marginBottom: hp(16),
  },
  modalEntryTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: '#0C154C',
    marginBottom: hp(4),
  },
  modalDevotionalTitle: {
    fontSize: fs(14),
    color: '#4b5563',
    marginBottom: hp(8),
  },
  modalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalDateText: {
    fontSize: fs(12),
    color: '#6b7280',
  },
  modalStatusContainer: {
    marginBottom: hp(20),
  },
  fullResponseContainer: {
    marginBottom: hp(24),
  },
  fullResponseLabel: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#374151',
    marginBottom: hp(10),
  },
  fullResponseBox: {
    backgroundColor: '#fff',
    borderRadius: wp(12),
    padding: wp(16),
    borderWidth: hp(1),
    borderColor: '#e5e7eb',
  },
  fullResponseText: {
    fontSize: fs(15),
    lineHeight: hp(24),
    color: '#1f2937',
  },
  editForm: {
    gap: 20,
  },
  editField: {
    gap: 8,
  },
  editFieldLabel: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#374151',
  },
  editTextInput: {
    backgroundColor: '#fff',
    borderRadius: wp(12),
    padding: wp(16),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: fs(15),
    lineHeight: hp(24),
    color: '#1f2937',
    minHeight: hp(120),
  },
  editTextInputEmpty: {
    borderColor: '#ef4444',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: hp(24),
  },
  editButton: {
    flex: 1,
    paddingVertical: wp(14),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: wp(1),
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#0C154C',
  },
  saveButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#fff',
  },

  /* Delete Modal Styles */
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(20),
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: wp(16),
    width: '100%',
    maxWidth: wp(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalContent: {
    padding: wp(24),
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: wp(80),
    height: hp(80),
    borderRadius: wp(40),
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(16),
  },
  deleteModalTitle: {
    fontSize: fs(20),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp(8),
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: fs(16),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: hp(24),
    marginBottom: hp(24),
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: wp(14),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deleteCancelButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#6b7280',
  },
  deleteConfirmButton: {
    backgroundColor: '#ef4444',
  },
  deleteConfirmButtonText: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#fff',
  },
});