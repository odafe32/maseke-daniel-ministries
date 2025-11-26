import React from "react";
import { ThemeText } from "@/src/components";
import { fs, getColor } from "@/src/utils";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { avatarUri, quickActions } from "@/src/constants/data";
import { useRouter } from "expo-router";

export const Home = () => {
  const colors = getColor();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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

        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      </View>

      <View style={styles.cardsWrapper}>
        {quickActions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={styles.cardShadow}
            onPress={() => router.push(item.link)}
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
    fontSize: fs(22),
    color: "#000",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  cardsWrapper: {
    marginTop: 32,
    gap: 18,
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
    height: 160,
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
});
