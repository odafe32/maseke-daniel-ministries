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
      // Error is handled by the store
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
      // Error is handled by the store
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0C154C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0C154C',
  },
  filterText: {
    fontSize: 14,
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
    margin: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  responseHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  responseSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSubmitted: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeDraft: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextSubmitted: {
    color: '#065f46',
  },
  statusTextDraft: {
    color: '#92400e',
  },
  responseContent: {
    marginBottom: 12,
  },
  responseSection: {
    marginBottom: 8,
  },
  responseSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C154C',
    marginBottom: 4,
  },
  responseSectionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  responseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  responseFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responseDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  dayNumber: {
    fontSize: 12,
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  modalContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalActionButton: {
    padding: 8,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  modalInfoCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalEntryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0C154C',
    marginBottom: 4,
  },
  modalDevotionalTitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  modalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalDateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalStatusContainer: {
    marginBottom: 20,
  },
  fullResponseContainer: {
    marginBottom: 24,
  },
  fullResponseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  fullResponseBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fullResponseText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1f2937',
  },
  editForm: {
    gap: 20,
  },
  editField: {
    gap: 8,
  },
  editFieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  editTextInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
    lineHeight: 24,
    color: '#1f2937',
    minHeight: 120,
  },
  editTextInputEmpty: {
    borderColor: '#ef4444',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#0C154C',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  /* Delete Modal Styles */
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deleteCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  deleteConfirmButton: {
    backgroundColor: '#ef4444',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});