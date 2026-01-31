import React, { useRef, useEffect, useState, useCallback } from "react";
import { ThemeText } from "@/src/components";
import { fs, getColor, hp, wp } from "@/src/utils";
import { HomeProps } from "@/src/utils/types";
import { HomeStorage } from "@/src/utils/homeStorage";
import { quickActions } from "@/src/constants/data";
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Text,
} from "react-native";
import { avatarUri } from "@/src/constants/data";
import { useUser } from "../../hooks/useUser";
import { HomeImageSection } from "./HomeImageSection";
import Feather from "@expo/vector-icons/Feather";
import { ScriptureBanner } from "./ScriptureBanner/ScriptureBanner";

interface LocalUser {
  full_name: string;
  avatar_url?: string;
  avatar_base64?: string;
  last_updated: string;
}

interface ExtendedHomeProps extends HomeProps {
  ads?: Array<{ image: string; display_duration: number }>;
  adsLoading?: boolean;
}

export const Home = ({
  loading,
  refreshing,
  onRefresh,
  onCardPress,
  onProfilePress,
  onNotificationPress,
  notificationCount,
  quickActions: propQuickActions = quickActions,
  ads = [],
  adsLoading = false,
}: ExtendedHomeProps) => {
  const colors = getColor();
  const { user: apiUser } = useUser();
  const profileScale = useRef(new Animated.Value(1)).current;

  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [localQuickActions, setLocalQuickActions] = useState(propQuickActions);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const dynamicStyles = {
    notificationBadge: {
      position: 'absolute' as const,
      top: -4,
      right: -4,
      backgroundColor: '#DC2626',
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: '#fff',
    },
  };

  const user = localUser || apiUser;
  const displayQuickActions = localQuickActions;

  const getAvatarUri = () => {
    if (user?.avatar_base64) {
      return user.avatar_base64; 
    }
    if (user?.avatar_url) {
      return user.avatar_url; 
    }
    return avatarUri;
  };

  const handleProfilePressInternal = () => {
    Animated.sequence([
      Animated.timing(profileScale, {
        toValue: 0.8,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(profileScale, {
        toValue: 0.7,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => onProfilePress());
  };

  const handleNotificationPress = () => {
    onNotificationPress();
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    onRefresh();
  }, [onRefresh]);

  // const getCurrentDayAndTime = () => {
  //   const now = new Date();
  //   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  //   const day = days[now.getDay()];
  //   const time = now.toLocaleTimeString('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     timeZone: 'UTC'
  //   });
  //   return `${day} ${time} UTC`;
  // };

  // Load offline data on component mount
  useEffect(() => {
    const loadOfflineData = async () => {
      try {
        const homeData = await HomeStorage.getHomeData();
        if (homeData) {
          if (homeData.user) {
            setLocalUser(homeData.user);
          }
          if (homeData.quickActions) {
            setLocalQuickActions(homeData.quickActions);
          }

          // Check if data is stale (older than 24 hours)
          const isStale = await HomeStorage.isDataStale(24);
          setIsOfflineMode(isStale);
        }
      } catch (error) {
        console.error('Failed to load offline home data:', error);
      }
    };

    loadOfflineData();
  }, []);

  // Sync with API data when user data changes
  useEffect(() => {
    if (apiUser && !isOfflineMode) {
      const syncUserData = async () => {
        try {
          const userData = {
            full_name: apiUser.full_name || '',
            avatar_url: apiUser.avatar_url,
            avatar_base64: apiUser.avatar_base64, 
            last_updated: new Date().toISOString(),
          };

          await HomeStorage.saveUserData(userData);
          setLocalUser(userData);
          setIsOfflineMode(false);
        } catch (error) {
          console.error('Failed to sync user data:', error);
        }
      };

      syncUserData();
    }
  }, [apiUser, isOfflineMode]);

  const imageUris = ads.map((ad: { image: string; display_duration: number }) => ad.image);
  const durations = ads.map((ad: { image: string; display_duration: number }) => ad.display_duration * 1000);

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <View>
            <ThemeText variant="h3" style={styles.greeting}>
             <Text style={{color: colors.error,}}>Hello</Text> {user?.full_name || 'User'},
            </ThemeText>
          </View>

          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationWrapper} activeOpacity={0.8}>
              <Feather name="bell" size={24} color={colors.primary} />
              {notificationCount > 0 && (
                <View style={dynamicStyles.notificationBadge}>
                  <ThemeText variant="caption" style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : String(notificationCount)}
                  </ThemeText>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleProfilePressInternal} activeOpacity={0.8}>
              <Animated.Image
                source={{ uri: getAvatarUri() }}
                style={[styles.avatar, { transform: [{ scale: profileScale }] }]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollableContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* <ScriptureBanner 
          height={230}
          loves={42}
          comments={15}
          shares={8}
          refreshing={refreshing}
          onRefresh={() => {
          }}
          refreshTrigger={refreshTrigger}
        /> */}
        
        <HomeImageSection imageUris={imageUris} durations={durations} loading={adsLoading} />
        
    
        {loading ? (
          <View style={styles.cardsWrapper}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.skeletonCard} />
            ))}
          </View>
        ) : (
          <View style={styles.cardsWrapper}>
            {displayQuickActions.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={styles.cardShadow}
                onPress={() => onCardPress(item.link)}
              >
                <ImageBackground source={item.image} style={styles.cardImage} imageStyle={styles.cardImageInner}>
                  <View style={styles.cardOverlay}>
                    <ThemeText variant="bodyBold" style={styles.cardText}>
                      {item.title}
                    </ThemeText>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollableContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    marginTop: 4,
    fontFamily: "Geist-Medium",
    fontSize: fs(20),
    color: "#000",
  },
  avatar: {
    width: wp(50),
    height: hp(50),
    borderRadius: wp(50),
    backgroundColor: "#E0E0E0",
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(16),
  },
  notificationWrapper: {
    position: 'relative',
  },
  badgeText: {
    color: '#fff',
    fontSize: fs(10),
    fontFamily: 'Geist-SemiBold',
  },
  cardsWrapper: {
    marginTop: hp(32),
    gap: hp(18),
  },
  cardShadow: {
    borderRadius: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 1,
    elevation: 3,
  },
  cardImage: {
    height: hp(150),
    borderRadius: 10,
    overflow: "hidden",
  },
  cardImageInner: {
    borderRadius: 1,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    color: "#fff",
    fontFamily: "Geist-SemiBold",
    fontSize: fs(18),
  },
  skeletonCard: {
    height: hp(160),
    borderRadius: wp(16),
    backgroundColor: "#E3E6EB",
  },
});
