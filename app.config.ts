import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

// Define the type for your custom extra config
export interface ExtraConfig {
  paystackPublicKey?: string;
  eas: {
    projectId: string;
  };
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "maseke",
  slug: "maseke",
  version: "1.0.0",
  extra: {
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
    eas: {
      projectId: "36a3c62a-c2e6-4941-836d-f7bb175e9353"
    }
  } as ExtraConfig,
  plugins: [
    "expo-font",
    "expo-router",
    "expo-web-browser",
  ],
});
