import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BackHeader, ThemeText, Icon } from "@/src/components";
import { fs, getColor } from "@/src/utils";
import { ProfileProps } from "@/src/utils/types";

export function Profile({ avatar, name, email, actions, onBack, onActionPress }: ProfileProps) {
  const colors = getColor();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="My Profile" onBackPress={onBack} />

      <View style={styles.profileCard}>
        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={styles.profileMeta}>
          <ThemeText variant="h4" style={styles.name}>
            {name}
          </ThemeText>
          <ThemeText variant="body" color={colors.muted}>
            {email}
          </ThemeText>
        </View>

        <Feather name="chevron-right" size={20} color="#0C154C" />
      </View>

      <View style={styles.section}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionRow,
              index < actions.length - 1 && styles.actionSpacing,
            ]}
            activeOpacity={0.8}
            onPress={() => action.link && onActionPress(action.link)}
          >
            <View style={styles.actionLeft}>
              <View style={styles.iconBadge}>
                {action.custom ? (
                  <Icon name={action.icon as "archive"} color="#121116" size={24} />
                ) : (
                  <Feather name={action.icon as any} size={24} color="#121116" />
                )}
              </View>

              <ThemeText variant="bodyBold" style={styles.actionLabel}>
                {action.label}
              </ThemeText>
            </View>

            <Feather name="chevron-right" size={18} color="#5E596E" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 20,
    // shadowColor: "#000",
    // shadowOpacity: 0.04,
    // shadowRadius: 12,
    // shadowOffset: { width: 0, height: 6 },
    // elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  profileMeta: {
    flex: 1,
  },
  name: {
    fontFamily: "Geist-SemiBold",
    fontSize: fs(18),
    color: "#0C154C",
  },
  section: {
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "#F7F7FB",
    borderRadius: 0,
  
    
  },
  actionSpacing: {
    marginBottom: 4,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: "Geist-Medium",
    color: "#121116",
  },
});