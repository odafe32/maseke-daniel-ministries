import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { BackHeader, ThemeText, Icon, InputField, Button } from "@/src/components";
import { fs, getColor } from "@/src/utils";
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
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
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
                      <Feather name={typeof action.icon === 'string' ? action.icon as any : 'circle' as any} size={24} color={String(action.id) === 'logout' ? '#DC2626' : '#121116'} />
                    )}
                    {action.badgeCount && action.badgeCount > 0 && (
                      <View style={styles.badge}>
                        <ThemeText variant="caption" style={styles.badgeText}>
                          {`${action.badgeCount > 99 ? '99+' : action.badgeCount}`}
                        </ThemeText>
                      </View>
                    )}
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
                <Image source={{ uri: editForm.avatar }} style={styles.editAvatar} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 20,
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
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
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
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    flexGrow: 1,
  },
  editContent: {
    gap: 16,
  },
  editTitle: {
    textAlign: "center",
    fontFamily: "Geist-SemiBold",
    color: "#0C154C",
  },
  editAvatarWrapper: {
    alignSelf: "center",
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0C154C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  editForm: {
    gap: 16,
  },
  editActions: {
    marginTop: "auto",
    gap: 12,
    paddingBottom: 8,
    width: "100%",
  },
  saveButton: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 10,
  },
  editContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: 24,
  },
}); 