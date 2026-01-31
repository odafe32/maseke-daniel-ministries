import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle,
  G
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNER_THEME_CACHE_KEY = '@devotional_banner_theme';
const BANNER_THEME_CACHE_DURATION = 60 * 60 * 1000; 

interface DevotionalBannerProps {
  title: string;
  subtitle?: string;
  scripture?: string;
  verse?: string;
  dayNumber?: number;
  totalDays?: number;
  theme?: 'sage' | 'deep' | 'warm' | 'classic' | 'royal' | 'dawn';
  height?: number;
  animated?: boolean;
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
  } as const;
// Helper function to get cached theme or select new one
const getBannerTheme = async (): Promise<string> => {
  try {
    const cachedData = await AsyncStorage.getItem(BANNER_THEME_CACHE_KEY);
    if (cachedData) {
      const { theme, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      const timeDiff = now - timestamp;

      // If less than 1 hour has passed, return cached theme
      if (timeDiff < BANNER_THEME_CACHE_DURATION) {
        console.log('🎨 Using cached banner theme:', theme);
        return theme;
      }
    }
  } catch (error) {
    console.warn('❌ Failed to read banner theme cache:', error);
  }

  // Select new random theme and cache it
  const themes = Object.keys(THEME_CONFIGS);
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];

  try {
    const cacheData = {
      theme: randomTheme,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(BANNER_THEME_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('❌ Failed to cache banner theme:', error);
  }

  return randomTheme;
};

// Simple animated decorative flow with consistent driver usage
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
      // Single animation with native driver
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
        
        {/* Main flowing line */}
        <Path
          d={`M-30,25 Q${SCREEN_WIDTH * 0.2},15 ${SCREEN_WIDTH * 0.4},28 T${SCREEN_WIDTH * 0.8},20 T${SCREEN_WIDTH + 30},30`}
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Secondary line */}
        <Path
          d={`M-30,40 Q${SCREEN_WIDTH * 0.3},50 ${SCREEN_WIDTH * 0.6},35 T${SCREEN_WIDTH + 30},45`}
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        
        {/* Decorative dots */}
        <G opacity="0.7">
          <Circle cx={SCREEN_WIDTH * 0.25} cy="22" r="2" fill={color} opacity="0.8" />
          <Circle cx={SCREEN_WIDTH * 0.5} cy="30" r="1.5" fill={color} opacity="0.6" />
          <Circle cx={SCREEN_WIDTH * 0.75} cy="25" r="2.5" fill={color} opacity="0.7" />
        </G>
      </Svg>
    </Animated.View>
  );
};

// Simple floating elements
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

// Progress indicator with proper animation
const ProgressIndicator: React.FC<{ 
  current: number; 
  total: number; 
  color: string; 
  animated?: boolean;
}> = ({ current, total, color, animated = true }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressPercentage = Math.min(current / total, 1);

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progressPercentage,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // Must be false for width animation
      }).start();
    } else {
      progressAnim.setValue(progressPercentage);
    }
  }, [current, total, animated, progressPercentage]);

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: `${color}40` }]}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: color,
              width: animated 
                ? progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  })
                : `${progressPercentage * 100}%`
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color }]}>
        Day {current} of {total}
      </Text>
    </View>
  );
};

export const DevotionalBannerEnhanced: React.FC<DevotionalBannerProps> = ({
  title,
  subtitle,
  scripture,
  verse,
  dayNumber,
  totalDays,
  theme: propTheme,
  height = 200,
  animated = true,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('sage');
  const config = THEME_CONFIGS[selectedTheme] || THEME_CONFIGS.sage;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initialize theme on component mount
  useEffect(() => {
    const initializeTheme = async () => {
      if (propTheme && propTheme !== 'sage') {
        // If a specific theme is passed as prop, use it (but still cache for consistency)
        setSelectedTheme(propTheme);
        try {
          const cacheData = {
            theme: propTheme,
            timestamp: Date.now(),
          };
          await AsyncStorage.setItem(BANNER_THEME_CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
          console.warn('❌ Failed to cache prop theme:', error);
        }
      } else {
        // Use cached theme selection logic
        const cachedTheme = await getBannerTheme();
        setSelectedTheme(cachedTheme);
      }
    };

    initializeTheme();
  }, [propTheme]);

  console.log('🎯 DevotionalBannerEnhanced props:', {
    title,
    subtitle,
    scripture,
    verse,
    hasVerse: !!verse,
    verseLength: verse?.length,
    dayNumber,
    totalDays,
    selectedTheme,
  });

  useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [animated]);

  return (
    <Animated.View style={[
      styles.container, 
      { height, opacity: animated ? fadeAnim : 1 }
    ]}>
      {/* Gradient Background */}
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Decorative Flow Lines */}
      <AnimatedDecorativeFlow 
        color={config.decorativeColor} 
        style={{ position: 'absolute', top: 10 }} 
        animated={animated}
      />
      <AnimatedDecorativeFlow 
        color={config.decorativeColor} 
        style={{ position: 'absolute', bottom: 10, transform: [{ scaleY: -1 }] }} 
        animated={animated}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Reflections Indicator */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: config.accentColor }]}>
            Reflections
          </Text>
        </View>

        {/* Subtitle */}
        {subtitle && (
          <Text style={[styles.subtitle, { color: config.textColor }]}>
            {subtitle}
          </Text>
        )}

        {/* Scripture Reference */}
        {scripture && (
          <View style={styles.scriptureContainer}>
            <Text style={[styles.scriptureReference, { color: config.textColor }]}>
              {scripture}
            </Text>
          </View>
        )}

        {/* Verse Text */}
        {verse && (
          <View style={styles.verseContainer}>
            <Text style={[styles.verseText, { color: config.textColor }]}>
              "{verse}"
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  progressTrack: {
    height: 3,
    width: '60%',
    borderRadius: 1.5,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Geist-Bold',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.8,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'DMSans-SemiBold',
    textAlign: 'center',
    opacity: 0.92,
    marginBottom: 18,
    letterSpacing: 0.4,
  },
  scriptureContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    paddingHorizontal: 10,
  },
  scriptureReference: {
    fontSize: 18,
    fontFamily: 'DMSans-SemiBold',
    lineHeight: 20,
    opacity: 0.95,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  verseContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  verseText: {
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontStyle: 'italic',
    lineHeight: 23,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 12,
    flexWrap: 'wrap',
  },
  scripture: {
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    fontStyle: 'italic',
    lineHeight: 22,
    opacity: 0.95,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default DevotionalBannerEnhanced;