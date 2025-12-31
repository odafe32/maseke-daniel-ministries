import React, { useCallback, useEffect, useState } from "react";
import { Home } from "@/src/screens/Home/Home";
import { quickActions } from "@/src/constants/data";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";
import { HomeStorage } from "@/src/utils/homeStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettingsStore } from '@/src/stores/settingsStore';
import { scheduleDevotionalReminders } from '@/src/notifications';
import { registerPushToken } from '@/src/notifications';
import { useAuthStore } from '@/src/stores/authStore';
import { useAdsStore } from '@/src/stores/adsStore';

interface Notification {
  read: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { ads, loading: adsLoading, fetchAds } = useAdsStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch ads on component mount
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications');
        if (stored) {
          const notifications = JSON.parse(stored);
          const unread = notifications.filter((n: Notification) => !n.read).length;
          setNotificationCount(unread);
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };
    loadNotifications();
  }, []);

  useEffect(() => {
    const initializeHomeData = async () => {
      try {
        const hasHomeData = await HomeStorage.hasHomeData();
        if (!hasHomeData) {
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

  useEffect(() => {
    const checkAndSchedule = async () => {
      try {
        const store = useSettingsStore.getState();
        await store.loadSettings();
        if (store.devotionalReminders) {
          await scheduleDevotionalReminders();
        }
        // Register push token
        const token = useAuthStore.getState().token;
        if (token) {
          registerPushToken(token);
        }
      } catch (error) {
        console.error('Failed to check and schedule reminders:', error);
      }
    };
    checkAndSchedule();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const homeData = await HomeStorage.getHomeData();
        if (homeData) {
          homeData.last_synced = new Date().toISOString();
          await HomeStorage.saveHomeData(homeData);
        }
        // Refresh ads
        await fetchAds();
      } catch (error) {
        console.error('Failed to refresh home data:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [fetchAds]);

  const handleCardPress = (link: string) => {
    router.push(link);
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  return (
    <AuthPageWrapper disableLottieLoading={true}>
      <Home
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onCardPress={handleCardPress}
        onProfilePress={handleProfilePress}
        onNotificationPress={handleNotificationPress}
        notificationCount={notificationCount}
        quickActions={quickActions}
        ads={ads}
        adsLoading={adsLoading}
      />
    </AuthPageWrapper>
  );
}
