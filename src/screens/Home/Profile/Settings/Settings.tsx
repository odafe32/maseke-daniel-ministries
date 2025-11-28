import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";
import Toast from 'react-native-toast-message';

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

  const handleToggleChange = (id: string, value: boolean) => {
    console.log(`Toggle changed: ${id} = ${value}`);
    
    const setting = settings.find(s => s.id === id);
    const statusText = value ? 'enabled' : 'disabled';
    
    setSettings(prev => 
      prev.map(s => 
        s.id === id ? { ...s, value } : s
      )
    );

    // Show toast message using react-native-toast-message
    const message = `${setting?.title} ${statusText}`;
    console.log(message);
    
    Toast.show({
      type: 'success',
      text1: 'Setting Updated',
      text2: message,
      position: 'bottom',
      visibilityTime: 2000,
    });
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
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 24,
  },
  content: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 8,
    gap: 20,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 14,
    color: '#121116',
    lineHeight: 14,
  },
  description: {
    fontSize: 14,
    color: '#121116',
    lineHeight: 18,
  },
});