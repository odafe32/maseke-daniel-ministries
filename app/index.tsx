import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  View,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { images } from "@/constants/data";

const Index = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showVector, setShowVector] = useState(false);

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const vectorOpacity = useRef(new Animated.Value(0)).current;
  const vectorTranslateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Start animations
      Animated.sequence([
        // First animate the logo
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Show vector logo after 1.5 seconds
      setTimeout(() => {
        setShowVector(true);
        Animated.parallel([
          Animated.timing(vectorOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(vectorTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1500);

      // Wait for animations to complete before proceeding
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Comment out the onboarding check to always show onboarding
      // const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

      // if (hasSeenOnboarding === "true") {
      //   router.replace("/login");
      // } else {
      //   router.replace("/onboarding");
      // }

      // Always navigate to onboarding for now
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      router.replace("/onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Vector logo at the top */}
        {showVector && (
          <View style={styles.topSection}>
            <Animated.View
              style={[
                styles.vectorContainer,
                {
                  opacity: vectorOpacity,
                  transform: [{ translateY: vectorTranslateY }],
                },
              ]}
            >
              <Image
                source={images.logovector}
                style={styles.vectorLogo}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        )}

        {/* Main logo in center */}
        <View style={styles.centerSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={images.logo}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60, 
    alignItems: "center",
    zIndex: 1,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 130,
    height: 130,
  },
  vectorContainer: {
    alignItems: "center",
  },
  vectorLogo: {
    width: 150,
    height: 40,
  },
  slogan: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    fontStyle: "italic",
  },
});

export default Index;