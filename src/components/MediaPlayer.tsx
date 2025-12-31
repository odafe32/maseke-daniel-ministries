import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { hp, wp } from '@/src/utils';
import { useFocusEffect } from '@react-navigation/native';

interface MediaPlayerProps {
  uri: string;
  isAudio?: boolean;
  posterUri?: string;
}

interface AVPlaybackStatusSuccess {
  isLoaded: true;
  isPlaying?: boolean;
  positionMillis?: number;
  durationMillis?: number;
}

export const MediaPlayer = ({ uri, isAudio = false, posterUri }: MediaPlayerProps) => {
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<Video | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (videoRef.current) {
          videoRef.current.pauseAsync();
        }
      };
    }, [])
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAudio && isPlaying && duration > 0) {
      interval = setInterval(async () => {
        if (videoRef.current) {
          try {
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded && !('error' in status)) {
              const currentStatus: AVPlaybackStatusSuccess = status;
              setPosition(currentStatus.positionMillis || 0);
              console.log('Manual position update:', currentStatus.positionMillis);
            }
          } catch (error) {
            console.error('Error getting status:', error);
          }
        }
      }, 500); // Update every 500ms for smoother display
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAudio, isPlaying, duration]);

  const baseUrl = Constants.manifest?.extra?.apiUrl || 'http://10.19.14.161:8000';
  const fullUri = uri && uri.startsWith('http') ? uri : uri && uri.startsWith('file:///') ? uri : uri ? `${baseUrl}${uri}` : '';
  const fullPosterUri = posterUri && posterUri.startsWith('http') ? posterUri : posterUri && posterUri.startsWith('file:///') ? posterUri : posterUri ? `${baseUrl}${posterUri}` : undefined;

  console.log('MediaPlayer Debug:', {
    originalUri: uri,
    isAudio,
    posterUri,
    fullUri,
    fullPosterUri,
  });

  if (!uri || uri.trim() === '') {
    console.log('MediaPlayer: No URI provided, showing placeholder');
    return (
      <View style={[styles.container, isAudio && styles.audioContainer]}>
        <View style={styles.noMediaContainer}>
          <Feather name="play-circle" size={48} color="#666" />
          <Text style={styles.noMediaText}>No media available</Text>
        </View>
      </View>
    );
  }

  const handleVideoError = (error: string) => {
    console.error('MediaPlayer Video Error:', error);
    setIsLoadingMedia(false);
    setError('Unable to load media. Please check your connection and try again.');
  };

  const handleLoadStart = () => {
    console.log('MediaPlayer: Load started');
    setIsLoadingMedia(true);
    setError(null);
  };

  const handleLoad = () => {
    console.log('MediaPlayer: Load completed');
    setIsLoadingMedia(false);
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    console.log('Playback status update:', status);
    
    // Type guard to check if status is successful
    if (status.isLoaded && !('error' in status)) {
      const successStatus: AVPlaybackStatusSuccess = status;
      const newPlaying = successStatus.isPlaying || false;
      const newDuration = successStatus.durationMillis || 0;
      const newPosition = successStatus.positionMillis || 0;
      
      console.log('Updating state - playing:', newPlaying, 'duration:', newDuration, 'position:', newPosition);
      
      setIsPlaying(newPlaying);
      setDuration(newDuration);
      setPosition(newPosition);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const seekBackward = async () => {
    if (videoRef.current) {
      const newPosition = Math.max(0, position - 10000); // 10 seconds back
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const seekForward = async () => {
    if (videoRef.current) {
      const newPosition = Math.min(duration, position + 10000); // 10 seconds forward
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const toggleVolume = async () => {
    if (videoRef.current) {
      const newVolume = volume > 0 ? 0 : 1.0;
      setVolume(newVolume);
      await videoRef.current.setVolumeAsync(newVolume);
    }
  };

  const cyclePlaybackRate = async () => {
    if (videoRef.current) {
      const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
      const currentIndex = rates.indexOf(playbackRate);
      const nextIndex = (currentIndex + 1) % rates.length;
      const newRate = rates[nextIndex];
      setPlaybackRate(newRate);
      await videoRef.current.setRateAsync(newRate, true);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, isAudio && styles.audioContainer]}>
      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {isAudio && fullPosterUri && <Image source={{ uri: fullPosterUri }} style={styles.audioPoster} />}
          <Video
            ref={videoRef}
            source={{ uri: fullUri }}
            style={isAudio ? styles.audioPlayer : styles.videoPlayer}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls={!isAudio}
            posterSource={fullPosterUri ? { uri: fullPosterUri } : undefined}
            usePoster={!!fullPosterUri}
            shouldPlay={true}
            progressUpdateIntervalMillis={1000}
            onError={handleVideoError}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onPlaybackStatusUpdate={isAudio ? handlePlaybackStatusUpdate : undefined}
          />
          {isAudio && (
            <View style={styles.customControls}>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
              <View style={styles.controlButtons}>
                <TouchableOpacity onPress={seekBackward} style={styles.controlButton}>
                  <Feather name="rewind" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                  <Feather name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={seekForward} style={styles.controlButton}>
                  <Feather name="fast-forward" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleVolume} style={styles.controlButton}>
                  <Feather name={volume > 0 ? "volume-2" : "volume-x"} size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={cyclePlaybackRate} style={styles.controlButton}>
                  <Text style={styles.speedText}>{playbackRate}x</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
      {isLoadingMedia && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading media...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: wp(12),
    overflow: 'hidden',
  },
  audioContainer: {
    height: hp(200),
    backgroundColor: '#1a1a2e',
  },
  videoPlayer: {
    width: '100%',
    height: hp(230),
  },
  audioPlayer: {
    width: '100%',
    height: hp(200),
    backgroundColor: '#1a1a2e',
  },
  audioPoster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
  },
  noMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(12),
  },
  noMediaText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Geist-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(12),
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontFamily: 'Geist-Medium',
    textAlign: 'center',
    paddingHorizontal: wp(20),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Geist-Medium',
  },
  customControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: hp(12),
    paddingHorizontal: wp(16),
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Geist-Medium',
    textAlign: 'center',
    marginBottom: hp(8),
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(20),
  },
  controlButton: {
    padding: wp(8),
    borderRadius: wp(24),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  speedText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Geist-Bold',
    textAlign: 'center',
  },
});