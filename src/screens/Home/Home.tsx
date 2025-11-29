import React, { useRef } from "react";
import { ThemeText } from "@/src/components";
import { fs, getColor, hp, wp } from "@/src/utils";
import { HomeProps } from "@/src/utils/types";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { avatarUri } from "@/src/constants/data";

export const Home = ({
  loading,
  refreshing,
  onRefresh,
  onCardPress,
  onProfilePress,
  quickActions,
}: HomeProps) => {
  const colors = getColor();
  const profileScale = useRef(new Animated.Value(1)).current;

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

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {loading ? (
        <>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={[styles.skeletonBar, { width: 120 }]} />
              <View style={[styles.skeletonBar, { width: 180, marginTop: 8 }]} />
            </View>
            <View style={styles.skeletonAvatar} />
          </View>

          <View style={styles.cardsWrapper}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.skeletonCard} />
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.headerRow}>
            <View>
              <ThemeText
                variant="label"
                color={colors.muted}
                style={styles.serviceLabel}
              >
                Sunday Service
              </ThemeText>
              <ThemeText variant="h3" style={styles.greeting}>
                Hello Adam
              </ThemeText>
            </View>

            <TouchableOpacity onPress={handleProfilePressInternal} activeOpacity={0.8}>
              <Animated.Image
                source={{ uri: avatarUri }}
                style={[styles.avatar, { transform: [{ scale: profileScale }] }]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardsWrapper}>
            {quickActions.map((item) => (
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
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,

  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceLabel: {
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Geist-Medium",
    fontSize: fs(12),
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
    height: hp(160),
    borderRadius: 1,
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
  skeletonBar: {
    height: hp(14),
    borderRadius: wp(8),
    backgroundColor: "#E3E6EB",
  },
  skeletonAvatar: {
    width: wp(40),
    height: hp(40),
    borderRadius: wp(20),
    backgroundColor: "#E3E6EB",
  },
  skeletonCard: {
    height: hp(160),
    borderRadius: wp(16),
    backgroundColor: "#E3E6EB",
  },
});
