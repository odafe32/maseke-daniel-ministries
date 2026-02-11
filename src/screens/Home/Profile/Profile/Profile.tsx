import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { BackHeader, ThemeText, Icon, InputField, Button } from "@/src/components";
import { fs, getColor, hp, wp } from "@/src/utils";
import { ProfileProps } from "@/src/utils/types";

export function Profile({
  avatar,
  name,
  email,
  actions,
  onBack,
  onActionPress,
  onLogoutPress,
  onEditPress,
  isEditing,
  editForm,
}: ProfileProps) {
  const colors = getColor();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BackHeader title={isEditing ? "Edit profile" : "My Profile"} onBackPress={onBack} />

        {!isEditing ? (
          <>
            <TouchableOpacity activeOpacity={0.85} onPress={onEditPress}>
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
            </TouchableOpacity>

            <View style={styles.section}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={String(action.id)}
                  style={[
                    styles.actionRow,
                    index < actions.length - 1 && styles.actionSpacing,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (String(action.id) === 'logout') {
                      onLogoutPress();
                    } else if (action.link) {
                      onActionPress(action.link);
                    }
                  }}
                >
                  <View style={styles.actionLeft}>
                    <View style={styles.iconBadge}>
                      {action.custom ? (
                        <Icon name={typeof action.icon === 'string' ? action.icon as "archive" : "archive"} color="#121116" size={24} />
                      ) : (
                        <Feather name={typeof action.icon === 'string' ? (action.icon as keyof typeof Feather.glyphMap) : 'circle'} size={24} color={String(action.id) === 'logout' ? '#DC2626' : '#121116'} />
                      )}
                      {(() => {
                        const badgeCount = action.badgeCount ?? 0;
                        if (badgeCount <= 0) {
                          return null;
                        }
                        return (
                        <View style={styles.badge}>
                          <ThemeText variant="caption" style={styles.badgeText}>
                              {badgeCount > 99 ? '99+' : String(badgeCount)}
                          </ThemeText>
                        </View>
                        );
                      })()}
                    </View>

                    <ThemeText variant="bodyBold" style={[styles.actionLabel, String(action.id) === 'logout' ? styles.logoutLabel : {}]}>
                      {String(action.label)}
                    </ThemeText>
                  </View>

                  <Feather name="chevron-right" size={18} color="#5E596E" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.editContainer}>
            <View style={styles.editCard}>
              <View style={styles.editContent}>
                <Pressable onPress={editForm.onAvatarPress} style={styles.editAvatarWrapper}>
                  {editForm.isAvatarLoading ? (
                    <View style={styles.editAvatarLoading}>
                      <ActivityIndicator size="small" color="#333" />
                    </View>
                  ) : (
                    <Image source={{ uri: editForm.avatar }} style={styles.editAvatar} />
                  )}
                  <View style={styles.cameraBadge}>
                    <Feather name="camera" size={18} color="#fff" />
                  </View>
                </Pressable>

                <View style={styles.editForm}>
                  <InputField
                    label="Full name"
                    placeholder="Enter full name"
                    value={editForm.name}
                    onChangeText={editForm.onNameChange}
                  />

                  <InputField
                    label="Email"
                    placeholder="Enter email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={editForm.email}
                    onChangeText={editForm.onEmailChange}
                  />

                  <InputField
                    label="Phone Number"
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={editForm.phone}
                    onChangeText={editForm.onPhoneChange}
                  />

                  <InputField
                    label="Address"
                    placeholder="Enter address"
                    value={editForm.address}
                    onChangeText={editForm.onAddressChange}
                  />
                </View>
              </View>
            </View>
            <View style={styles.editActions}>
              <Button
                title="Save changes"
                onPress={editForm.onSave}
                loading={editForm.isSaving}
                style={styles.saveButton}
              />

              <Button
                title="Delete Account"
                onPress={editForm.onDelete}
                variant="outline"
                textStyle={{ color: "#0C154C" }}
                style={styles.secondaryButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: wp(12),
    paddingBottom: hp(20),
    gap: hp(24),
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp(16),
    gap: wp(12),
    borderRadius: wp(20),
  },
  avatar: {
    width: wp(52),
    height: wp(52),
    borderRadius: wp(26),
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
    gap: hp(12),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(16),
    paddingHorizontal: wp(18),
    backgroundColor: "#F7F7FB",
    borderRadius: 0,
  },
  actionSpacing: {
    marginBottom: hp(4),
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
  },
  iconBadge: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(8),
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: hp(-4),
    right: wp(-4),
    backgroundColor: "#DC2626",
    borderRadius: wp(8),
    minWidth: wp(16),
    height: hp(16),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: fs(10),
    fontFamily: "Geist-SemiBold",
  },
  actionLabel: {
    fontFamily: "Geist-Medium",
    color: "#121116",
  },
  logoutLabel: {
    color: "#DC2626",
  },
  editCard: {
    backgroundColor: "#fff",
    borderRadius: wp(24),
    paddingHorizontal: wp(20),
    paddingVertical: hp(20),
    gap: hp(16),
    flexGrow: 1,
  },
  editContent: {
    gap: hp(16),
  },
  editAvatarWrapper: {
    alignSelf: "center",
  },
  editAvatar: {
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    marginBottom: hp(12),
  },
  editAvatarLoading: {
    width: wp(120),
    height: wp(120),
    borderRadius: "100%",
    marginBottom: hp(12),
    borderColor: "#0C154C",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: wp(-4),
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: "#0C154C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  editForm: {
    gap: hp(16),
  },
  editActions: {
    marginTop: "auto",
    gap: hp(12),
    paddingBottom: hp(8),
    width: "100%",
  },
  saveButton: {
    marginTop: hp(8),
  },
  secondaryButton: {
    marginTop: hp(10),
  },
  editContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: hp(24),
  },
});