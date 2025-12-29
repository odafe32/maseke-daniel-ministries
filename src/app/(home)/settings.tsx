import React, { useRef, useState, useEffect } from 'react';
import { Settings } from '@/src/screens/Home/Profile/Settings';
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";
import { useSettings } from '@/src/hooks/useSettings';
import { showSuccessToast } from '@/src/utils/toast';

export default function SettingsPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);

  const {
    notifications,
    sermonAlerts,
    devotionalReminders,
    stayLoggedIn,
    handleToggleChange,
  } = useSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleToggle = async (id: string, value: boolean) => {
    const setting = getSettingInfo(id);
    const statusText = value ? 'enabled' : 'disabled';
    
    await handleToggleChange(id, value);
    showSuccessToast('Setting Updated', `${setting?.title} ${statusText}`, { position: 'top', visibilityTime: 2000 });
  };

  const getSettingInfo = (id: string) => {
    switch (id) {
      case 'notifications':
        return {
          id: 'notifications',
          title: 'Notifications',
          description: 'Enable or disable app notifications',
          value: notifications,
        };
      case 'sermon-alerts':
        return {
          id: 'sermon-alerts',
          title: 'Sermon Alerts',
          description: 'Receive alerts when a live sermon starts',
          value: sermonAlerts,
        };
      case 'devotional-reminders':
        return {
          id: 'devotional-reminders',
          title: 'Daily Devotional reminders',
          description: 'Get reminders to read the devotional',
          value: devotionalReminders,
        };
      case 'stay-logged-in':
        return {
          id: 'stay-logged-in',
          title: 'Stay Logged In',
          description: 'Keep your account signed in on this device.',
          value: stayLoggedIn,
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
        <View style={styles.container}>
          <Skeleton width={120} height={24} style={{ marginBottom: 20, marginTop: 20 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 8 }} />
        </View>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Settings
        onBack={handleBack}
        notifications={notifications}
        sermonAlerts={sermonAlerts}
        devotionalReminders={devotionalReminders}
        stayLoggedIn={stayLoggedIn}
        onToggle={handleToggle}
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