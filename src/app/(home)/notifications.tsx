import React, { useRef, useState, useEffect } from "react";
import { Notifications } from "@/src/screens";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";

export default function NotificationsPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  if (loading) {
    return (
   <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
        <View style={styles.container}>
          <Skeleton width={200} height={24} style={{ marginBottom: 20, marginTop: 20 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 12 }} />
        </View>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Notifications onBack={handleBack} />
    </AuthPageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
});
