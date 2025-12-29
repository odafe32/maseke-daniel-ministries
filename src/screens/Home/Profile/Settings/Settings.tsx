import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  Animated,
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
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const card4Anim = useRef(new Animated.Value(0)).current;

  // Trigger animations on mount
  useEffect(() => {
    Animated.parallel([
      // Header - fade and slide from top
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      // Card 1 - slide from left
      Animated.spring(card1Anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      // Card 2 - slide from right
      Animated.spring(card2Anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      // Card 3 - slide from left
      Animated.spring(card3Anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
      // Card 4 - slide from right
      Animated.spring(card4Anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        }}
      >
        <BackHeader title="My Settings" onBackPress={onBack}/>
      </Animated.View>

      <View style={styles.content}>
        {/* Animated Notifications Setting */}
        <Animated.View
          style={{
            opacity: card1Anim,
            transform: [
              {
                translateX: card1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          }}
        >
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
        </Animated.View>

        {/* Animated Sermon Alerts Setting */}
        <Animated.View
          style={{
            opacity: card2Anim,
            transform: [
              {
                translateX: card2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
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
        </Animated.View>

        {/* Animated Devotional Reminders Setting */}
        <Animated.View
          style={{
            opacity: card3Anim,
            transform: [
              {
                translateX: card3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          }}
        >
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
        </Animated.View>

        {/* Animated Stay Logged In Setting */}
        <Animated.View
          style={{
            opacity: card4Anim,
            transform: [
              {
                translateX: card4Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
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
        </Animated.View>
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