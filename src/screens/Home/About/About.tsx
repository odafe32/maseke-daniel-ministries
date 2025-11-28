import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";

export function About({ onBack }: { onBack: () => void }) {

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="About App" onBackPress={onBack} showMoreButton={true} />

      <View style={styles.content}>
        <ThemeText variant="h5" style={styles.title}>
          About the App
        </ThemeText>
        
        <ThemeText variant="body" style={styles.description}>
          Tge GRACE DIMENSION APP is designed to bring your church experience to your fingertips. Watch live sermons, read devotionals, give tithes and offerings securely, and access a library of past messages anytime, anywhere.
        </ThemeText>
        
        <ThemeText variant="body" style={styles.description}>
          Our mission is to make it simple and safe for members to stay connected, grow in faith, and engage with your church community no matter where life takes them.
        </ThemeText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 24,
  },
  content: {
    gap: 20,
  },
  title: {
    textAlign: "left",
    fontFamily: "Geist-SemiBold",
    color: "#000000",
  },
  description: {
    lineHeight: 24,
    color: "#424242",
    textAlign: "left",
  },
});