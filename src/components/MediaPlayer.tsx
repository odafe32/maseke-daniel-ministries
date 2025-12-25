import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { hp, wp } from '@/src/utils';

interface MediaPlayerProps {
  uri: string;
  isAudio?: boolean;
  posterUri?: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const MediaPlayer = ({ uri, isAudio = false, posterUri }: MediaPlayerProps) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.unloadAsync().catch((error) => {
          // Ignore unload errors if video hasn't loaded yet
          console.log('Video unload skipped:', error.message);
        });
      }
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  const resetHideControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    setShowControls(true);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handlePlayerPress = () => {
    if (showControls) {
      setShowControls(false);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    } else {
      resetHideControlsTimer();
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setIsMuted(status.isMuted);
    setDuration(status.durationMillis || 0);
    setPosition(status.positionMillis || 0);
    setIsBuffering(status.isBuffering);

    // Check if media has ended
    if (status.didJustFinish) {
      setIsEnded(true);
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    } else {
      setIsEnded(false);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    if (isEnded) {
      // If media ended, replay from beginning
      await videoRef.current.setPositionAsync(0);
      await videoRef.current.playAsync();
      setIsEnded(false);
      resetHideControlsTimer();
      return;
    }

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setShowControls(true);
    } else {
      await videoRef.current.playAsync();
      resetHideControlsTimer();
    }
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (isAudio) return;

    if (!isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setIsFullscreen(false);
    }
  };

  const changeSpeed = async (speed: number) => {
    if (!videoRef.current) return;
    await videoRef.current.setRateAsync(speed, true);
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const skipForward = async () => {
    if (!videoRef.current) return;
    const newPosition = Math.min(position + 10000, duration);
    await videoRef.current.setPositionAsync(newPosition);
    resetHideControlsTimer();
  };

  const skipBackward = async () => {
    if (!videoRef.current) return;
    const newPosition = Math.max(position - 10000, 0);
    await videoRef.current.setPositionAsync(newPosition);
    resetHideControlsTimer();
  };

  const renderControls = () => {
    if (!showControls && isPlaying) return null;

    const progress = duration > 0 ? position / duration : 0;

    return (
      <View style={styles.controlsContainer}>
        <View style={styles.topControls}>
          <TouchableOpacity onPress={() => setShowSpeedMenu(true)} style={styles.speedButton}>
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
          {!isAudio && (
            <TouchableOpacity onPress={toggleFullscreen} style={styles.iconButton}>
              <Feather name={isFullscreen ? 'minimize' : 'maximize'} size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.centerPlayButton}
          onPress={togglePlayPause}
          activeOpacity={0.9}
        >
          {isEnded ? (
            <View style={styles.centerReplayIcon}>
              <Feather name="rotate-ccw" size={32} color="#fff" />
              <Text style={styles.replayText}>Replay</Text>
            </View>
          ) : !isPlaying ? (
            <View style={styles.centerPlayIcon}>
              <Feather name="play" size={48} color="#fff" />
            </View>
          ) : null}
        </TouchableOpacity>

        <View style={styles.bottomControlsWrapper}>
          <View style={styles.seekbarContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <View style={styles.seekbar}>
              <View style={styles.seekbarTrack}>
                <View style={[styles.seekbarProgress, { width: `${progress * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.bottomControls}>
            <TouchableOpacity onPress={skipBackward} style={styles.smallControlButton}>
              <Feather name="rotate-ccw" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlayPause} style={styles.smallControlButton}>
              {isBuffering ? (
                <Text style={styles.smallBufferingText}>...</Text>
              ) : (
                <Feather name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={skipForward} style={styles.smallControlButton}>
              <Feather name="rotate-cw" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMute} style={styles.smallControlButton}>
              <Feather name={isMuted ? 'volume-x' : 'volume-2'} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSpeedMenu = () => (
    <Modal visible={showSpeedMenu} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSpeedMenu(false)}
      >
        <View style={styles.speedMenu}>
          <Text style={styles.speedMenuTitle}>Playback Speed</Text>
          {PLAYBACK_SPEEDS.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedOption,
                playbackSpeed === speed && styles.speedOptionActive,
              ]}
              onPress={() => changeSpeed(speed)}
            >
              <Text
                style={[
                  styles.speedOptionText,
                  playbackSpeed === speed && styles.speedOptionTextActive,
                ]}
              >
                {speed}x
              </Text>
              {playbackSpeed === speed && (
                <Feather name="check" size={18} color="#4F6BFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (isFullscreen) {
    return (
      <Modal visible={isFullscreen} animationType="fade">
        <View style={styles.fullscreenContainer}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.fullscreenVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isPlaying}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            useNativeControls={false}
          />
          {renderControls()}
          {renderSpeedMenu()}
        </View>
      </Modal>
    );
  }

  return (
    <View style={[styles.container, isAudio && styles.audioContainer]}>
      {!showControls && (
        <TouchableOpacity
          style={styles.videoTouchable}
          onPress={handlePlayerPress}
          activeOpacity={1}
        />
      )}
      <Video
        ref={videoRef}
        source={{ uri }}
        style={isAudio ? styles.audioPlayer : styles.videoPlayer}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
        posterSource={posterUri ? { uri: posterUri } : undefined}
        usePoster={!!posterUri}
      />
      {renderControls()}
      {renderSpeedMenu()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: wp(12),
    overflow: 'hidden',
    position: 'relative',
  },
  videoTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  audioContainer: {
    height: hp(120),
    backgroundColor: '#1a1a2e',
  },
  videoPlayer: {
    width: '100%',
    height: hp(230),
  },
  audioPlayer: {
    width: '100%',
    height: hp(120),
    backgroundColor: '#1a1a2e',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullscreenVideo: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: wp(12),
    gap: wp(8),
  },
  centerPlayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerReplayIcon: {
    alignItems: 'center',
    gap: hp(8),
  },
  replayText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Geist-SemiBold',
  },
  centerPlayIcon: {
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControlsWrapper: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
  },
  seekbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(6),
    gap: wp(8),
  },
  seekbar: {
    flex: 1,
    height: hp(4),
    justifyContent: 'center',
  },
  seekbarTrack: {
    height: hp(3),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: wp(2),
    overflow: 'hidden',
  },
  seekbarProgress: {
    height: hp(3),
    backgroundColor: '#4F6BFF',
  },
  timeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Geist-Medium',
    minWidth: 40,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(24),
  },
  smallControlButton: {
    padding: wp(8),
  },
  smallBufferingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Geist-Bold',
  },
  iconButton: {
    padding: wp(8),
  },
  speedButton: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    borderRadius: wp(12),
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  speedText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Geist-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedMenu: {
    backgroundColor: '#fff',
    borderRadius: wp(16),
    padding: wp(16),
    minWidth: wp(200),
  },
  speedMenuTitle: {
    fontSize: 16,
    fontFamily: 'Geist-Bold',
    color: '#0C154C',
    marginBottom: hp(12),
  },
  speedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(12),
    paddingHorizontal: wp(12),
    borderRadius: wp(8),
  },
  speedOptionActive: {
    backgroundColor: 'rgba(79,107,255,0.1)',
  },
  speedOptionText: {
    fontSize: 15,
    fontFamily: 'Geist-Medium',
    color: '#38445D',
  },
  speedOptionTextActive: {
    color: '#4F6BFF',
    fontFamily: 'Geist-SemiBold',
  },
});
