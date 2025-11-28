import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="Privacy Policy" onBackPress={onBack} showMoreButton={true}/>

      <View style={styles.content}>
        <ThemeText variant="h5" style={styles.title}>
          Our Privacy Policy
        </ThemeText>
        <ThemeText variant="body" style={styles.description}>
          At GDM App, your privacy is important to us. We are committed to protecting the personal information you share with us and ensuring that your experience on our app is safe, secure, and private. 
        </ThemeText>
        
        <ThemeText variant="body" style={styles.description}>
          We may collect the following information to provide and improve our services:  Personal Information such as name, email address, phone number, and payment details for secure tithe and offering processing;  App Usage Data, including how you interact with the app, such as viewing sermons, reading devotionals, and using app features; and Device Information such as device type, operating system, and app version to ensure compatibility and performance.  We only collect what is necessary to deliver a safe and effective experience. 
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          Your information is used to provide access to live sermons, devotionals, and stored sermon content; process secure payments for tithes and offerings; improve app functionality and user experience; and communicate important updates, support messages, and notifications. 
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          We do not sell or rent your personal information to third parties. We implement industry-standard security measures to protect your data, including encryption for sensitive information such as payment details. 
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          While no system is 100% secure, we continually work to protect your information from unauthorized access, alteration, disclosure, or destruction. 
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          We may share your information in limited circumstances: with service providers that help us operate the app and process payments; or when required by law or to protect the rights, property, or safety of GDM App, our users, or others. 
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          Your data is never shared for marketing purposes without your consent. You can update your personal information anytime through the app, opt out of promotional notifications or emails, and request deletion of your account and personal data by contacting support@gdmapp.com. 
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          GDM App is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we will delete it promptly. 
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          We may update this Privacy Policy from time to time. Updates will be posted within the app, and the effective date will be updated. We encourage you to review this policy periodically. 
        </ThemeText>
        <ThemeText variant="body" style={styles.description}>
          If you have questions, concerns, or requests regarding your privacy, please contact us at support@gdmapp.com or [Insert Address].
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