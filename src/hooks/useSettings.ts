import { useEffect } from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useAuthStore } from '@/src/stores/authStore';

export function useSettings() {
  const {
    notifications,
    sermonAlerts,
    devotionalReminders,
    stayLoggedIn,
    setSetting,
    loadSettings,
  } = useSettingsStore();

  const { setStayLoggedIn, logout } = useAuthStore();

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
        break;
      case 'devotional-reminders':
        await setSetting('devotionalReminders', value);
        break;
      case 'stay-logged-in':
        await setSetting('stayLoggedIn', value);
        setStayLoggedIn(value);
        
        // If turning off stay logged in, clear stored auth
        if (!value) {
          await logout();
        }
        break;
    }
  };

  return {
    notifications,
    sermonAlerts,
    devotionalReminders,
    stayLoggedIn,
    handleToggleChange,
  };
}
