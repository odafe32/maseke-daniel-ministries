import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DevotionalTheme } from './Devotionals';
import { fs, hp, wp } from '@/src/utils';

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
    paddingHorizontal: wp(16),
    paddingBottom: wp(16),
  },
  headerButton: {
    width: wp(44),
    height: hp(44),
    borderRadius: wp(22),
    borderWidth: wp(1),
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
    paddingHorizontal: wp(32),
  },
  iconContainer: {
    width: wp(96),
    height: hp(96),
    borderRadius: wp(48),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(24),
  },
  title: {
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(24),
    textAlign: 'center',
    marginBottom: hp(12),
  },
  message: {
    fontFamily: 'DMSans-Regular',
    fontSize: fs(16),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: hp(8),
  },
  suggestion: {
    fontFamily: 'DMSans-Regular',
    fontSize: fs(14),
    textAlign: 'center',
    lineHeight: 20,
  },
});