import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_URL } from './env';

export const scheduleDevotionalReminders = async () => {
  try {
    // Request permissions if not granted
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Cancel any existing reminders
    await Notifications.cancelScheduledNotificationAsync('daily-devotional-reminder');

    // Schedule daily reminder at 8 AM
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-devotional-reminder',
      content: {
        title: 'Daily Devotional Reminder',
        body: 'Time for your daily devotional reading! 🌅',
        sound: 'default',
      },
      // @ts-ignore - Type definitions may be outdated due to Expo version
      trigger: {
        type: 'daily',
        hour: 8,
        minute: 0,
      },
    });

    console.log('Daily devotional reminder scheduled');
  } catch (error) {
    console.error('Failed to schedule devotional reminder:', error);
  }
};

export const cancelDevotionalReminders = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync('daily-devotional-reminder');
    console.log('Daily devotional reminder cancelled');
  } catch (error) {
    console.error('Failed to cancel devotional reminder:', error);
  }
};

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for notifications!');
    return;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const token = tokenResponse.data;
  console.log('Expo Push Token:', token);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const subscription = Notifications.addNotificationReceivedListener(async notification => { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log('Notification received:', notification);
    try {
      const stored = await AsyncStorage.getItem('notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const notificationData = {
        id: `${Date.now()}-${Math.random()}`,
        title: notification.request.content.title || 'Notification',
        message: notification.request.content.body || '',
        date,
        time,
        read: false,
        type: notification.request.content.data?.type || 'push',
      };

      notifications.push(notificationData);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

      // Show toast for live stream notifications
      if (notificationData.type === 'live_stream_started') {
        Toast.show({
          type: 'info',
          text1: notificationData.title,
          text2: notificationData.message,
          visibilityTime: 10000, // Show for 5 seconds
        });
      }

    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log('Notification response:', response);
  });

  return token;
}

export const registerPushToken = async (authToken: string) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      const token = await Notifications.getExpoPushTokenAsync();
      await axios.post(`${API_URL}/mobile/auth/push-token`, {
        push_token: token.data,
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('Push token registered');
    }
  } catch (error) {
    console.log('Failed to register push token:', error);
  }
};
