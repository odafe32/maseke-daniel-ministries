import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

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
