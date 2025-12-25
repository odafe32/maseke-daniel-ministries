import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hp } from '@/src/utils';
import { LiveStream } from '@/src/api/liveApi';
import { BackHeader } from '@/src/components/ui/BackHeader';
import { useLiveComments } from '@/src/hooks/useLiveComments';
import { LiveComment } from '@/src/api/liveCommentApi';
import { EditCommentModal } from '@/src/components/ui/EditCommentModal';
import { MenuModal } from '@/src/components/ui/MenuModal';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';
import { useLiveStatus } from '@/src/hooks/useLiveStatus';

interface LiveProps {
  onBack?: () => void;
  liveStream?: LiveStream | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getUserColor = (name: string) => {
  const colors = [
    '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', 
    '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', 
    '#FF9800', '#FF5722', '#795548', '#607D8B'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash % colors.length)];
};

export const Live = ({ onBack, liveStream }: LiveProps) => {
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<LiveComment | null>(null);
  const [editingComment, setEditingComment] = useState<LiveComment | null>(null);
  const [playing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<LiveComment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<LiveComment | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  const flatListRef = useRef<FlatList>(null);
  const menuButtonRefs = useRef<Map<string, View | null>>(new Map()); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Get live stream data and refetch function
  const { data: currentLiveStream, refetch: refetchLiveStream } = useLiveStatus();
  const activeLiveStream = liveStream || currentLiveStream;

  const handleMenuPress = (item: LiveComment, buttonRef: View | null | undefined) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (buttonRef) {
      buttonRef.measureInWindow((x: number, y: number, width: number, height: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Position menu directly centered under the button
        setMenuPosition({ x: x + width / 2 - 120, y: y + height + 5 }); // Center horizontally with offset
        setSelectedComment(item);
        setShowMenuModal(true);
      });
    }
  };

  const {
    comments,
    isLoading: isLoadingComments,
    postComment,
    updateComment,
    deleteComment,
    isPostingComment,
    isUpdatingComment,
    isDeletingComment,
    refetch,
  } = useLiveComments(activeLiveStream?.id || null, !!activeLiveStream);

  useEffect(() => {
    if (comments.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [comments.length]);

  // Monitor live stream status and show local notification when it becomes active
  useEffect(() => {
    if (activeLiveStream && activeLiveStream.is_active) {
      showLocalNotification(activeLiveStream);
    }
  }, [activeLiveStream?.is_active, activeLiveStream]);

  const showLocalNotification = async (stream: LiveStream) => {
    try {
      // Check if we've already shown this notification to avoid duplicates
      const stored = await AsyncStorage.getItem('shown_notifications');
      const shownNotifications = stored ? JSON.parse(stored) : [];
      const notificationKey = `live_stream_${stream.id}`;

      if (shownNotifications.includes(notificationKey)) {
        return; // Already shown
      }

      // Add to shown notifications
      shownNotifications.push(notificationKey);
      await AsyncStorage.setItem('shown_notifications', JSON.stringify(shownNotifications));

      // Schedule local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Live Stream Started',
          body: `We are live!!! Join us now, Experience the power of God. Join in now for Our ${stream.title}`,
          data: {
            type: 'live_stream_started',
            stream_id: stream.id,
            title: stream.title,
          },
        },
        trigger: null, // Show immediately
      });

      // Also add to notifications list
      const notifications = stored ? JSON.parse(stored) : [];
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      notifications.push({
        id: `local_${Date.now()}-${Math.random()}`,
        title: 'Live Stream Started',
        message: `We are live!!! Join us now, Experience the power of God. Join in now for Our ${stream.title}`,
        date,
        time,
        read: false,
        type: 'live_stream_started',
      });

      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  };

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = activeLiveStream ? getVideoId(activeLiveStream.stream_url) : null;

  const handleSendMessage = () => {
    if (!message.trim() || !activeLiveStream) return;
    postComment(
      {
        liveStreamId: activeLiveStream.id,
        payload: { message: message.trim(), reply_to_id: replyingTo?.id },
      },
      {
        onSuccess: () => {
          setMessage('');
          setReplyingTo(null);
        },
        onError: (error: Error) => {
          const err = error as ApiError;
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: err.response?.data?.message || 'Failed to post comment',
          });
        }
      }
    );
  };

  const handleSaveEdit = (newMessage: string) => {
    if (!editingComment || !activeLiveStream) return;
    updateComment(
      {
        liveStreamId: activeLiveStream.id,
        commentId: editingComment.id,
        payload: { message: newMessage.trim() },
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setEditingComment(null);
          Toast.show({ type: 'success', text1: 'Comment updated' });
        },
        onError: (error: Error) => {
          const err = error as ApiError;
          Toast.show({
            type: 'error',
            text1: 'Failed to update',
            text2: (err as ApiError).response?.data?.message || 'Please try again',
          });
        }
      }
    );
  };

  const confirmDelete = () => {
    if (!commentToDelete || !activeLiveStream) return;
    deleteComment(
      { liveStreamId: activeLiveStream.id, commentId: commentToDelete.id },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
          Toast.show({ type: 'success', text1: 'Comment deleted' });
        },
        onError: (error: Error) => {
          const err = error as ApiError;
          Toast.show({
            type: 'error',
            text1: 'Failed to delete',
            text2: err.response?.data?.message || 'Please try again',
          });
        }
      }
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchLiveStream()]);
    setRefreshing(false);
  };

const renderChatMessage = ({ item }: { item: LiveComment }) => {
  const isOwnMessage = item.can_edit || item.can_delete;
  const userColor = getUserColor(item.user.name);
  
  const getAvatarSource = () => {
    if (item.user.avatar_base64) {
      return { uri: item.user.avatar_base64 };
    }
    if (item.user.avatar) {
      return { uri: `${process.env.API_URL}/storage/${item.user.avatar}` };
    }
    return { uri: 'https://i.ibb.co/sd4F4kcQ/images.png' };
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onLongPress={() => setReplyingTo(item)}
      delayLongPress={500}
      style={styles.messageContainer}
    >
      <View style={styles.messageRow}>
        {/* 1. Avatar */}
        <Image 
          source={getAvatarSource()} 
          style={styles.inlineAvatar} 
        />
        
        <View style={styles.textContent}>
          {item.replyTo && (
            <View style={styles.inlineReplyIndicator}>
              <Ionicons name="arrow-undo-sharp" size={10} color="#999" />
              <Text style={styles.inlineReplyText}> replying to {item.replyTo.user?.name}</Text>
            </View>
          )}

          <Text numberOfLines={0} style={styles.messageTextLine}>
            <Text style={[styles.inlineUserName, { color: userColor }]}>
              {item.user.name}{' '}
            </Text>
            <Text style={styles.inlineMessageBody}>
              {item.message}
            </Text>
            {item.is_edited && (
              <Text style={styles.inlineEditedLabel}> (edited)</Text>
            )}
          </Text>
        </View>

        {isOwnMessage && (
          <TouchableOpacity 
            ref={(ref) => { menuButtonRefs.current.set(item.id.toString(), ref); }} 
            onPress={() => handleMenuPress(item, menuButtonRefs.current.get(item.id.toString()))} 
            style={styles.inlineMenuButton}
          >
            <Ionicons name="ellipsis-vertical" size={12} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
  if (!liveStream || !videoId) {
    return (
      <View style={styles.container}>
        <BackHeader title="Live" onBackPress={onBack} />
        <View style={styles.noLiveContainer}>
          <Ionicons name="videocam-off-outline" size={64} color="#999" />
          <Text style={styles.noLiveText}>No live stream available</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader title="Live Stream" onBackPress={onBack} />

      <View style={styles.videoWrapper}>
        <YoutubePlayer height={hp(230)} play={playing} videoId={videoId} onReady={() => setLoading(false)} />
        {loading && <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#4F6BFF" /></View>}
      </View>

      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderText}>Live Chat</Text>
          <View style={styles.liveIndicator}><View style={styles.dot} /><Text style={styles.viewerCount}>LIVE</Text></View>
        </View>

        {isLoadingComments && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator color="#4F6BFF" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            renderItem={renderChatMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.chatListContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No comments yet</Text>}
          />
        )}

        {replyingTo && (
          <View style={styles.replyBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.replyBarUser}>Replying to {replyingTo.user.name}</Text>
              <Text numberOfLines={1} style={styles.replyBarText}>{replyingTo.message}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}><Ionicons name="close-circle" size={24} color="#999" /></TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Type a message..." value={message} onChangeText={setMessage} />
            <TouchableOpacity onPress={handleSendMessage} disabled={!message.trim() || isPostingComment} style={[styles.sendButton, !message.trim() && styles.sendDisabled]}>
              {isPostingComment ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <MenuModal
        visible={showMenuModal}
        onEdit={() => { setShowMenuModal(false); setEditingComment(selectedComment); setShowEditModal(true); }}
        onDelete={() => { setShowMenuModal(false); setCommentToDelete(selectedComment); setShowDeleteModal(true); }}
        onCancel={() => setShowMenuModal(false)}
        position={menuPosition}
      />
      
      <EditCommentModal
        visible={showEditModal}
        initialMessage={editingComment?.message || ''}
        onSave={handleSaveEdit}
        onCancel={() => setShowEditModal(false)}
        isLoading={isUpdatingComment}
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeletingComment}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 12 },
  videoWrapper: { width: '100%', backgroundColor: '#000', minHeight: hp(230) },
  loaderContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  chatHeaderText: { fontSize: 15, fontWeight: '700' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#edfff0ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0eab00ff', marginRight: 5 },
  viewerCount: { color: '#0eab00ff', fontSize: 11, fontWeight: '800' },


  messageContainer: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: '100%',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
  },
  inlineAvatar: {
    width: 30,
    height: 30,
    borderRadius: 14,
    marginRight: 10,
    marginTop: 2,
  },
  textContent: {
    flex: 1,
    flexDirection: 'column',
  },
  messageTextLine: {
    fontSize: 14,
    lineHeight: 20,
  },
  inlineUserName: {
    fontWeight: '800',
    fontSize: 14,
  },
  inlineMessageBody: {
    color: '#000000',
    fontSize: 14,
  },
  inlineReplyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  inlineReplyText: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  inlineEditedLabel: {
    fontSize: 10,
    color: '#AAA',
    fontStyle: 'italic',
  },
  inlineMenuButton: {
    paddingLeft: 8,
    paddingRight: 4,
    justifyContent: 'center',
    height: 20,
  },
  
  chatListContent: {
    padding: 10,
    paddingBottom: 30,
  },
  chatContainer: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  inputRow: { 
    padding: 12, 
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderTopColor: '#EEE' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F3F5', 
    borderRadius: 25, 
    paddingLeft: 15, 
    paddingRight: 5 
  },
  input: { 
    flex: 1, 
    height: 45, 
    fontSize: 14,
    color: '#000'
  },
  sendButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#4F6BFF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sendDisabled: { 
    backgroundColor: '#CCC' 
  },
  
  replyBar: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#E9ECEF', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6'
  },
  replyBarUser: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#4F6BFF' 
  },
  replyBarText: { 
    fontSize: 13, 
    color: '#495057' 
  },
  noLiveContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  noLiveText: { 
    fontSize: 16, 
    color: '#999', 
    marginTop: 10 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#ADB5BD', 
    marginTop: 20 
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});