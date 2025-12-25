import React from 'react'
import { Feather } from '@expo/vector-icons'
import { View, Text, ScrollView, TextInput, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { hp, wp } from '@/src/utils'
import type { SermonItem } from './Sermons'
import { BackHeader, MediaPlayer } from '@/src/components'

interface Props {
  sermon: SermonItem
  onClose: () => void
  onRefresh?: () => Promise<void>
  refreshing: boolean
  onShare: () => void
}

export const SermonDetail = ({ sermon, onClose, onRefresh, refreshing, onShare }: Props) => {
  return (
    <View style={styles.container}>
      <BackHeader title="Watch sermon" onBackPress={onClose} />
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F6BFF"
            colors={['#4F6BFF']}
          />
        }
      >
        <MediaPlayer
          uri={sermon.videoUrl || sermon.audioUrl || ''}
          isAudio={!sermon.videoUrl && !!sermon.audioUrl}
          posterUri={sermon.thumbnailUrl}
        />
      
        <View style={styles.mediaActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="eye" size={20} color="#38445D" />
            <Text style={styles.actionText}>1.2K</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="heart" size={20} color="#38445D" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Feather name="share-2" size={20} color="#38445D" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Feather name="download" size={20} color="#38445D" />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        </View>
      
        <Text style={styles.detailTitle}>{sermon.title || 'Sermon'}</Text>
        <Text style={styles.detailCategory}>{sermon.category || 'General'}</Text>
        <Text style={styles.detailDescription}>{sermon.description || 'No description available.'}</Text>
      
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>COMMENTS</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>RECOMMENDATIONS</Text>
          </View>
          
        </View>
        <View style={styles.commentInput}>
          <TextInput placeholder="Send a comment" style={styles.commentField} placeholderTextColor="#667085" />
          <Feather name="send" size={16} color="#000" />
        </View>
        <View style={styles.emptyState}>
          <Feather name="message-circle" size={32} color="#C3C8D4" />
          <Text style={styles.emptyTitle}>No Comment</Text>
          <Text style={styles.emptySubtitle}>Be the first to leave a comment</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    paddingHorizontal: 7,
  },
  content: {
    paddingHorizontal: wp(16),
    paddingTop: hp(20),
    paddingBottom: hp(32),
    gap: hp(16),
  },
  mediaActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: hp(7),

  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    borderRadius: wp(8),
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Geist-Medium',
    color: '#38445D',
  },

  detailTitle: {
    fontSize: 22,
    fontFamily: 'Geist-Bold',
    color: '#0C154C',
  },
  detailCategory: {
    fontSize: 13,
    fontFamily: 'Geist-Medium',
    color: '#4F6BFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailDescription: {
    fontSize: 15,
    fontFamily: 'Geist-Regular',
    color: '#38445D',
    lineHeight: 22,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
  },
  tag: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: 'rgba(79,107,255,0.2)',
    backgroundColor: '#fff',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Geist-SemiBold',
    color: '#0C154C',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: 'rgba(20,32,59,0.1)',
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    backgroundColor: '#fff',
    gap: wp(8),
  },
  commentField: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Geist-Regular',
    color: '#182046',
  },
  emptyState: {
    alignItems: 'center',
    gap: hp(6),
    paddingTop: hp(24),
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Geist-SemiBold',
    color: '#3B4562',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Geist-Regular',
    color: 'rgba(59,69,98,0.7)',
  },
})

export default SermonDetail
