import React, { useCallback, useEffect, useState } from "react";
import { Home } from "@/src/screens/Home/Home";
import { quickActions } from "@/src/constants/data";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";
import { HomeStorage } from "@/src/utils/homeStorage";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Initialize home data on first load
  useEffect(() => {
    const initializeHomeData = async () => {
      try {
        const hasHomeData = await HomeStorage.hasHomeData();
        if (!hasHomeData) {
          // Save initial quick actions data
          const initialHomeData = {
            user: null,
            quickActions: quickActions,
            last_synced: new Date().toISOString(),
          };
          await HomeStorage.saveHomeData(initialHomeData);
        }
      } catch (error) {
        console.error('Failed to initialize home data:', error);
      }
    };

    initializeHomeData();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);

    // Force sync with fresh API data
    const timer = setTimeout(async () => {
      try {
        // Clear stale data flag to force API sync
        const homeData = await HomeStorage.getHomeData();
        if (homeData) {
          // Update last_synced to force refresh
          homeData.last_synced = new Date().toISOString();
          await HomeStorage.saveHomeData(homeData);
        }
      } catch (error) {
        console.error('Failed to refresh home data:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleCardPress = (link: string) => {
    router.push(link);
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  return (
    <AuthPageWrapper disableLottieLoading={true}>
      <Home
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onCardPress={handleCardPress}
        onProfilePress={handleProfilePress}
        quickActions={quickActions}
      />
    </AuthPageWrapper>
  );
}
