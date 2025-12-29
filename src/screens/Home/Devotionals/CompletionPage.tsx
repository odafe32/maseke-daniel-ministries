import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxWidth: 300,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0C154C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#0C154C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
