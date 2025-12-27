import React, { useState, useEffect, useRef } from "react";
import { ImageBackground, StyleSheet, View, Animated } from "react-native";
import { hp, wp } from "@/src/utils";
import Feather from "@expo/vector-icons/Feather";

interface HomeImageSectionProps {
  imageUris?: string[] | null; 
  duration?: number; 
  durations?: number[];
  loading?: boolean;
}

const FALLBACK_IMAGE = "https://via.placeholder.com/640x360.png?text=Image+Unavailable";

export const HomeImageSection = ({
  imageUris = [],
  duration = 5000,
  durations,
  loading = false,
}: HomeImageSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const images = imageUris && imageUris.length > 0 ? imageUris : [FALLBACK_IMAGE];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (images.length <= 1) return;

    let animationTimeout: NodeJS.Timeout | null = null;

    const cycle = () => {
      const currentDuration = durations ? durations[currentIndex] : duration;
      animationTimeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.08,
              friction: 5,
              tension: 120,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 4,
              tension: 100,
              useNativeDriver: true,
            }),
          ]),
        ]).start(({ finished }) => {
          if (finished) {
            setCurrentIndex(nextIndex);
            setNextIndex((nextIndex + 1) % images.length);
            
            setTimeout(() => {
              fadeAnim.setValue(0);
              scaleAnim.setValue(1);
              cycle();
            }, 10);
          }
        });
      }, currentDuration);
    };

    cycle();

    return () => {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, [images, durations, duration]);

  const renderPlaceholder = () => (
    <View style={styles.overlay}>
      <View style={styles.iconBadge}>
        <Feather name="image" size={32} color="#fff" />
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {loading ? (
        <View style={[styles.image, styles.imageRadius, { backgroundColor: "#E3E6EB" }]} />
      ) : (
        <ImageBackground
          source={{ uri: images[currentIndex] }}
          style={styles.image}
          imageStyle={styles.imageRadius}
          resizeMode="cover"
        >
          {/* Foreground Layer: Next Image (Animated) */}
          <Animated.View 
            style={[
              StyleSheet.absoluteFill, 
              { 
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <ImageBackground
              source={{ uri: images[nextIndex] }}
              style={styles.image}
              imageStyle={styles.imageRadius}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Show placeholder icon if no images array was passed */}
          {(!imageUris || imageUris.length === 0) && renderPlaceholder()}
        </ImageBackground>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: wp(8), 
    overflow: "hidden",
    backgroundColor: "#F0F2F5",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  image: {
    height: hp(250),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageRadius: {
    borderRadius: wp(16),
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: wp(24),
    paddingVertical: hp(16),
    borderRadius: wp(16),
    alignItems: "center",
  },
  iconBadge: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(64),
    backgroundColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeImageSection;