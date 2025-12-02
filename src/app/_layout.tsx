import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar, View, Text, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import "react-native-url-polyfill/auto";
import { useAuthStore } from "../stores/authStore";
import { registerForPushNotificationsAsync } from "../notifications";
import BottomMenu from "../components/BottomMenu";
import { usePathname } from "expo-router";
import { shouldHideBottomMenu } from "../constants/navigation";
import { useInternetConnectivity } from "../hooks/useInternetConnectivity";
import * as ScreenOrientation from 'expo-screen-orientation';

// Color constants
const Colors = {
  success: '#10B981',
  error: '#EF4444', 
  info: '#3B82F6',
  white: '#FFF',
  black: '#000',
  whiteBg: '#fff',
} as const;

interface ToastProps {
  text1?: string;
  text2?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorToast: {
    backgroundColor: Colors.error,
  },
  iconMargin: {
    marginRight: 12,
  },
  infoToast: {
    backgroundColor: Colors.info,
  },
  successToast: {
    backgroundColor: Colors.success,
  },
  toastContainer: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 0,
    maxWidth: '80%',
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toastSubText: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 4,
  },
  toastText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Toast config for better styling
const toastConfig = {
  error: (props: ToastProps) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Ionicons name="close-circle" size={24} color={Colors.white} style={styles.iconMargin} />
      <View>
        <Text style={styles.toastText}>{props.text1}</Text>
        {props.text2 && <Text style={styles.toastSubText}>{props.text2}</Text>}
      </View>
    </View>
  ),
  info: (props: ToastProps) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Ionicons name="information-circle" size={24} color={Colors.white} style={styles.iconMargin} />
      <View>
        <Text style={styles.toastText}>{props.text1}</Text>
        {props.text2 && <Text style={styles.toastSubText}>{props.text2}</Text>}
      </View>
    </View>
  ),
  success: (props: ToastProps) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Ionicons name="checkmark-circle" size={24} color={Colors.white} style={styles.iconMargin} />
      <View>
        <Text style={styles.toastText}>{props.text1}</Text>
        {props.text2 && <Text style={styles.toastSubText}>{props.text2}</Text>}
      </View>
    </View>
  ),
};

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
    "Geist-Thin": require("../assets/fonts/Geist-Thin.ttf"),
    "Geist-ExtraLight": require("../assets/fonts/Geist-ExtraLight.ttf"),
    "Geist-Light": require("../assets/fonts/Geist-Light.ttf"),
    "Geist-Regular": require("../assets/fonts/Geist-Regular.ttf"),
    "Geist-Medium": require("../assets/fonts/Geist-Medium.ttf"),
    "Geist-SemiBold": require("../assets/fonts/Geist-SemiBold.ttf"),
    "Geist-Bold": require("../assets/fonts/Geist-Bold.ttf"),
    "Geist-ExtraBold": require("../assets/fonts/Geist-ExtraBold.ttf"),
    "Geist-Black": require("../assets/fonts/Geist-Black.ttf"),
  });

  const [showContent, setShowContent] = useState(false);

  // Load auth state on app start
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth(); // Load token and user from AsyncStorage
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        useAuthStore.getState().setPushToken(token);
        // If already logged in, send token to backend
        const { token: authToken } = useAuthStore.getState();
        if (authToken) {
          useAuthStore.getState().sendPushToken(token);
        }
      }
    });

    // Allow auto-rotation
    ScreenOrientation.unlockAsync();
  }, []);

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      // Show content after fonts load
      setShowContent(true);
      // Hide splash screen immediately since AuthPageWrapper will handle the animation
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
      <StatusBar barStyle={"dark-content"} backgroundColor={Colors.whiteBg} />

      {showContent && (
        <RootLayoutNav />
      )}
      <Toast config={toastConfig} />
    </>
  );
};

function RootLayoutNav() {
  const { token } = useAuthStore();
  const pathname = usePathname();

  const showBottomMenu = token && pathname && !shouldHideBottomMenu(pathname);
  
  // Monitor internet connectivity for both auth and home sections
  useInternetConnectivity();

  if (!token) {
    // Auth stack
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.whiteBg,
            paddingHorizontal: 0,
            paddingTop: 20,
          },
          animation: "fade",
          animationDuration: 250,
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/createpassword" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/forgotpassword" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Main stack
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.whiteBg,
            paddingHorizontal: 0,
            paddingTop: 20,
            paddingBottom: showBottomMenu ? 80 : 20,
          },
          animation: "fade",
          animationDuration: 250,
        }}
      >
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        {/* Add other main screens here */}
      </Stack>
      {showBottomMenu && <BottomMenu />}
    </View>
  );
}

export default RootLayout;