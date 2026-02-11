import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Bell, ArrowLeft, Trash2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fs, hp, wp } from "@/src/utils";
import { RefreshControl } from "react-native-gesture-handler";

interface NotificationsProps {
  onBack?: () => void;
  notifications: any[];
  onNotificationPress: (id: string) => void;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  onClearAll: () => Promise<void>;
}

const Notifications: React.FC<NotificationsProps> = ({
  onBack,
  notifications,
  onNotificationPress,
  onRefresh,
  refreshing,
  onClearAll,
}) => {
  const router = useRouter();

  const headerAnim = new Animated.Value(0);
  const titleAnim = new Animated.Value(0);
  const emptyStateAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }).start();

    if (notifications.length === 0) {
      Animated.timing(emptyStateAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [notifications.length]);

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.notificationCard} onPress={() => onNotificationPress(item.id)}>
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Bell size={24} color="#6B46C1" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: emptyStateAnim,
          transform: [
            {
              translateY: emptyStateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Bell size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>
        You`re all caught up! Check back later for updates.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Notifications
        </Animated.Text>
        <View style={styles.placeholder} />
      </Animated.View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    marginTop: hp(-10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(16),
    paddingVertical: wp(16),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: wp(8),
  },
  title: {
    fontSize: fs(20),
    fontFamily: "Geist-SemiBold",
    color: "#1F2937",
  },
  placeholder: {
    width: wp(40),
  },
  listContent: {
    padding: wp(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(32),
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(12),
    padding: wp(16),
    marginBottom: wp(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: wp(48),
    height: hp(48),
    borderRadius: wp(24),
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: hp(12),
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fs(16),
    fontFamily: "Geist-SemiBold",
    color: "#1F2937",
    marginBottom: hp(4),
  },
  notificationMessage: {
    fontSize: fs(14),
    fontFamily: "DMSans-Regular",
    color: "#6B7280",
    marginBottom: hp(4),
  },
  notificationTime: {
    fontSize: fs(12),
    fontFamily: "DMSans-Regular",
    color: "#9CA3AF",
  },
  deleteButton: {
    padding: wp(8),
    marginLeft: hp(8),
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: fs(20),
    fontFamily: "Geist-SemiBold",
    color: "#1F2937",
    marginTop: hp(16),
    marginBottom: hp(8),
  },
  emptyMessage: {
    fontSize: fs(14),
    fontFamily: "DMSans-Regular",
    color: "#6B7280",
    textAlign: "center",
  },
});

export default Notifications;