import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DevotionalBannerProps {
  title: string;
  subtitle?: string;
  scripture?: string;
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
  dayNumber,
  totalDays,
  theme = 'sage',
  height = 220,
  animated = true,
}) => {
  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.sage;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

      {/* Floating Decorative Elements */}
      <FloatingElements color={config.decorativeColor} animated={animated} />

      {/* Subtle texture overlay */}
      <View style={[styles.overlay, { backgroundColor: config.overlayColor }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Progress Indicator */}
        {dayNumber && totalDays && (
          <ProgressIndicator 
            current={dayNumber} 
            total={totalDays} 
            color={config.accentColor}
            animated={animated}
          />
        )}

        {/* Main Title */}
        <Text style={[styles.title, { color: config.textColor }]}>
          {title}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text style={[styles.subtitle, { color: config.textColor }]}>
            {subtitle}
          </Text>
        )}

        {/* Scripture Verse - Perfectly Centered */}
        {scripture && (
          <View style={styles.scriptureContainer}>
            <Text style={[styles.scripture, { color: config.textColor }]}>
              "{scripture}"
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
    marginTop: 16,
    paddingHorizontal: 20,
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