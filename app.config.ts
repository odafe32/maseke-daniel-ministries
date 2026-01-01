import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export interface ExtraConfig {
  paystackPublicKey?: string;
  eas: {
    projectId: string;
  };
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Maseke Daniel Ministries",
  slug: "maseke",
  version: "1.0.0",
  icon: "./src/assets/logo.png",
  userInterfaceStyle: "light",
  scheme: "maseke-daniel-ministries",
  newArchEnabled: true,  // ← Changed from false to true
  extra: {
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
    eas: {
      projectId: "36a3c62a-c2e6-4941-836d-f7bb175e9353"
    }
  } as ExtraConfig,
  plugins: [
    "expo-media-library",
    "expo-font",
    "expo-router",
    "expo-web-browser",
  ],
  splash: {
    image: "./src/assets/logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.maseke.mobile"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/logo.png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    package: "com.maseke.mobile",
    versionCode: 2
  },
  web: {
    favicon: "./src/assets/logo.png"
  }
});