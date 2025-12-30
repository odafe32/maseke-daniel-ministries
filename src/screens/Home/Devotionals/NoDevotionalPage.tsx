import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DevotionalTheme } from './Devotionals';

interface NoDevotionalPageProps {
  theme: DevotionalTheme;
  onBack: () => void;
  onOpenSidebar: () => void;
  dateLabel?: string;
}

export function NoDevotionalPage({ theme, onBack, onOpenSidebar, dateLabel }: NoDevotionalPageProps) {
  const insets = useSafeAreaInsets();
  const isDark = theme.backgroundColor.toLowerCase() === '#000000' || 
                 theme.backgroundColor.toLowerCase() === '#1a1a1a';
  const statusBarStyle = isDark ? 'light' : 'dark';

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar backgroundColor={theme.backgroundColor} style={statusBarStyle} animated />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={onBack}
          style={[
            styles.headerButton,
            {
              borderColor: theme.accentColor,
              backgroundColor: `${theme.accentColor}14`,
            },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="chevron-left" size={20} color={theme.textColor} />
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          onPress={onOpenSidebar}
          style={[
            styles.headerButton,
            {
              borderColor: theme.accentColor,
              backgroundColor: `${theme.accentColor}14`,
            },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="menu" size={20} color={theme.textColor} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.accentColor}14` }]}>
          <Feather name="book-open" size={48} color={theme.accentColor} />
        </View>

        <Text style={[styles.title, { color: theme.textColor }]}>
          No Devotional Available
        </Text>

        <Text style={[styles.message, { color: theme.textColor, opacity: 0.7 }]}>
          {dateLabel 
            ? `There's no devotional entry for ${dateLabel}.`
            : "There's no devotional entry available for this day."}
        </Text>

        <Text style={[styles.suggestion, { color: theme.textColor, opacity: 0.6 }]}>
          Try selecting a different day from the menu.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  suggestion: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});