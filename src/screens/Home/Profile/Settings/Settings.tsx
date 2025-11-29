import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";
import { showSuccessToast } from "@/src/utils/toast";
import { fs, hp, wp } from "@/src/utils";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/src/stores/authStore';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  value: boolean;
}

export function Settings({ onBack, settingsData: initialSettingsData }: { 
  onBack: () => void; 
  settingsData: SettingItem[];
}) {
  const [settings, setSettings] = useState<SettingItem[]>(initialSettingsData);
  const { setStayLoggedIn, logout } = useAuthStore();

  // Load stay-logged-in preference on component mount
  useEffect(() => {
    const loadStayLoggedInPreference = async () => {
      try {
        const stayLoggedInStr = await AsyncStorage.getItem('stayLoggedIn');
        const stayLoggedIn = stayLoggedInStr ? JSON.parse(stayLoggedInStr) : true;
        
        setSettings(prev => 
          prev.map(setting => 
            setting.id === 'stay-logged-in' ? { ...setting, value: stayLoggedIn } : setting
          )
        );
      } catch (error) {
        console.error('Failed to load stay logged in preference:', error);
      }
    };
    
    loadStayLoggedInPreference();
  }, []);

  const handleToggleChange = async (id: string, value: boolean) => {
    console.log(`Toggle changed: ${id} = ${value}`);
    
    const setting = settings.find(s => s.id === id);
    const statusText = value ? 'enabled' : 'disabled';
    
    setSettings(prev => 
      prev.map(s => 
        s.id === id ? { ...s, value } : s
      )
    );

    // Special handling for stay-logged-in setting
    if (id === 'stay-logged-in') {
      try {
        await AsyncStorage.setItem('stayLoggedIn', JSON.stringify(value));
        setStayLoggedIn(value);
        
        // If turning off stay logged in, clear stored auth
        if (!value) {
          await logout();
        }
        
        showSuccessToast('Setting Updated', `${setting?.title} ${statusText}`, { position: 'top', visibilityTime: 2000 });
      } catch (error) {
        console.error('Failed to save stay logged in preference:', error);
        showSuccessToast('Error', 'Failed to update setting', { position: 'top', visibilityTime: 2000 });
      }
    } else {
      // Show toast for other settings
      const message = `${setting?.title} ${statusText}`;
      console.log(message);
      showSuccessToast('Setting Updated', message, { position: 'top', visibilityTime: 2000 });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="My Settings" onBackPress={onBack}/>

      <View style={styles.content}>
        {settings.map((setting) => (
          <View key={setting.id} style={styles.card}>
            <View style={styles.textContainer}>
              <ThemeText variant="bodyBold" style={styles.title}>
                {setting.title}
              </ThemeText>
              <ThemeText variant="body" style={styles.description}>
                {setting.description}
              </ThemeText>
            </View>
            <Switch
              value={setting.value}
              onValueChange={(value) => handleToggleChange(setting.id, value)}
              trackColor={{ false: '#767577', true: '#3B4897' }}
              thumbColor={setting.value ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        ))}
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