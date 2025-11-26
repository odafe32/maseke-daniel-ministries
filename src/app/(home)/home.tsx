import React, { useCallback, useEffect, useState } from "react";
import { Home } from "@/src/screens/Home/Home";
import { quickActions } from "@/src/constants/data";
import { useRouter } from "expo-router";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleCardPress = (link: string) => {
    router.push(link);
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  return (
    <Home
      loading={loading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onCardPress={handleCardPress}
      onProfilePress={handleProfilePress}
      quickActions={quickActions}
    />
  );
}
