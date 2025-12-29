import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";

export function About({ onBack }: { onBack: () => void }) {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const description1Anim = useRef(new Animated.Value(0)).current;
  const description2Anim = useRef(new Animated.Value(0)).current;

  // Trigger animations on mount
  useEffect(() => {
    Animated.stagger(80, [
      // Header - fade and slide from top
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Title - fade in
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // First description - fade in
      Animated.timing(description1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Second description - fade in
      Animated.timing(description2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        }}
      >
        <BackHeader title="About App" onBackPress={onBack}/>
      </Animated.View>

      <View style={styles.content}>
        {/* Animated Title */}
        <Animated.View
          style={{
            opacity: titleAnim,
            transform: [
              {
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="h5" style={styles.title}>
            About the App
          </ThemeText>
        </Animated.View>

        {/* Animated First Description */}
        <Animated.View
          style={{
            opacity: description1Anim,
            transform: [
              {
                translateY: description1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            The GRACE DIMENSION APP is designed to bring your church experience to your fingertips. Watch live sermons, read devotionals, give tithes and offerings securely, and access a library of past messages anytime, anywhere.
          </ThemeText>
        </Animated.View>

        {/* Animated Second Description */}
        <Animated.View
          style={{
            opacity: description2Anim,
            transform: [
              {
                translateY: description2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            Our mission is to make it simple and safe for members to stay connected, grow in faith, and engage with your church community no matter where life takes them.
          </ThemeText>
        </Animated.View>
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