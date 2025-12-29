import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const paragraph1Anim = useRef(new Animated.Value(0)).current;
  const paragraph2Anim = useRef(new Animated.Value(0)).current;
  const paragraph3Anim = useRef(new Animated.Value(0)).current;
  const paragraph4Anim = useRef(new Animated.Value(0)).current;
  const paragraph5Anim = useRef(new Animated.Value(0)).current;
  const paragraph6Anim = useRef(new Animated.Value(0)).current;
  const paragraph7Anim = useRef(new Animated.Value(0)).current;
  const paragraph8Anim = useRef(new Animated.Value(0)).current;
  const paragraph9Anim = useRef(new Animated.Value(0)).current;
  const paragraph10Anim = useRef(new Animated.Value(0)).current;

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
      // Paragraph 1 - fade in
      Animated.timing(paragraph1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 2 - fade in
      Animated.timing(paragraph2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 3 - fade in
      Animated.timing(paragraph3Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 4 - fade in
      Animated.timing(paragraph4Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 5 - fade in
      Animated.timing(paragraph5Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 6 - fade in
      Animated.timing(paragraph6Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 7 - fade in
      Animated.timing(paragraph7Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 8 - fade in
      Animated.timing(paragraph8Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 9 - fade in
      Animated.timing(paragraph9Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Paragraph 10 - fade in
      Animated.timing(paragraph10Anim, {
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
        <BackHeader title="Privacy Policy" onBackPress={onBack}/>
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
            Our Privacy Policy
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 1 */}
        <Animated.View
          style={{
            opacity: paragraph1Anim,
            transform: [
              {
                translateY: paragraph1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            At GDM App, your privacy is important to us. We are committed to protecting the personal information you share with us and ensuring that your experience on our app is safe, secure, and private.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 2 */}
        <Animated.View
          style={{
            opacity: paragraph2Anim,
            transform: [
              {
                translateY: paragraph2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            We may collect the following information to provide and improve our services:  Personal Information such as name, email address, phone number, and payment details for secure tithe and offering processing;  App Usage Data, including how you interact with the app, such as viewing sermons, reading devotionals, and using app features; and Device Information such as device type, operating system, and app version to ensure compatibility and performance.  We only collect what is necessary to deliver a safe and effective experience.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 3 */}
        <Animated.View
          style={{
            opacity: paragraph3Anim,
            transform: [
              {
                translateY: paragraph3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            Your information is used to provide access to live sermons, devotionals, and stored sermon content; process secure payments for tithes and offerings; improve app functionality and user experience; and communicate important updates, support messages, and notifications.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 4 */}
        <Animated.View
          style={{
            opacity: paragraph4Anim,
            transform: [
              {
                translateY: paragraph4Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            We do not sell or rent your personal information to third parties. We implement industry-standard security measures to protect your data, including encryption for sensitive information such as payment details.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 5 */}
        <Animated.View
          style={{
            opacity: paragraph5Anim,
            transform: [
              {
                translateY: paragraph5Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            While no system is 100% secure, we continually work to protect your information from unauthorized access, alteration, disclosure, or destruction.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 6 */}
        <Animated.View
          style={{
            opacity: paragraph6Anim,
            transform: [
              {
                translateY: paragraph6Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            We may share your information in limited circumstances: with service providers that help us operate the app and process payments; or when required by law or to protect the rights, property, or safety of GDM App, our users, or others.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 7 */}
        <Animated.View
          style={{
            opacity: paragraph7Anim,
            transform: [
              {
                translateY: paragraph7Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            Your data is never shared for marketing purposes without your consent. You can update your personal information anytime through the app, opt out of promotional notifications or emails, and request deletion of your account and personal data by contacting support@gdmapp.com.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 8 */}
        <Animated.View
          style={{
            opacity: paragraph8Anim,
            transform: [
              {
                translateY: paragraph8Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            GDM App is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we will delete it promptly.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 9 */}
        <Animated.View
          style={{
            opacity: paragraph9Anim,
            transform: [
              {
                translateY: paragraph9Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            We may update this Privacy Policy from time to time. Updates will be posted within the app, and the effective date will be updated. We encourage you to review this policy periodically.
          </ThemeText>
        </Animated.View>

        {/* Animated Paragraph 10 */}
        <Animated.View
          style={{
            opacity: paragraph10Anim,
            transform: [
              {
                translateY: paragraph10Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            If you have questions, concerns, or requests regarding your privacy, please contact us at support@gdmapp.com or [Insert Address].
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