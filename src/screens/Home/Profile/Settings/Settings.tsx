import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";
import { fs, hp, wp } from "@/src/utils";

interface SettingsProps {
  onBack: () => void;
  notifications: boolean;
  sermonAlerts: boolean;
  devotionalReminders: boolean;
  stayLoggedIn: boolean;
  onToggle: (id: string, value: boolean) => Promise<void>;
}

export function Settings({ 
  onBack,
  notifications,
  sermonAlerts,
  devotionalReminders,
  stayLoggedIn,
  onToggle
}: SettingsProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="My Settings" onBackPress={onBack}/>

      <View style={styles.content}>
        {/* Notifications Setting */}
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <ThemeText variant="bodyBold" style={styles.title}>
              Notifications
            </ThemeText>
            <ThemeText variant="body" style={styles.description}>
              Enable or disable app notifications
            </ThemeText>
          </View>
          <Switch
            value={notifications}
            onValueChange={(value) => onToggle('notifications', value)}
            trackColor={{ false: '#767577', true: '#3B4897' }}
            thumbColor={notifications ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        {/* Sermon Alerts Setting */}
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <ThemeText variant="bodyBold" style={styles.title}>
              Sermon Alerts
            </ThemeText>
            <ThemeText variant="body" style={styles.description}>
              Receive alerts when a live sermon starts
            </ThemeText>
          </View>
          <Switch
            value={sermonAlerts}
            onValueChange={(value) => onToggle('sermon-alerts', value)}
            trackColor={{ false: '#767577', true: '#3B4897' }}
            thumbColor={sermonAlerts ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        {/* Devotional Reminders Setting */}
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <ThemeText variant="bodyBold" style={styles.title}>
              Daily Devotional reminders
            </ThemeText>
            <ThemeText variant="body" style={styles.description}>
              Get reminders to read the devotional
            </ThemeText>
          </View>
          <Switch
            value={devotionalReminders}
            onValueChange={(value) => onToggle('devotional-reminders', value)}
            trackColor={{ false: '#767577', true: '#3B4897' }}
            thumbColor={devotionalReminders ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        {/* Stay Logged In Setting */}
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <ThemeText variant="bodyBold" style={styles.title}>
              Stay Logged In
            </ThemeText>
            <ThemeText variant="body" style={styles.description}>
              Keep your account signed in on this device.
            </ThemeText>
          </View>
          <Switch
            value={stayLoggedIn}
            onValueChange={(value) => onToggle('stay-logged-in', value)}
            trackColor={{ false: '#767577', true: '#3B4897' }}
            thumbColor={stayLoggedIn ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: hp(16),
    paddingBottom: hp(20),
    gap: hp(24),
  },
  content: {
    gap: hp(16),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    padding: hp(16),
    borderRadius: wp(8),
    gap: wp(20),
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: fs(16),
    color: '#121116',
    lineHeight: 14,
  },
  description: {
    fontSize: fs(14),
    color: '#121116',
    lineHeight: 18,
  },
});