import { fs, hp } from '@/src/utils';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const NoDevotionsPage = () => (
  <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
    <Text style={[styles.title, { color: '#0C154C' }]}>
      No Devotions Available
    </Text>
    <Text style={[styles.message, { color: '#0C154C' }]}>
      There are currently no devotional series available. Please check back later.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fs(24),
    fontWeight: 'bold',
    marginBottom: hp(20),
  },
  message: {
    fontSize: fs(16),
    textAlign: 'center',
  },
});
