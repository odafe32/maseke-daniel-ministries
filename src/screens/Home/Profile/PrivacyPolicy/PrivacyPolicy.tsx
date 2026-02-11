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
            At Maseke Daniels Ministries, your privacy and trust are fundamental to our mission. We are committed to protecting your personal information and ensuring that your spiritual journey through our app is safe, secure, and private.
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
            We collect information necessary to provide you with a meaningful spiritual experience and maintain the security of our services. This includes: personal details such as your name, email address, and contact information for account creation and communication; payment information for secure processing of tithes and offerings; app usage data to understand how you engage with sermons, devotionals, and community features; and device information to ensure optimal app performance across different platforms.
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
            Your information enables us to deliver our core ministry services: providing access to live sermons, devotionals, and archived spiritual content; processing secure financial contributions to support our mission; personalizing your spiritual journey with relevant content and notifications; improving app functionality based on user feedback; and communicating important updates about ministry events, prayer requests, and community activities.
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
            We do not sell, trade, or rent your personal information to third parties for marketing purposes. Your data remains confidential and is used solely to enhance your experience with Maseke Daniels Ministries. We employ industry-standard security measures, including SSL encryption, secure payment processing, and regular security audits to protect your information.
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
            While we implement robust security measures, please be aware that no online service is completely immune to risks. We continuously monitor and update our security practices to protect against unauthorized access, data breaches, and other potential threats to your information.
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
            We may share your information only in limited circumstances and always in accordance with applicable privacy laws: with trusted service providers who assist in operating our app and processing payments (under strict confidentiality agreements); when required by law enforcement or to comply with legal obligations; or to protect the rights, safety, and spiritual well-being of our ministry community and members.
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
            You maintain control over your data. You can update your profile information at any time through the app settings, manage your notification preferences, opt out of promotional communications, and request account deletion. For data portability or to exercise any of your privacy rights, please contact our support team directly.
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
            Our ministry and app are designed for users of all ages who seek spiritual growth. We do not knowingly collect personal information from children under 13 without parental consent. If we become aware that we have inadvertently collected such information, we will promptly delete it from our systems.
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
            As our ministry grows and technology evolves, we may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of significant changes through the app or email, and the updated policy will include a revised effective date. We encourage you to review this policy periodically to stay informed.
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
            Your trust and spiritual privacy matter to us. If you have questions about this Privacy Policy, our data practices, or wish to exercise your privacy rights, please contact us at support@masekedanielsministries.org. We are committed to addressing your concerns promptly and transparently.
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