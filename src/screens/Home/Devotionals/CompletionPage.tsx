import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fs, hp, wp } from '@/src/utils';

interface CompletionPageProps {
  onBack: () => void;
}

export const CompletionPage = ({ onBack }: CompletionPageProps) => (
  <View style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
    <View style={styles.content}>
      <Feather name="check-circle" size={80} color="#28A745" style={styles.icon} />
      <Text style={[styles.title, { color: '#0C154C' }]}>
        Congratulations!
      </Text>
      <Text style={[styles.subtitle, { color: '#6C757D' }]}>
        You have successfully completed this devotional series.
      </Text>
      <Text style={[styles.message, { color: '#495057' }]}>
        Keep growing in your faith journey. New devotionals will be available soon!
      </Text>
      <TouchableOpacity onPress={onBack} style={styles.button}>
        <Text style={styles.buttonText}>Continue Exploring</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: wp(40),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxWidth: wp(300),
  },
  icon: {
    marginBottom: wp(20),
  },
  title: {
    fontSize: fs(28),
    fontWeight: 'bold',
    marginBottom: wp(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fs(18),
    fontWeight: '600',
    marginBottom: wp(15),
    textAlign: 'center',
  },
  message: {
    fontSize: fs(16),
    textAlign: 'center',
    lineHeight: hp(22),
    marginBottom: wp(30),
  },
  button: {
    backgroundColor: '#0C154C',
    paddingVertical: wp(12),
    paddingHorizontal: wp(30),
    borderRadius: wp(25),
    shadowColor: '#0C154C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fs(16),
    fontWeight: 'bold',
  },
});
