import { Button } from "@/src/components/ui/Button";
import { PaginationDots } from "@/src/components/ui/PaginationDots";
import { TextLink } from "@/src/components/ui/TextLink";
import { ThemeText } from "@/src/components/ui/ThemeText";
import { onboardingData } from "@/src/constants/data";
import { fs, getColor, hp, wp } from "@/src/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  ImageBackground,
  Animated,
  PanResponder,
  PanResponderGestureState,
  Text,
  Easing,
  StatusBar as RNStatusBar,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 44;
const isSmallScreen = height < 700;

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const colors = getColor();

  // Animated values for smooth transitions
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Track if we're currently transitioning
  const [isTransitioning, setIsTransitioning] = useState(false);

  const animateToNext = (nextIndex: number) => {
    if (isTransitioning || nextIndex < 0 || nextIndex >= onboardingData.length) return;

    setIsTransitioning(true);

    Animated.parallel([
      // Background smooth crossfade
      Animated.timing(backgroundOpacity, {
        toValue: 0.3,
        duration: 150, 
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Content slides down and fades
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150, 
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 20,
        duration: 150, 
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Subtle scale effect
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update index while content is transitioning
      setCurrentIndex(nextIndex);

      Animated.parallel([
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 150, 
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 150, 
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 150, 
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150, 
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // Subtle feedback on gesture start
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!isTransitioning) {
        const dragDistance = Math.abs(gestureState.dx);
        const maxDrag = width * 0.3;

        // Subtle content movement during gesture
        const translateValue = gestureState.dx * 0.05;
        contentTranslateY.setValue(Math.abs(translateValue) * 0.5);

        // Subtle opacity change during drag
        const fadeValue = Math.max(0.7, 1 - (dragDistance / maxDrag) * 0.3);
        contentOpacity.setValue(fadeValue);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (!isTransitioning) {
        const threshold = width * 0.25;
        const velocity = Math.abs(gestureState.vx);

        // Determine swipe direction and navigate
        if (gestureState.dx > threshold || (gestureState.dx > 50 && velocity > 0.5)) {
          // Swipe right - go to previous
          if (currentIndex > 0) {
            animateToNext(currentIndex - 1);
          } else {
            // Reset animations if no navigation
            Animated.parallel([
              Animated.timing(contentTranslateY, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]).start();
          }
        } else if (gestureState.dx < -threshold || (gestureState.dx < -50 && velocity > 0.5)) {
          // Swipe left - go to next
          if (currentIndex < onboardingData.length - 1) {
            animateToNext(currentIndex + 1);
          } else {
            // Reset animations if no navigation
            Animated.parallel([
              Animated.timing(contentTranslateY, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]).start();
          }
        } else {
          // Reset animations if swipe wasn't enough
          Animated.parallel([
            Animated.timing(contentTranslateY, {
              toValue: 0,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    },
    onPanResponderTerminate: () => {
      // Reset animations if gesture is terminated
      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
  });

  const renderCurrentSlide = () => {
    const item = onboardingData[currentIndex];
    const isLastSlide = currentIndex === onboardingData.length - 1;

    return (
      <View style={styles.slide} {...panResponder.panHandlers}>
        {/* Background Image with smooth transition */}
        <Animated.View 
          style={[
            styles.backgroundContainer,
            {
              opacity: backgroundOpacity,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <ImageBackground
            source={item.image}
            style={styles.fullBackgroundImage}
            resizeMode="cover"
          >
            {/* Gradient Overlay */}
            <View style={styles.gradientOverlay} />

            {/* Top Content */}
            <View style={styles.topContent}>
              <ThemeText variant="bodySmall" style={styles.brandText}>
                Maseke Daniels Ministries 
              </ThemeText>
            </View>
          </ImageBackground>
        </Animated.View>

        <View style={styles.bottomSheet}>
          {/* Content with smooth animations */}
          <Animated.View 
            style={[
              styles.contentContainer,
              { 
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }]
              }
            ]}
          >
            <View style={styles.titleContainer}>
              {/* Single Pagination Dots - only here */}
              <View style={styles.paginationContainer}>
                <PaginationDots
                  length={onboardingData.length}
                  activeIndex={currentIndex}
                />
              </View>

              <Text style={styles.title}>
                {item.title}
              </Text>
              <Text style={styles.description}>
                {item.description}
              </Text>
            </View>

            {/* Buttons - Conditional rendering based on slide */}
            <View style={styles.buttonContainer}>
              {isLastSlide ? (
                // Last slide - only one button
                <Button
                  title="Get Started"
                  onPress={handleGetStarted}
                  style={styles.primaryButton}
                  disabled={isTransitioning}
                />
              ) : (
                // First slides - two buttons
                <>
                  <Button
                    title="Next"
                    onPress={handleNext}
                    style={styles.secondaryButton}
                    textStyle={{ color: '#000000ff' }} 
                    disabled={isTransitioning}
                  />
                  <Button
                    title="Get Started"
                    onPress={handleLogin}
                    style={styles.primaryButton}
                    disabled={isTransitioning}
                  />
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </View>
    );
  };

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      animateToNext(currentIndex + 1);
    }
  };

  const handleGetStarted = async () => {
    if (currentIndex < onboardingData.length - 1) {
      animateToNext(currentIndex + 1);
    } else {
      await markOnboardingComplete();
      router.push("/signup");
    }
  };

  const handleLogin = async () => {
    await markOnboardingComplete();
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.gestureContainer}>
        {renderCurrentSlide()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gestureContainer: {
    flex: 1,
  },
  slide: {
    width,
    height: height,
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.68, 
    width: '100%',
  },
  fullBackgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  topContent: {
    paddingTop: STATUS_BAR_HEIGHT + hp(20),
    paddingHorizontal: wp(24),
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: fs(18),
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: wp(0),
    left: wp(0),
    right: wp(0),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingHorizontal: wp(24),
    paddingTop: isSmallScreen ? hp(10) : hp(16),
    paddingBottom: isSmallScreen ? hp(10) : hp(16),
    maxHeight: height * 0.48,
    minHeight: height * 0.36,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallScreen ? fs(22) : fs(26),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: isSmallScreen ? hp(8) : hp(16),
    lineHeight: isSmallScreen ? 28 : 34,
    maxWidth: '85%',
  },
  description: {
    fontSize: isSmallScreen ? fs(13) : fs(15),
    color: '#424242',
    fontFamily: "SpaceGrotesk-Medium",
    textAlign: 'center',
    lineHeight: isSmallScreen ? 20 : 24,
    paddingHorizontal: wp(10),
  },
  paginationContainer: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? hp(12) : hp(24),
  },
  buttonContainer: {
    paddingBottom: isSmallScreen ? hp(8) : hp(20),
  },
  primaryButton: {
    backgroundColor: '#0C154C',
    borderRadius: 12,
    paddingVertical: isSmallScreen ? hp(12) : hp(16),
    marginBottom: isSmallScreen ? hp(8) : hp(16),
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: isSmallScreen ? hp(12) : hp(16),
    color: "#000000ff",
    borderWidth: 1,
    borderColor: '#3B489740',
    marginBottom: isSmallScreen ? hp(4) : hp(8),
  },
});

export default OnboardingScreen;