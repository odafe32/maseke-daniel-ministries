import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Bell, ArrowLeft, Trash2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Add these animation declarations at the top of your component or before the return statement
const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ADD THESE MISSING ANIMATED VALUES
  const headerAnim = new Animated.Value(0);
  const titleAnim = new Animated.Value(0);
  const emptyStateAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate header on mount
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate title
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }).start();

    // Animate empty state if no notifications
    if (notifications.length === 0) {
      Animated.timing(emptyStateAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [notifications.length]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.notificationCard}>
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
<<<<<<< HEAD

      <View style={styles.content}>
        <View style={styles.cardHeader}>
          <ThemeText variant="h5" style={item.read ? styles.title : [styles.title, styles.unreadTitle]}>
            {item.title}
          </ThemeText>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.content}>
          <View style={styles.cardHeader}>
            <ThemeText variant="h5" style={item.read ? styles.title : [styles.title, styles.unreadTitle]}>
              {item.title}
            </ThemeText>
            {!item.read && <View style={styles.unreadDot} />}
          </View>

          <ThemeText variant="body" color={colors.muted} style={styles.message}>
            {item.message}
          </ThemeText>

          <ThemeText variant="caption" color={colors.muted} style={styles.timestamp}>
            {item.date} at {item.time}
          </ThemeText>
        </View>

        <Feather name="chevron-right" size={20} color="#5E596E" />
      </View>
    </Animated.View>
=======
      <TouchableOpacity
        onPress={() => handleDeleteNotification(item.id)}
        style={styles.deleteButton}
      >
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
>>>>>>> 7d0c8bc579f7e99a2a1b2627bdaab0d8de0046be
  );

<<<<<<< HEAD
export function Notifications({
  onBack,
  notifications,
  onNotificationPress,
  onRefresh,
  refreshing,
  onClearAll,
}: {
  onBack?: () => void;
  notifications: NotificationItem[];
  onNotificationPress: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onClearAll?: () => void;
}) {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const emptyStateAnim = useRef(new Animated.Value(0)).current;

  // Trigger animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(emptyStateAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, titleAnim, emptyStateAnim]);

  const handleNotificationPress = (id: string) => {
    onNotificationPress(id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderHeader = () => (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
=======
  const EmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: emptyStateAnim,
>>>>>>> 7d0c8bc579f7e99a2a1b2627bdaab0d8de0046be
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
        You're all caught up! Check back later for updates.
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Geist-SemiBold",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#6B7280",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#9CA3AF",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Geist-SemiBold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#6B7280",
    textAlign: "center",
  },
});

export default Notifications;