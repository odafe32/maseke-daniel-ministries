import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SCREEN_WIDTH } from '../../../utils/config';

const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

interface VideoIntroProps {
  onBeginDevotional: () => void;
  videoUri?: string;
}

export function VideoIntro({ 
  onBeginDevotional, 
  videoUri = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
}: VideoIntroProps) {
  const videoRef = useRef<Video>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [showButton, setShowButton] = useState(false); 
  
  useEffect(() => {
    const currentVideoRef = videoRef.current;
    return () => {
      // SAFETY FIX: Catch error if unloading before video finished loading
      if (currentVideoRef) {
        currentVideoRef.unloadAsync().catch(() => {
          /* Ignore error on unmount */
        });
      }
    };
  }, []);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoaded(false);
      if (status.error) console.error(`Playback Error: ${status.error}`);
    } else {
      const loadedStatus = status as AVPlaybackStatusSuccess;
      setIsLoaded(true);
      setIsPlaying(loadedStatus.isPlaying);
      setIsMuted(loadedStatus.isMuted);
      setIsLoading(loadedStatus.isBuffering);
      if (loadedStatus.positionMillis >= 10000 && !showButton) setShowButton(true);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current || !isLoaded) return;
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (e) {
      console.log("Operation failed because video is not ready");
    }
  };

  const handleBackward = async () => {
    if (!videoRef.current || !isLoaded) return;
    try {
      const status = await videoRef.current.getStatusAsync() as AVPlaybackStatusSuccess;
      const currentPosition = status.positionMillis;
      const newPosition = Math.max(0, currentPosition - 10000); 
      await videoRef.current.setPositionAsync(newPosition);
    } catch (e) {
      console.log("Seek backward failed");
    }
  };

  const handleForward = async () => {
    if (!videoRef.current || !isLoaded) return;
    try {
      const status = await videoRef.current.getStatusAsync() as AVPlaybackStatusSuccess;
      const currentPosition = status.positionMillis;
      const duration = status.durationMillis || 0;
      const newPosition = Math.min(duration, currentPosition + 10000); // 10 seconds forward
      await videoRef.current.setPositionAsync(newPosition);
    } catch (e) {
      console.log("Seek forward failed");
    }
  };

  const handleBegin = async () => {
    // SAFETY FIX: Only attempt to pause if the video is actually loaded
    if (videoRef.current && isLoaded) {
      try {
        await videoRef.current.pauseAsync();
      } catch (e) {
        // Silently fail and proceed
      }
    }
    onBeginDevotional();
  };

  return (
    <View style={styles.fullScreenOverlay}>
      <StatusBar hidden />
      
      {/* Video Section */}
      <View style={styles.videoSection}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN} 
          useNativeControls={false}
          shouldPlay={true}
          isLooping
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {/* Logo (Top Right) */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

        {/* Close Button (Top Left) */}
        {showButton && (
          <View style={styles.closeContainer}>
            <TouchableOpacity onPress={handleBegin}>
              <Feather name="x" size={30} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleBackward}>
            <Feather name="skip-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playPauseBtn} onPress={handlePlayPause}>
            <Feather name={isPlaying ? "pause" : "play"} size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={handleForward}>
            <Feather name="skip-forward" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.muteBtn} onPress={() => setIsMuted(!isMuted)}>
            <Feather name={isMuted ? "volume-x" : "volume-2"} size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* BEGIN BUTTON */}
      {showButton && (
        <View style={styles.footerSection}>
          <TouchableOpacity 
            style={styles.finalButton} 
            onPress={handleBegin}
            activeOpacity={0.7}
          >
            <Text style={styles.finalButtonText}>Begin Devotional</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 99999,
  },
  videoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
  },
  logoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 25,
  },
  logo: {
    width: 60,
    height: 60,
  },
  closeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 25,
  },
  loadingCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  footerSection: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 22,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  finalButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  controlsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  controlBtn: {
    padding: 15,
    marginHorizontal: 10,
  },
  muteBtn: {
    padding: 15,
    marginHorizontal: 10,
  },
});