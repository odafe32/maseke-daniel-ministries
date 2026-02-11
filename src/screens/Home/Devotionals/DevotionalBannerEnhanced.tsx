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
import { fs, hp, wp } from '@/src/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DevotionalBannerProps {
  title: string;
  subtitle?: string;
  scripture?: string;
  verse?: string;
  dayNumber?: number;
  totalDays?: number;
  height?: number;
  animated?: boolean;
}

const BANNER_CONFIG = {
  colors: ['#7C9885', '#5A7C65', '#4A6B5A'] as const,
  textColor: '#FFFFFF',
  decorativeColor: 'rgba(255, 255, 255, 0.4)',
  overlayColor: 'rgba(92, 124, 101, 0.15)',
  accentColor: '#A8C4B0',
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
  height = 200,
  animated = true,
}) => {
  const config = BANNER_CONFIG;
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
    borderRadius: wp(5),
    overflow: 'hidden',
    marginVertical: hp(12),
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: wp(0),
      height: hp(6),
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
    borderRadius: wp(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(28),
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  progressContainer: {
    width: '100%',
    marginBottom: hp(16),
    alignItems: 'center',
  },
  progressTrack: {
    height: hp(3),
    width: '60%',
    borderRadius: wp(1.5),
    marginBottom: hp(8),
  },
  progressFill: {
    height: '100%',
    borderRadius: wp(1.5),
  },
  progressText: {
    fontSize: fs(12),
    fontFamily: 'DMSans-Medium',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fs(26),
    fontFamily: 'Geist-Bold',
    textAlign: 'center',
    lineHeight: hp(30),
    letterSpacing: 0.8,
    marginBottom: hp(10),
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: fs(17),
    fontFamily: 'DMSans-SemiBold',
    textAlign: 'center',
    opacity: 0.92,
    marginBottom: hp(18),
    letterSpacing: 0.4,
  },
  scriptureContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    paddingHorizontal: wp(10),
  },
  scriptureReference: {
    fontSize: fs(18),
    fontFamily: 'DMSans-SemiBold',
    lineHeight: hp(20),
    opacity: 0.95,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  verseContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(8),
    paddingHorizontal: wp(20),
  },
  verseText: {
    fontSize: fs(18),
    fontFamily: 'DMSans-Regular',
    fontStyle: 'italic',
    lineHeight: hp(23),
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: wp(12),
    flexWrap: 'wrap',
  },
  scripture: {
    fontSize: fs(15),
    fontFamily: 'DMSans-Regular',
    fontStyle: 'italic',
    lineHeight: hp(22),
    opacity: 0.95,
    textAlign: 'center',
    paddingHorizontal: wp(8),
  },
});

export default DevotionalBannerEnhanced;