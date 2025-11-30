import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { getColor } from '../utils';

const { width } = Dimensions.get('window');

const BottomMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const colors = getColor();

  // Hide during initial loading or on Profile page
  if (!pathname || pathname === '/' || pathname.includes('/Profile') || pathname.includes('/profile')) {
    return null;
  }

  const tabs = [
    { name: 'Home', icon: 'home', route: '/home' },
    { name: 'Sermons', icon: 'play-circle', route: '/sermons' },
    { name: 'Devotional', icon: 'book-open', route: '/devotionals' },
    { name: 'Bible', icon: 'book', route: '/bible' },
    { name: 'More', icon: 'menu', route: '/Profile' },
  ];

  const getActiveRoute = (route: string) => {
    if (route === '/home' && (pathname === '/home' || pathname === '/')) return true;
    if (route === '/sermons' && pathname === '/sermons') return true;
    if (route === '/devotionals' && pathname.includes('/devotional')) return true;
    if (route === '/giving' && pathname.includes('/giv')) return true;
    if (route === '/bible' && pathname.includes('/bible')) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = getActiveRoute(tab.route);
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Feather
              name={tab.icon as any}
              size={24}
              color={isActive ? '#fff' : '#6B7280'}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: width > 400 ? 90 : 90,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: width > 400 ? 30 : 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#0C154C', // Primary color
    shadowColor: '#0C154C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: width > 400 ? 12 : 11,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
  },
});

export default BottomMenu;
