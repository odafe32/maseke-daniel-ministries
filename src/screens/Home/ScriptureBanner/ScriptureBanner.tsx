import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Modal,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop, 
  Circle,
  G 
} from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { CommentBottomSheet } from './CommentBottomSheet';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScriptureBannerProps {
  scripture?: string;
  reference?: string;
  theme?: 'sage' | 'deep' | 'warm' | 'classic' | 'royal' | 'dawn' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'gold' | 'rose' | 'black';
  height?: number;
  animated?: boolean;
  loves?: number;
  comments?: number;
  shares?: number;
}

type ThemeConfig = {
  colors: readonly [string, string, string];
  textColor: string;
  decorativeColor: string;
  overlayColor: string;
  accentColor: string;
};

const THEME_CONFIGS: Record<string, ThemeConfig> = {
  sage: {
    colors: ['#7C9885', '#5A7C65', '#4A6B5A'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(92, 124, 101, 0.15)',
    accentColor: '#A8C4B0',
  },
  deep: {
    colors: ['#2C5282', '#1A365D', '#153154'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.35)',
    overlayColor: 'rgba(26, 54, 93, 0.12)',
    accentColor: '#4A90C2',
  },
  warm: {
    colors: ['#C05621', '#9C4221', '#8B3A1C'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(156, 66, 33, 0.15)',
    accentColor: '#D4834F',
  },
  classic: {
    colors: ['#0C154C', '#1E2B5B', '#2A3B6C'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.35)',
    overlayColor: 'rgba(30, 43, 91, 0.12)',
    accentColor: '#4A5F8A',
  },
  royal: {
    colors: ['#6B46C1', '#553C9A', '#4C1D95'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(76, 29, 149, 0.15)',
    accentColor: '#8B5CF6',
  },
  dawn: {
    colors: ['#F97316', '#EA580C', '#DC2626'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.35)',
    overlayColor: 'rgba(234, 88, 12, 0.12)',
    accentColor: '#FB923C',
  },
  ocean: {
    colors: ['#0891B2', '#0E7490', '#155E75'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(14, 116, 144, 0.15)',
    accentColor: '#06B6D4',
  },
  sunset: {
    colors: ['#F59E0B', '#D97706', '#B45309'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(217, 119, 6, 0.15)',
    accentColor: '#FCD34D',
  },
  forest: {
    colors: ['#059669', '#047857', '#065F46'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(4, 120, 87, 0.15)',
    accentColor: '#10B981',
  },
  lavender: {
    colors: ['#A855F7', '#9333EA', '#7C3AED'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(147, 51, 234, 0.15)',
    accentColor: '#C084FC',
  },
  gold: {
    colors: ['#FBBF24', '#F59E0B', '#D97706'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(245, 158, 11, 0.15)',
    accentColor: '#FDE047',
  },
  rose: {
    colors: ['#F43F5E', '#E11D48', '#BE123C'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.4)',
    overlayColor: 'rgba(225, 29, 72, 0.15)',
    accentColor: '#FB7185',
  },
  black: {
    colors: ['#000000', '#1A1A1A', '#2D2D2D'] as const,
    textColor: '#FFFFFF',
    decorativeColor: 'rgba(255, 255, 255, 0.3)',
    overlayColor: 'rgba(0, 0, 0, 0.2)',
    accentColor: '#FFFFFF',
  },
} as const;

// Animated decorative flow component
const AnimatedDecorativeFlow: React.FC<{ 
  color: string; 
  style?: any; 
  animated?: boolean;
}> = ({ 
  color, 
  style, 
  animated = true 
}) => {
  const flowOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.timing(flowOffset, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animated]);

  const animatedTransform = animated 
    ? {
        transform: [
          {
            translateX: flowOffset.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 30],
            }),
          },
        ],
      }
  : {};

  const gradientId = `flowGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Animated.View style={[animatedTransform, style]}>
      <Svg width={SCREEN_WIDTH + 60} height="60" viewBox={`0 0 ${SCREEN_WIDTH + 60} 60`}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="0" />
            <Stop offset="20%" stopColor={color} stopOpacity="0.5" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="80%" stopColor={color} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        
        <Path
          d={`M-30,25 Q${SCREEN_WIDTH * 0.2},15 ${SCREEN_WIDTH * 0.4},28 T${SCREEN_WIDTH * 0.8},20 T${SCREEN_WIDTH + 30},30`}
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        
        <Path
          d={`M-30,40 Q${SCREEN_WIDTH * 0.3},50 ${SCREEN_WIDTH * 0.6},35 T${SCREEN_WIDTH + 30},45`}
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        
        <G opacity="0.7">
          <Circle cx={SCREEN_WIDTH * 0.25} cy="22" r="2" fill={color} opacity="0.8" />
          <Circle cx={SCREEN_WIDTH * 0.5} cy="30" r="1.5" fill={color} opacity="0.6" />
          <Circle cx={SCREEN_WIDTH * 0.75} cy="25" r="2.5" fill={color} opacity="0.7" />
        </G>
      </Svg>
    </Animated.View>
  );
};

// Floating elements component
const FloatingElements: React.FC<{ 
  color: string; 
  animated?: boolean;
}> = ({ 
  color, 
  animated = true 
}) => {
  const animationRefs = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (animated) {
      const animations = animationRefs.map((ref, index) => 
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 800),
            Animated.timing(ref, {
              toValue: 1,
              duration: 3000 + (index * 400),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );

      animations.forEach(animation => animation.start());
    }
  }, [animated]);

  return (
    <View style={styles.floatingContainer}>
      {[...Array(6)].map((_, i) => {
        const animatedTransform = animated 
          ? {
              transform: [
                {
                  translateY: animationRefs[i].interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -10, 0],
                  }),
                },
                {
                  scale: animationRefs[i].interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 0.8],
                  }),
                },
              ],
            }
          : {};

        return (
          <Animated.View
            key={i}
            style={[
              styles.floatingDot,
              {
                backgroundColor: color,
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                opacity: 0.3 + (i * 0.1),
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                borderRadius: (2 + (i % 3)) / 2,
              },
              animatedTransform,
            ]}
          />
        );
      })}
    </View>
  );
};

export const ScriptureBanner: React.FC<ScriptureBannerProps> = ({
  scripture = "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
  reference = "Jeremiah 29:11",
  theme = 'classic',
  height = 120,
  animated = true,
  loves = 0,
  comments = 0,
  shares = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([
    {
      id: '1',
      author: 'Sarah M.',
      text: 'This verse has been so comforting during difficult times. Trusting God\'s plan is everything.',
      timestamp: '2 hours ago',
      likes: 12,
    },
    {
      id: '2',
      author: 'John D.',
      text: 'A powerful reminder that God has a purpose for our lives, even when we can\'t see it.',
      timestamp: '5 hours ago',
      likes: 8,
    },
  ]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [isLiked, setIsLiked] = useState(false);
  const [currentLoves, setCurrentLoves] = useState(loves);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const themeConfig = THEME_CONFIGS[theme];

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated]);

  const handlePress = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const handleLikeScripture = () => {
    setIsLiked(!isLiked);
    setCurrentLoves(isLiked ? currentLoves - 1 : currentLoves + 1);
  };

  const handleCommentPress = () => {
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handleAddComment = (text: string) => {
    const newComment = {
      id: Date.now().toString(),
      author: 'You',
      text,
      timestamp: 'Just now',
      likes: 0,
    };
    setCommentsList([newComment, ...commentsList]);
  };

  const handleLikeComment = (commentId: string) => {
    setCommentsList(commentsList.map(comment => {
      if (comment.id === commentId) {
        const isLiked = likedComments.has(commentId);
        return {
          ...comment,
          likes: isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
    
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const BannerContent = ({ isFull = false }) => (
    <Animated.View
      style={[
        isFull ? styles.fullScreenContainer : styles.bannerContainer,
        {
          height: isFull ? SCREEN_HEIGHT : height,
          transform: [{ scale: isFull ? 1 : scaleAnim }],
          opacity: isFull ? 1 : fadeAnim,
        }
      ]}
    >
      <LinearGradient
        colors={themeConfig.colors}
        style={isFull ? styles.fullScreenGradient : styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated decorative elements */}
        <AnimatedDecorativeFlow
          color={themeConfig.decorativeColor}
          style={isFull ? styles.fullScreenDecorativeFlow : styles.decorativeFlow}
          animated={animated}
        />
        
        <FloatingElements
          color={themeConfig.accentColor}
          animated={animated}
        />

        {/* Content */}
        <View style={isFull ? styles.fullScreenContent : styles.content}>
          <View style={isFull ? styles.fullScreenTextContainer : styles.textContainer}>
            <Text
              style={[
                isFull ? styles.fullScreenScripture : styles.scripture,
                { color: themeConfig.textColor }
              ]}
            >
              {scripture}
            </Text>
            <Text
              style={[
                isFull ? styles.fullScreenReference : styles.reference,
                { color: themeConfig.textColor }
              ]}
            >
              {reference}
            </Text>
          </View>
          
          {!isFull && (
            <View style={styles.tapIndicator}>
              <Feather name="maximize-2" size={16} color={themeConfig.textColor} opacity={0.7} />
            </View>
          )}
          
          {/* Action Icons */}
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={handleLikeScripture}>
              <Feather 
                name="heart" 
                size={20} 
                color={isLiked ? '#EF4444' : themeConfig.textColor} 
                fill={isLiked ? '#EF4444' : 'transparent'}
              />
              {currentLoves > 0 && (
                <View style={[styles.countBadge, { backgroundColor: themeConfig.accentColor }]}>
                  <Text style={[styles.countText, { color: theme === 'black' ? '#000000' : '#FFFFFF' }]}>{currentLoves}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={handleCommentPress}>
              <Feather name="message-circle" size={20} color={themeConfig.textColor} />
              {comments > 0 && (
                <View style={[styles.countBadge, { backgroundColor: themeConfig.accentColor }]}>
                  <Text style={[styles.countText, { color: theme === 'black' ? '#000000' : '#FFFFFF' }]}>{comments}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Feather name="share-2" size={20} color={themeConfig.textColor} />
              {shares > 0 && (
                <View style={[styles.countBadge, { backgroundColor: themeConfig.accentColor }]}>
                  <Text style={[styles.countText, { color: theme === 'black' ? '#000000' : '#FFFFFF' }]}>{shares}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Close button for full screen */}
        {isFull && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Feather name="x" size={24} color={themeConfig.textColor} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.bannerWrapper}
    >
      <BannerContent />
      
      <Modal
        visible={isExpanded}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <View style={styles.modalOverlay}>
          <BannerContent isFull={true} />
        </View>
      </Modal>
      
      {/* Comments Bottom Sheet */}
      <CommentBottomSheet
        visible={showComments}
        onClose={handleCloseComments}
        scripture={scripture}
        reference={reference}
        comments={commentsList}
        likedComments={likedComments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        theme={theme}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  decorativeFlow: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingDot: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60, 
  },
  scripture: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Geist-Medium',
    marginBottom: 8,
  },
  reference: {
    fontSize: 14,
    fontFamily: 'Geist-SemiBold',
    opacity: 0.9,
  },
  tapIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcons: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    flexDirection: 'row',
    gap: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Geist-SemiBold',
    fontWeight: '600',
  },
  // Full screen styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenGradient: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  fullScreenDecorativeFlow: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
  },
  fullScreenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80, // More padding for full screen mode
    maxWidth: SCREEN_WIDTH - 60,
  },
  fullScreenScripture: {
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: 'Geist-Medium',
    marginBottom: 16,
  },
  fullScreenReference: {
    fontSize: 18,
    fontFamily: 'Geist-SemiBold',
    opacity: 0.9,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
