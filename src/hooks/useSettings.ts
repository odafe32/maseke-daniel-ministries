import { useEffect } from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useAuthStore } from '@/src/stores/authStore';
import { scheduleDevotionalReminders, cancelDevotionalReminders } from '@/src/notifications';
import axios from 'axios';
import { API_URL } from '../env';

export function useSettings() {
  const {
    notifications,
    sermonAlerts,
    devotionalReminders,
    setSetting,
    loadSettings,
  } = useSettingsStore();

  const { stayLoggedIn, setStayLoggedIn } = useAuthStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggleChange = async (id: string, value: boolean) => {
    console.log(`Toggle changed: ${id} = ${value}`);

    switch (id) {
      case 'notifications':
        await setSetting('notifications', value);
        break;
      case 'sermon-alerts':
        await setSetting('sermonAlerts', value);
        // Sync to server
        const { token } = useAuthStore.getState();
        if (token) {
          try {
            await axios.put(`${API_URL}/mobile/profile/sermon-alerts`, { sermon_alerts: value }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (error) {
            console.log('Failed to sync sermon alerts:', error);
          }
        }
        break;
      case 'devotional-reminders':
        await setSetting('devotionalReminders', value);
        // Schedule or cancel reminders based on the new value
        if (value) {
          await scheduleDevotionalReminders();
        } else {
          await cancelDevotionalReminders();
        }
        break;
      case 'stay-logged-in':
        setStayLoggedIn(value);
        break;
    }
  };

  // Schedule reminders on mount if enabled
  useEffect(() => {
    if (devotionalReminders) {
      scheduleDevotionalReminders();
    }
  }, [devotionalReminders]);

  return {
    notifications,
    sermonAlerts,
    devotionalReminders,
    stayLoggedIn,
    handleToggleChange,
  };
}
