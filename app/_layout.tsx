import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
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

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle={"dark-content"} />
      <RootLayoutNav />
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
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default RootLayout;
