import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar, Animated, View } from "react-native";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Main layout component that doesn't depend on auth state
const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "DMSans-Bold": require("../assets/fonts/DMSans-Bold.ttf"),
    "DMSans-Medium": require("../assets/fonts/DMSans-Medium.ttf"),
    "DMSans-Regular": require("../assets/fonts/DMSans-Regular.ttf"),
    DMSans: require("../assets/fonts/DMSans-Regular.ttf"),
    SpaceGrotesk: require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    "SpaceGrotesk-Light": require("../assets/fonts/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      // Start the fade-in animation
      setShowContent(true);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide splash screen after animation completes
        SplashScreen.hideAsync();
      });
    }
  }, [fontsLoaded, error, fadeAnim, scaleAnim]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle={"light-content"} />
      {showContent && (
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <RootLayoutNav />
        </Animated.View>
      )}
      <Toast />
    </>
  );
};

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#fff",
          paddingHorizontal: 0,
          paddingTop: 20,
        },
        animation: "fade",
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default RootLayout;