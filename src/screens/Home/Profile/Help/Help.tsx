import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";

export function Help({ onBack }: { onBack: () => void }) {

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="Get Help" onBackPress={onBack}/>

      <View style={styles.content}>
        <ThemeText variant="h5" style={styles.title}>
          Need Assistance?
        </ThemeText>
        
        <ThemeText variant="body" style={styles.description}>
          We’re here to help you get the most out of our app.
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          Reach out to our support team directly for quick assistance, email us at support@[yourapp].com.
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