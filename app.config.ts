import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export interface ExtraConfig {
  paystackPublicKey?: string;
  eas: {
    projectId: string;
  };
}

export default ({ config }: ConfigContext): any => ({
  ...config,
  name: "Maseke Daniels Ministries",
  slug: "maseke",
  version: "1.0.0",
  icon: "./src/assets/logo.png",
  userInterfaceStyle: "light",
  scheme: "maseke-daniel-ministries",
  newArchEnabled: true,  
  extra: {
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
    eas: {
      projectId: "36a3c62a-c2e6-4941-836d-f7bb175e9353"
    }
  } as ExtraConfig,
  cli: {
    appVersionSource: "remote"
  },
  plugins: [
    "expo-router",
    "expo-media-library",
    "expo-font",
    "expo-web-browser",
  ],
  "expo-router": {
    "appDir": "src/app"
  },
  splash: {
    image: "./src/assets/logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "org.maseke.mobile"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/logo.png",
      backgroundColor: "#ffffff"
    },
    package: "org.masekedaniel.ministries",
    versionCode: 3
  },
  web: {
    favicon: "./src/assets/logo.png"
  }
});