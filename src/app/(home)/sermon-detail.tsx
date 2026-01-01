import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SermonDetail } from '@/src/screens/Home/Sermons/SermonDetail'
import { View, ActivityIndicator, Text } from 'react-native'
import { hp } from '@/src/utils'
import { SermonItem } from '@/src/screens/Home/Sermons/Sermons'
import Constants from 'expo-constants'
import { useSermonTape } from '@/src/hooks/useSermons'
import { useSermonStore } from '@/src/stores/sermonStore';

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return '1 day ago';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInWeeks === 1) {
    return '1 week ago';
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  } else if (diffInMonths === 1) {
    return '1 month ago';
  } else if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  } else if (diffInYears === 1) {
    return '1 year ago';
  } else {
    return `${diffInYears} years ago`;
  }
}

// Helper function to get base URL
const getBaseUrl = () => {
  return Constants.expoConfig?.extra?.apiUrl || 
         Constants.manifest?.extra?.apiUrl || 
         __DEV__ 
           ? 'http://10.19.14.161:8000'
           : 'https://v1.masekedanielsministries.org';
};

export default function SermonDetailPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [refreshing, setRefreshing] = useState(false)
  const [streamUrl, setStreamUrl] = useState<string>('')
  const [isLoadingStream, setIsLoadingStream] = useState(false)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)

  const { tape, isLoading, loadTape } = useSermonTape()
  const sermon = tape
  const baseUrl = getBaseUrl()

  console.log('SermonDetailPage rendering', { id, sermon, isLoading, streamUrl, hasAttemptedLoad, baseUrl })

  useEffect(() => {
    if (id && typeof id === 'string' && !hasAttemptedLoad) {
      setHasAttemptedLoad(true)
      loadTape(id)
    }
  }, [id, loadTape, hasAttemptedLoad])

  useEffect(() => {
    if (hasAttemptedLoad && !isLoading && !sermon) {
      router.back();
    }
  }, [hasAttemptedLoad, isLoading, sermon, router, id]);

  useEffect(() => {
    if (sermon && id && typeof id === 'string') {
      const baseUrl = getBaseUrl()
      const hasVideo = sermon.media_type === 'video' || (sermon.media_type === 'both' && sermon.video_stream_url && sermon.video_status === 'finished')
      const hasAudio = sermon.media_type === 'mp3' || (sermon.media_type === 'both' && sermon.audio_stream_url)
      
      let streamUrl = ''
      if (hasVideo && sermon.video_stream_url) {
        console.log('Using direct Bunny Stream URL:', sermon.video_stream_url)
        streamUrl = sermon.video_stream_url
      } else if (hasAudio && sermon.audio_stream_url) {
        console.log('Using direct audio stream URL:', sermon.audio_stream_url)
        streamUrl = sermon.audio_stream_url
      } else {
        console.log('No media available')
      }
      
      setStreamUrl(streamUrl)
      setIsLoadingStream(false)
    }
  }, [sermon, id]);

  if (isLoading || isLoadingStream) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F6BFF" />
        <Text style={{ marginTop: hp(10), color: '#666' }}>
          {isLoading ? 'Loading sermon...' : 'Loading media...'}
        </Text>
      </View>
    )
  }

  if (!sermon) {
    return null;
  }

  // Store sermon in global store
  useSermonStore.getState().setCurrentSermon(sermon);
  useSermonStore.getState().addToHistory(sermon);

const sermonItem: SermonItem = {
  id: sermon.id,
  title: sermon.title,
  duration: sermon.duration ? `${Math.floor(sermon.duration / 60)}:${(sermon.duration % 60).toString().padStart(2, '0')}` : '0:00',
  timeAgo: sermon.sermon_date ? getTimeAgo(sermon.sermon_date) : 'Unknown',
  category: sermon.series?.category?.name || 'All',
  thumbnailUrl: sermon.series?.thumbnail 
    ? (sermon.series.thumbnail.startsWith('http') 
        ? sermon.series.thumbnail 
        : `${baseUrl}/${sermon.series.thumbnail}`)
    : 'https://via.placeholder.com/300x200',
  videoUrl: sermon.media_type === 'video' && sermon.video_status === 'finished' ? streamUrl : '',
  audioUrl: sermon.media_type === 'mp3' || sermon.media_type === 'both' ? streamUrl : '',
  description: sermon.description || '',
  preacher: sermon.preacher,
  categoryId: sermon.series?.category?.id || '',
  isLiked: sermon.is_liked,
  likesCount: sermon.likes_count,
  views: sermon.views,
}

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadTape(id as string);
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <SermonDetail 
        sermon={sermonItem} 
        onClose={() => router.back()} 
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onPressSermon={(id) => router.push({ pathname: '(home)/sermon-detail', params: { id } })}
      />
    </View>
  )
}