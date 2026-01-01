import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { images } from "@/src/constants/data";
import { useAuthStore } from "../stores/authStore";

const Index = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showVector, setShowVector] = useState(false);
  const { token } = useAuthStore();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const vectorOpacity = useRef(new Animated.Value(0)).current;
  const vectorTranslateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      Animated.sequence([
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

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // ✅ Check AsyncStorage directly instead of relying on store
      const hasSeenOnboardingStr = await AsyncStorage.getItem('hasSeenOnboarding');
      const hasSeenOnboarding = hasSeenOnboardingStr === 'true';

      console.log('Onboarding check:', { hasSeenOnboarding, token });

      if (!hasSeenOnboarding) {
        router.replace("/onboarding");
      } else if (token) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
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
});

export default Index;