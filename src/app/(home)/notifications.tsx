import React, { useRef, useState, useEffect } from "react";
import { Notifications } from "@/src/screens";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
  type: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(Array.isArray(parsed) ? parsed : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications().then(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    // Update AsyncStorage
    const updated = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    AsyncStorage.setItem('notifications', JSON.stringify(updated)).catch(error => {
      console.error('Failed to update notification:', error);
    });
  };

  const handleClearAll = async () => {
    try {
      await AsyncStorage.removeItem('notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  if (loading) {
    return (
   <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
        <View style={styles.container}>
          <Skeleton width={200} height={24} style={{ marginBottom: 20, marginTop: 20 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
        </View>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Notifications 
        onBack={handleBack} 
        notifications={notifications} 
        onNotificationPress={handleNotificationPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onClearAll={handleClearAll}
      />
    </AuthPageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
});
