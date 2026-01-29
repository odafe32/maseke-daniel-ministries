import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  Modal,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface CommentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  scripture: string;
  reference: string;
  comments: Comment[];
  likedComments: Set<string>;
  onAddComment: (text: string) => void;
  onLikeComment: (commentId: string) => void;
  theme?: 'sage' | 'deep' | 'warm' | 'classic' | 'royal' | 'dawn' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'gold' | 'rose' | 'black';
}

const THEME_CONFIGS = {
  sage: { primary: '#7C9885', secondary: '#5A7C65', text: '#FFFFFF' },
  deep: { primary: '#2C5282', secondary: '#1A365D', text: '#FFFFFF' },
  warm: { primary: '#C05621', secondary: '#9C4221', text: '#FFFFFF' },
  classic: { primary: '#0C154C', secondary: '#1E2B5B', text: '#FFFFFF' },
  royal: { primary: '#6B46C1', secondary: '#553C9A', text: '#FFFFFF' },
  dawn: { primary: '#F97316', secondary: '#EA580C', text: '#FFFFFF' },
  ocean: { primary: '#0891B2', secondary: '#0E7490', text: '#FFFFFF' },
  sunset: { primary: '#F59E0B', secondary: '#D97706', text: '#FFFFFF' },
  forest: { primary: '#059669', secondary: '#047857', text: '#FFFFFF' },
  lavender: { primary: '#A855F7', secondary: '#9333EA', text: '#FFFFFF' },
  gold: { primary: '#FBBF24', secondary: '#F59E0B', text: '#FFFFFF' },
  rose: { primary: '#F43F5E', secondary: '#E11D48', text: '#FFFFFF' },
  black: { primary: '#000000', secondary: '#1A1A1A', text: '#FFFFFF' },
};

export const CommentBottomSheet: React.FC<CommentBottomSheetProps> = ({
  visible,
  onClose,
  scripture,
  reference,
  comments,
  likedComments,
  onAddComment,
  onLikeComment,
  theme = 'sage',
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const themeConfig = THEME_CONFIGS[theme];

  const handleSubmitComment = async () => {
    if (newComment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isLiked = likedComments.has(item.id);
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{item.author}</Text>
          <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onLikeComment(item.id)}
            activeOpacity={0.7}
          >
            <Feather 
              name="heart" 
              size={14} 
              color={isLiked ? '#EF4444' : '#9CA3AF'} 
              fill={isLiked ? '#EF4444' : 'transparent'}
            />
            <Text style={styles.likeCount}>{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={themeConfig.primary} />
      
      {/* Full Screen Container */}
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <LinearGradient
          colors={[themeConfig.primary, themeConfig.secondary]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.scriptureInfo}>
              <Text style={styles.scriptureText} numberOfLines={2}>
                {scripture}
              </Text>
              <Text style={styles.referenceText}>{reference}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color={themeConfig.text} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Comments List */}
        <View style={styles.commentsContainer}>
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="message-circle" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to share your thoughts</Text>
              </View>
            }
          />
        </View>
        
        {/* Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Share your thoughts..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: newComment.trim() ? themeConfig.primary : '#E5E7EB' }
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            activeOpacity={0.8}
          >
            <Feather 
              name="send" 
              size={18} 
              color={newComment.trim() ? themeConfig.text : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 40, // Account for status bar
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scriptureInfo: {
    flex: 1,
    marginRight: 16,
  },
  scriptureText: {
    fontSize: 16,
    fontFamily: 'Geist-Medium',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 14,
    fontFamily: 'Geist-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Geist-SemiBold',
    color: '#1F2937',
    fontWeight: '600',
  },
  commentTimestamp: {
    fontSize: 12,
    fontFamily: 'Geist-Regular',
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Geist-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    fontFamily: 'Geist-Regular',
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Geist-Medium',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Geist-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Geist-Regular',
    color: '#1F2937',
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
