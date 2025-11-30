import React, { useRef, useState, useEffect } from "react";
import { About } from "@/src/screens";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";

export default function AboutPage() {
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
          <Skeleton width={80} height={24} style={{ marginBottom: 20, marginTop: 20 }} />
          <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={16} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
        </View>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <About
        onBack={handleBack}
      />
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