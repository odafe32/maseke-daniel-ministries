import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SCREEN_WIDTH } from '../../../utils/config';

const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

interface VideoIntroProps {
  onBeginDevotional: () => void;
  videoUri?: string;
  offlinePath?: string | null;
  onBack: () => void;
}

export function VideoIntro({ 
  onBeginDevotional, 
  videoUri = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  offlinePath = null,
  onBack,
}: VideoIntroProps) {
  const videoRef = useRef<Video>(null);
  const playbackAttempted = useRef(false);
  
  const mediaSource = offlinePath || videoUri;
  
  console.log('🎥 VideoIntro initialized with:', {
    videoUri: videoUri?.substring(0, 50) + '...',
    offlinePath: offlinePath,
    mediaSource: mediaSource?.substring(0, 50) + '...',
  });
  
  const [showButton, setShowButton] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  
  useEffect(() => {
    console.log('🔧 VideoIntro mounted with source:', mediaSource?.substring(0, 50));
    
    // Request audio focus and prepare video
    const prepareAudio = async () => {
      try {
        // Set audio mode to allow video playback
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        console.log('✅ Audio mode configured');
        setAudioReady(true);
        
        // Wait a bit for audio system to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsVideoReady(true);
      } catch (error) {
        console.log('⚠️ Audio setup error (non-critical):', error);
        // Still show video even if audio setup fails
        setAudioReady(true);
        setTimeout(() => {
          setIsVideoReady(true);
        }, 500);
      }
    };
    
    prepareAudio();
    
    return () => {
      console.log('🧹 VideoIntro unmounting, cleaning up video');
      playbackAttempted.current = false;
      if (videoRef.current) {
        videoRef.current.pauseAsync()
          .then(() => videoRef.current?.unloadAsync())
          .catch(() => {
            console.log('⚠️ Error during video cleanup (expected on unmount)');
          });
      }
    };
  }, [mediaSource]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      const position = status.positionMillis / 1000;
      
      // Show button after 7 seconds
      if (position >= 7 && !showButton) {
        console.log('✅ Showing Begin button after 7 seconds');
        setShowButton(true);
      }
    } else if (status.error) {
      console.log('❌ Video error:', status.error);
    }
  };

  const handleVideoLoad = async () => {
    console.log('✅ Video loaded successfully');
    setIsVideoLoading(false);
    
    // Only attempt playback once, and only if audio is ready
    if (!playbackAttempted.current && audioReady && videoRef.current) {
      playbackAttempted.current = true;
      
      // Wait a bit more to ensure audio focus is stable
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        console.log('🎬 Attempting to start playback...');
        await videoRef.current.playAsync();
        console.log('✅ Playback started successfully');
      } catch (error) {
        console.log('⚠️ Could not start playback:', error);
        // If playback fails, try again with native controls
        // The user can manually press play
      }
    }
  };

  const handleBegin = async () => {
    console.log('🎬 Begin button pressed');
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();
      } catch (e) {
        console.log('⚠️ Failed to pause video:', e);
      }
    }
    onBeginDevotional();
  };

  const handleBack = async () => {
    console.log('⬅️ Back button pressed');
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();
      } catch (e) {
        console.log('⚠️ Failed to pause video:', e);
      }
    }
    onBack();
  };

  return (
    <View style={styles.fullScreenOverlay}>
      <StatusBar hidden />
      
      {/* Video Section */}
      <View style={styles.videoSection}>
        {isVideoReady && (
          <Video
            ref={videoRef}
            source={{ uri: mediaSource }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls={true}
            shouldPlay={false}
            isLooping={false}
            volume={1.0}
            isMuted={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoad={handleVideoLoad}
            onLoadStart={() => {
              console.log('⏳ Video loading started...');
              setIsVideoLoading(true);
            }}
            onError={(error) => {
              console.log('❌ Video error:', error);
              setIsVideoLoading(false);
            }}
            onReadyForDisplay={() => {
              console.log('✅ Video ready for display');
            }}
          />
        )}
        
        {/* Loading spinner for video */}
        {isVideoLoading && (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.videoLoadingText}>Loading video...</Text>
          </View>
        )}
      </View>

      {/* Logo (Top Right) */}
      <View style={styles.logoContainer} pointerEvents="none">
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>

      {/* Back Button (Top Left) */}
      <View style={styles.backContainer}>
        <TouchableOpacity 
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Feather name="x" size={30} color="white" />
        </TouchableOpacity>
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
    backgroundColor: '#000',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  videoLoadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    fontFamily: 'DMSans-Medium',
  },
  logoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 25,
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  backContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 25,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 5,
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
    zIndex: 10,
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
    letterSpacing: 1.5,
  },
});