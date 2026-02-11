import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, Alert, Clipboard, ToastAndroid, Platform, FlatList, Image } from 'react-native'
import { fs, hp, wp } from '@/src/utils'
import type { SermonItem } from './Sermons'
import { BackHeader, MediaPlayer } from '@/src/components'
import * as Linking from 'expo-linking'
import { sermonApi } from '@/src/api/sermonApi'
import type { SermonTape } from '@/src/api/sermonApi'
import { documentDirectory, cacheDirectory, createDownloadResumable } from 'expo-file-system/legacy'
import * as MediaLibrary from 'expo-media-library'
import { useSermonStore } from '@/src/stores/sermonStore'
import Toast from 'react-native-toast-message'

interface Props {
  sermon: SermonItem
  onClose: () => void
  onRefresh?: () => Promise<void>
  refreshing: boolean
  onPressSermon?: (id: string) => void
}

export const SermonDetail = ({ sermon, onClose, onRefresh, refreshing, onPressSermon }: Props) => {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [recommendations, setRecommendations] = useState<SermonItem[]>([])
  const [liked, setLiked] = useState(sermon.isLiked || false)
  const [likesCount, setLikesCount] = useState(sermon.likesCount || 0)
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false)
  const [offlinePath, setOfflinePath] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const downloadProgress = useSermonStore(state => state.downloadProgress)
  const downloadSermonForOffline = useSermonStore(state => state.downloadSermonForOffline)
  const isSermonAvailableOffline = useSermonStore(state => state.isSermonAvailableOffline)
  const getOfflineSermonPath = useSermonStore(state => state.getOfflineSermonPath)
  
  // Check if sermon is available offline and get local path
  useEffect(() => {
    const checkOfflineStatus = async () => {
      const available = await isSermonAvailableOffline(sermon.id)
      setIsOfflineAvailable(available)
      
      if (available) {
        const path = await getOfflineSermonPath(sermon.id)
        setOfflinePath(path)
      } else {
        setOfflinePath(null)
      }
    }
    checkOfflineStatus()
  }, [sermon.id, isSermonAvailableOffline, getOfflineSermonPath])

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleWhatsAppShare = async () => {
    const message = `Check out this sermon: ${sermon.title || 'Amazing Sermon'}\n\n${sermon.description || 'Listen to this inspiring message'}\n\nWatch here: ${Linking.createURL('/sermon', { queryParams: { id: sermon.id } })}`
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
    
    try {
      await Linking.openURL(whatsappUrl)
    } catch (error) {
      Alert.alert('Error', 'WhatsApp is not installed on your device')
    }
    setShowShareModal(false)
  }

  const handleCopyLink = async () => {
    const link = Linking.createURL('/sermon', { queryParams: { id: sermon.id } })
    Clipboard.setString(link)

    if (Platform.OS === 'android') {
      ToastAndroid.show('Link copied to clipboard!', ToastAndroid.SHORT)
    } else {
      Alert.alert('', 'Link copied to clipboard!', [{ text: 'OK', style: 'default' }], { cancelable: false })
    }
    setShowShareModal(false)
  }

  const handleLike = async () => {
    try {
      const result = await sermonApi.toggleLike(sermon.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch (error) {
      console.error('Failed to toggle like', error);
    }
  }

  const handleDownloadPress = () => {
    setShowDownloadModal(true);
  }

  const handleDownload = async (type: 'offline' | 'phone') => {
    const url = sermon.audioUrl || sermon.videoUrl;
    if (!url) {
      Alert.alert('No media available to download');
      return;
    }
    if (type === 'phone') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to media library to save sermons.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]);
        return;
      }
    }
    const extension = sermon.audioUrl ? 'mp3' : 'mp4';
    const filename = `sermon_${sermon.id}.${extension}`;
    const dir = type === 'offline' ? cacheDirectory : documentDirectory;
    const fileUri = dir + filename;
    try {
      Alert.alert('Download Started', `Downloading sermon ${type === 'offline' ? 'for offline' : 'to phone'}...`);
      const downloadResumable = createDownloadResumable(url, fileUri);
      const result = await downloadResumable.downloadAsync();
      if (result && result.status === 200) {
        Alert.alert('Download Complete', `Sermon saved ${type === 'offline' ? 'for offline access' : 'to your device'} as ${filename}`);
        if (type === 'phone') {
          try {
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.saveToLibraryAsync(asset.uri);
            Alert.alert('Saved to Phone', 'Sermon added to your music library.');
          } catch (error) {
            console.error('Save to library failed', error);
            Alert.alert('Save Failed', 'Downloaded but could not save to library.');
          }
        }
      } else {
        Alert.alert('Download Failed', 'Please check your connection and try again');
      }
    } catch (error) {
      console.error('Download failed', error);
      Alert.alert('Download Failed', 'An error occurred. Please try again');
    }
  }

  const handleDownloadOffline = async () => {
    setShowDownloadModal(false);
    
    if (isOfflineAvailable) {
      Alert.alert('Already Downloaded', 'This sermon is already available offline.');
      return;
    }
    
    // Only allow audio downloads - videos use HLS streaming which cannot be downloaded
    if (!sermon.audioUrl) {
      Alert.alert('Video Download Not Supported', 'Offline downloads are only available for audio sermons. Videos require streaming.');
      return;
    }
    
    const mediaUrl = sermon.audioUrl;
    console.log('Starting audio download for:', sermon.title, 'URL:', mediaUrl);
    setIsDownloading(true);
    
    try {
      const success = await downloadSermonForOffline(sermon.id, sermon.title, mediaUrl, true);
      console.log('Download finished, success:', success);
      setIsDownloading(false);
      
      if (success) {
        setIsOfflineAvailable(true);
        Toast.show({
          type: 'success',
          text1: 'Download Complete',
          text2: `${sermon.title} is now available offline.`
        });
      } else {
        Alert.alert('Download Failed', 'Failed to download sermon. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      Alert.alert('Download Failed', 'An error occurred. Please try again.');
    }
  }

  const handleDownloadToPhone = () => {
    handleDownload('phone');
    setShowDownloadModal(false);
  }

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!sermon.categoryId) return;
      try {
        const response = await sermonApi.getTapes({ category_id: sermon.categoryId, per_page: 6 });
        const tapes = response.data;
        const recs = tapes.map((tape: SermonTape) => ({
          id: tape.id,
          title: tape.title,
          duration: tape.duration ? `${Math.floor(tape.duration / 60)}:${(tape.duration % 60).toString().padStart(2, '0')}` : '0:00',
          timeAgo: tape.sermon_date ? new Date(tape.sermon_date).toLocaleDateString() : 'Unknown',
          category: tape.series?.category?.name || 'All',
          thumbnailUrl: tape.series?.thumbnailUrl || tape.thumbnailUrl || 'https://via.placeholder.com/300x200',
          videoUrl: tape.video_stream_url || tape.video_embed_url || '',
          audioUrl: tape.audio_stream_url,
          description: tape.description || '',
          preacher: tape.preacher,
          categoryId: tape.series?.category?.id || '',
        })).filter((r: SermonItem) => r.id !== sermon.id);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      }
    };
    fetchRecommendations();
  }, [sermon.categoryId, sermon.id]);

  const renderRecommendationItem = ({ item }: { item: SermonItem }) => (
    <TouchableOpacity style={styles.recommendationCard} onPress={() => onPressSermon?.(item.id)}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.recommendationImage} />
      <Text style={styles.recommendationTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.recommendationPreacher}>{item.preacher}</Text>
    </TouchableOpacity>
  );

  return (
    <>
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
            uri={(!sermon.videoUrl && offlinePath) || sermon.videoUrl || sermon.audioUrl || ''}
            isAudio={!sermon.videoUrl && !!sermon.audioUrl}
            posterUri={sermon.thumbnailUrl}
          />
          
          {isOfflineAvailable && (
            <View style={styles.offlineBadge}>
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={styles.offlineBadgeText}>Available Offline</Text>
            </View>
          )}
      
          <View style={styles.mediaActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="eye" size={20} color="#38445D" />
              <Text style={styles.actionText}>{sermon.views || 0}</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Feather name="heart" size={20} color={liked ? '#FF6B6B' : '#38445D'} />
              <Text style={styles.actionText}>{likesCount}</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPress}>
              <Feather name="download" size={20} color={isOfflineAvailable ? '#4F6BFF' : '#38445D'} />
              <Text style={styles.actionText}>{isOfflineAvailable ? 'Downloaded' : 'Download'}</Text>
            </TouchableOpacity>
          </View>
      
          <Text style={styles.detailTitle}>{sermon.title || 'Sermon'}</Text>
          <Text style={styles.detailCategory}>{sermon.category || 'General'}</Text>
          <Text style={styles.detailPreacher}>{sermon.preacher}</Text>
          <Text style={styles.detailDescription}>{sermon.description || 'No description available.'}</Text>
      
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Feather name="share-2" size={16} color="#4F6BFF" />
            <Text style={styles.shareButtonText}>Share Sermon</Text>
          </TouchableOpacity>
      
          {recommendations.length > 0 && (
            <>
              <Text style={styles.recommendationsTitle}>Recommended Sermons</Text>
              <FlatList
                data={recommendations}
                renderItem={renderRecommendationItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.recommendationsList}
              />
            </>
          )}
        </ScrollView>
      </View>
      <Modal visible={showShareModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowShareModal(false)}
        >
          <View style={styles.shareModal}>
            <Text style={styles.shareModalTitle}>Share Sermon</Text>
            <TouchableOpacity style={styles.shareOption} onPress={handleWhatsAppShare}>
              <Feather name="message-circle" size={20} color="#25D366" />
              <Text style={styles.shareOptionText}>Share on WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
              <Feather name="link" size={20} color="#4F6BFF" />
              <Text style={styles.shareOptionText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={showDownloadModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDownloadModal(false)}
        >
          <View style={styles.shareModal}>
            <Text style={styles.shareModalTitle}>Download Sermon</Text>
            <TouchableOpacity style={styles.shareOption} onPress={handleDownloadOffline}>
              <Feather name="download-cloud" size={20} color="#4F6BFF" />
              <Text style={styles.shareOptionText}>Download for Offline</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.shareOption} onPress={handleDownloadToPhone}>
              <Feather name="download" size={20} color="#4F6BFF" />
              <Text style={styles.shareOptionText}>Download to Phone</Text>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Download Progress Modal */}
      <Modal visible={isDownloading || !!downloadProgress} transparent animationType="fade">
        <View style={styles.progressOverlay}>
          <View style={styles.progressModal}>
            <Text style={styles.progressTitle}>
              {isDownloading ? `Downloading ${downloadProgress?.sermonTitle || sermon.title}` : 'Preparing download...'}
            </Text>
            {downloadProgress && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${downloadProgress.progress || 0}%` }]} />
              </View>
            )}
            <Text style={styles.progressText}>
              {downloadProgress ? `${downloadProgress.progress || 0}%` : 'Starting...'}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    paddingHorizontal: wp(7),
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
    paddingVertical: hp(12),
    backgroundColor: '#fff',
    borderRadius: wp(12),
    marginTop: hp(8),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
  },
  actionText: {
    fontSize: fs(14),
    fontFamily: 'Geist-Medium',
    color: '#38445D',
  },

  detailTitle: {
    fontSize: fs(22),
    fontFamily: 'Geist-Bold',
    color: '#0C154C',
  },
  detailCategory: {
    fontSize: fs(13),
    fontFamily: 'Geist-Medium',
    color: '#4F6BFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailPreacher: {
    fontSize: fs(14),
    fontFamily: 'Geist-Regular',
    color: '#38445D',
    marginTop: hp(4),
  },
  detailDescription: {
    fontSize: fs(15),
    fontFamily: 'Geist-Regular',
    color: '#38445D',
    lineHeight: fs(22),
  },

  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    alignSelf: 'flex-start',
    paddingVertical: hp(8),
    paddingHorizontal: wp(12),
    borderRadius: wp(16),
    backgroundColor: 'rgba(79,107,255,0.1)',
  },
  shareButtonText: {
    fontSize: fs(14),
    fontFamily: 'Geist-Medium',
    color: '#4F6BFF',
  },

  recommendationsTitle: {
    fontSize: fs(16),
    fontFamily: 'Geist-Bold',
    color: '#0C154C',
    marginBottom: hp(12),
  },
  recommendationsList: {
    paddingVertical: hp(8),
  },
  recommendationCard: {
    width: wp(140),
    marginRight: wp(12),
  },
  recommendationImage: {
    width: '100%',
    height: hp(80),
    borderRadius: wp(8),
  },
  recommendationTitle: {
    fontSize: fs(12),
    fontFamily: 'Geist-SemiBold',
    color: '#1C2437',
    marginTop: hp(6),
  },
  recommendationPreacher: {
    fontSize: fs(11),
    fontFamily: 'Geist-Regular',
    color: '#4F6BFF',
    marginTop: hp(2),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModal: {
    backgroundColor: '#fff',
    borderRadius: wp(16),
    padding: wp(20),
    marginHorizontal: wp(20),
    alignItems: 'center',
  },
  shareModalTitle: {
    fontSize: fs(18),
    fontFamily: 'Geist-Bold',
    color: '#0C154C',
    marginBottom: hp(16),
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    paddingVertical: hp(12),
    paddingHorizontal: wp(16),
    borderRadius: wp(12),
    backgroundColor: '#F7F8FC',
    marginVertical: hp(4),
    width: '100%',
  },
  shareOptionText: {
    fontSize: fs(16),
    fontFamily: 'Geist-Medium',
    color: '#38445D',
  },
  progressOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressModal: {
    backgroundColor: '#fff',
    borderRadius: wp(10),
    padding: wp(20),
    alignItems: 'center',
    width: '80%',
  },
  progressTitle: {
    fontSize: fs(16),
    fontFamily: 'Geist-Bold',
    marginBottom: hp(10),
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: hp(20),
    backgroundColor: '#e0e0e0',
    borderRadius: wp(10),
    marginTop: hp(10),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F6BFF',
    borderRadius: wp(10),
  },
  progressText: {
    fontSize: fs(14),
    fontFamily: 'Geist-Medium',
    marginTop: hp(10),
  },
  offlineBadge: {
    position: 'absolute',
    top: hp(16),
    right: wp(16),
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: wp(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  offlineBadgeText: {
    color: '#fff',
    fontSize: fs(12),
    fontFamily: 'Geist-Medium',
    marginLeft: wp(4),
  },
})

export default SermonDetail
