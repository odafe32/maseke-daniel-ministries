import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/src/utils';

interface EditCommentModalProps {
  visible: boolean;
  initialMessage: string;
  onSave: (message: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditCommentModal = ({
  visible,
  initialMessage,
  onSave,
  onCancel,
  isLoading = false,
}: EditCommentModalProps) => {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (visible) {
      setMessage(initialMessage);
    }
  }, [visible, initialMessage]);

  const handleSave = () => {
    if (message.trim()) {
      onSave(message.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Comment</Text>
            <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your comment..."
            placeholderTextColor="#9CA3AF"
            multiline
            autoFocus
            maxLength={500}
          />
          
          <Text style={styles.charCount}>{message.length}/500</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!message.trim() || isLoading) && styles.disabledButton,
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={!message.trim() || isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    padding: wp(20),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(16),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Geist-Bold',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: wp(12),
    padding: wp(16),
    fontSize: 16,
    color: '#1F2937',
    minHeight: hp(120),
    maxHeight: hp(200),
    textAlignVertical: 'top',
    fontFamily: 'Geist-Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: hp(8),
    marginBottom: hp(16),
    fontFamily: 'Geist-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: wp(12),
  },
  button: {
    flex: 1,
    paddingVertical: hp(14),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#4F6BFF',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Geist-SemiBold',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Geist-SemiBold',
  },
});
