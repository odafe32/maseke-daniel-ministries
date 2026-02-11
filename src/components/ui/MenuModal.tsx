import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fs, wp } from '@/src/utils';

interface MenuModalProps {
  visible: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  isEditLoading?: boolean;
  isDeleteLoading?: boolean;
  position?: { x: number; y: number };
}

export const MenuModal = ({
  visible,
  onEdit,
  onDelete,
  onCancel,
  isEditLoading = false,
  isDeleteLoading = false,
  position,
}: MenuModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Full screen overlay for outside click dismissal */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        {/* Positioned modal content */}
        <View style={[styles.positionedContainer, position && { position: 'absolute', top: position.y, left: position.x }]}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={[styles.menuItem, isEditLoading && styles.disabledItem]}
              activeOpacity={isEditLoading ? 1 : 0.7}
              onPress={() => {
                if (!isEditLoading) {
                  onCancel();
                  onEdit();
                }
              }}
              disabled={isEditLoading}
            >
              {isEditLoading ? (
                <ActivityIndicator size="small" color="#4F6BFF" />
              ) : (
                <Ionicons name="pencil" size={20} color="#4F6BFF" />
              )}
              <Text style={[styles.menuText, styles.editText, isEditLoading && styles.disabledText]}>
                {isEditLoading ? 'Saving...' : 'Edit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, isDeleteLoading && styles.disabledItem]}
              activeOpacity={isDeleteLoading ? 1 : 0.7}
              onPress={() => {
                if (!isDeleteLoading) {
                  onCancel();
                  onDelete();
                }
              }}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              )}
              <Text style={[styles.menuText, styles.deleteText, isDeleteLoading && styles.disabledText]}>
                {isDeleteLoading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  positionedContainer: {
    position: 'absolute' as const,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: wp(12),
    padding: wp(4),
    minWidth: wp(140),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(12),
    borderRadius: wp(8),
  },
  menuText: {
    fontSize: fs(16),
    fontWeight: '500',
    marginLeft: wp(8),
    fontFamily: 'Geist-Medium',
  },
  editText: {
    color: '#4F6BFF',
  },
  deleteText: {
    color: '#EF4444',
  },
  disabledItem: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.7,
  },
});
