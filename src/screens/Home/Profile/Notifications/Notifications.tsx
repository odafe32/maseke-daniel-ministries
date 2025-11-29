import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { BackHeader, ThemeText } from "@/src/components";
import { colors, fs, getColor } from "@/src/utils";
import { notificationsData } from "@/src/constants/data";
import { Icon } from "@/src/components/icons/Icon";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
  type: string;
}

interface NotificationCardProps {
  item: NotificationItem;
  onPress: () => void;
}

function NotificationCard({ item, onPress }: NotificationCardProps) {
  const colors = getColor();

  const getIcon = (type: string) => {
    switch (type) {
      case 'sermon':
        return 'play-circle';
      case 'devotional':
        return 'book-open';
      case 'live':
        return 'video';
      case 'prayer':
        return 'heart';
      case 'testimony':
        return 'message-circle';
      case 'event':
        return 'calendar';
      case 'donation':
        return 'dollar-sign';
      case 'app':
        return 'smartphone';
      default:
        return 'bell';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Feather
          name={getIcon(item.type) as any}
          size={24}
          color={item.read ? colors.muted : "#0C154C"}
        />
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
    </TouchableOpacity>
  );
}

export function Notifications({ onBack, notifications, onNotificationPress, onRefresh, refreshing }: { onBack?: () => void; notifications: NotificationItem[]; onNotificationPress: (id: string) => void; onRefresh?: () => void; refreshing?: boolean }) {
  const colors = getColor();
  const handleNotificationPress = (id: string) => {
    onNotificationPress(id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderHeader = () => (
    <View style={styles.container}>
      <BackHeader title="Notifications" onBackPress={onBack} />

      <View style={styles.header}>
        <ThemeText variant="h4" style={styles.headerTitle}>
          Your Notifications
        </ThemeText>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <ThemeText variant="caption" style={styles.badgeText}>
              {unreadCount} unread
            </ThemeText>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    const colors = getColor();
    return (
      <View style={styles.emptyContainer}>
        <Icon name="bell" size={56} color={colors.muted} />
        <ThemeText variant="h4" style={styles.emptyTitle}>
          No notifications yet
        </ThemeText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationCard
          item={item}
          onPress={() => handleNotificationPress(item.id)}
        />
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            colors={[getColor().primary]}
            tintColor={getColor().primary}
          />
        ) : undefined
      }
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    color: "#0C154C",
  },
  badge: {
    backgroundColor: "#0C154C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  unreadCard: {
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 4,
    borderLeftColor: "#0C154C",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F7FB",
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: "#0C154C",
  },
  unreadTitle: {
    fontFamily: "Geist-SemiBold",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0C154C",
  },
  message: {
    lineHeight: 18,
  },
  timestamp: {
    fontSize: fs(12),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    marginTop: 16,
    color: "#666",
    textAlign: 'center',
  },
});
