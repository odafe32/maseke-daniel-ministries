import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { getColor } from '../utils';
import { shouldHideBottomMenu } from '../constants/navigation';

const BottomMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const colors = getColor();

  // Hide during initial loading or on Profile page
  if (shouldHideBottomMenu(pathname)) {
    return null;
  }

  const tabs = [
    { name: 'Home', icon: 'home', route: '/home' },
    { name: 'Sermons', icon: 'play-circle', route: '/sermons' },
    { name: 'Devotional', icon: 'book-open', route: '/devotionals' },
    { name: 'Bible', icon: 'book', route: '/bible' },
    { name: 'More', icon: 'menu', route: '/profile' },
  ];
 
  const getActiveRoute = (route: string) => {
    if (route === '/home' && (pathname === '/home' || pathname === '/')) return true;
    if (route === '/sermons' && pathname === '/sermons') return true;
    if (route === '/devotionals' && pathname.includes('/devotional')) return true;
    if (route === '/bible' && pathname.includes('/bible')) return true;
    if (route === '/profile' && pathname.includes('/profile')) return true;
    return false;
  };

  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => getActiveRoute(tab.route))
  );
  const activeTab = tabs[activeIndex] ?? tabs[0];

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.card }]}> 
      <View style={styles.inner}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>        
          {tabs.map((tab) => {
            const isActive = getActiveRoute(tab.route);
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => router.push(tab.route as any)}
                activeOpacity={0.85}
              >
                <View style={styles.tabContent}>
                  {isActive && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
                  <Feather
                    name={tab.icon as any}
                    size={22}
                    color={isActive ? colors.primary : colors.muted}
                  />
                  <Text
                    style={[
                      styles.label,
                      { color: isActive ? colors.primary : colors.muted },
                    ]}
                  >
                    {tab.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 0,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  container: {
    width: '100%',
  
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    top: -10,
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default BottomMenu;
