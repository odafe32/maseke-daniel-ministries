import React, { useState, useEffect } from "react";  
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DevotionalTheme } from "./Devotionals";
import { fs, hp, wp } from "@/src/utils";

interface ResponseModalProps {
  visible: boolean;
  onSave: (heart: string, takeaway: string) => void;
  onSkip: () => void;
  onClose?: () => void; // Optional close handler for dismissing without skipping
  theme: DevotionalTheme;
  isSubmitting?: boolean;
  dateLabel?: string;
}

// Helper function to check if color is dark
const isHexDark = (hex?: string) => {
  if (!hex) return false;
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5;
};

export function ResponseModal({
  visible,
  onSave,
  onSkip,
  onClose,
  theme,
  isSubmitting = false,
  dateLabel,
}: ResponseModalProps) {
  const insets = useSafeAreaInsets();
  const [heart, setHeart] = useState("");
  const [takeaway, setTakeaway] = useState("");

    useEffect(() => {
    if (!visible) {
      setHeart("");
      setTakeaway("");
    }
  }, [visible]);


  const handleClose = () => {
    // Just close the modal without skipping - user must explicitly choose skip or save
    if (onClose) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(heart, takeaway);
    setHeart("");
    setTakeaway("");
  };

  const handleSkip = () => {
    onSkip();
    setHeart("");
    setTakeaway("");
  };

  const isDarkTheme = isHexDark(theme.backgroundColor);
  const inputBackgroundColor = isDarkTheme 
    ? "rgba(255, 255, 255, 0.1)" 
    : "rgba(0, 0, 0, 0.05)";
  const inputBorderColor = isDarkTheme 
    ? "rgba(255, 255, 255, 0.2)" 
    : "rgba(0, 0, 0, 0.1)";
  const placeholderColor = isDarkTheme 
    ? "rgba(255, 255, 255, 0.5)" 
    : "rgba(0, 0, 0, 0.4)";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.textColor} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.textColor }]}>
              Reflect on Today
            </Text>
            {dateLabel && (
              <Text style={[styles.subtitle, { color: theme.textColor, opacity: 0.6 }]}>
                {dateLabel}
              </Text>
            )}
          </View>

          {/* Heart Question */}
          <View style={styles.section}>
            <View style={styles.questionHeader}>
              <Feather name="heart" size={20} color={theme.textColor} />
              <Text style={[styles.label, { color: theme.textColor }]}>
                What touched your heart?
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.heartInput,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: inputBorderColor,
                  color: theme.textColor,
                },
              ]}
              placeholder="Share what moved you..."
              placeholderTextColor={placeholderColor}
              value={heart}
              onChangeText={setHeart}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Takeaway Question */}
          <View style={styles.section}>
            <View style={styles.questionHeader}>
              <Feather name="bookmark" size={20} color={theme.textColor} />
              <Text style={[styles.label, { color: theme.textColor }]}>
                Key takeaway
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.takeawayInput,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: inputBorderColor,
                  color: theme.textColor,
                },
              ]}
              placeholder="What will you remember?"
              placeholderTextColor={placeholderColor}
              value={takeaway}
              onChangeText={setTakeaway}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSkip}
              style={[
                styles.button,
                styles.skipButton,
                {
                  borderColor: theme.textColor,
                  opacity: isSubmitting ? 0.5 : 1,
                },
              ]}
              disabled={isSubmitting}
            >
              <Text style={[styles.skipButtonText, { color: theme.textColor }]}>
                Skip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.button,
                styles.saveButton,
                {
                  backgroundColor: theme.textColor,
                  opacity: isSubmitting ? 0.7 : 1,
                },
              ]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.backgroundColor} />
              ) : (
                <Text style={[styles.saveButtonText, { color: theme.backgroundColor }]}>
                  Save & Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(24),
    paddingTop: wp(60),
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: hp(20),
  },
  closeButton: {
    padding: wp(8),
  },
  titleContainer: {
    marginBottom: hp(32),
  },
  title: {
    fontSize: fs(28),
    fontFamily: "Geist-Bold",
    marginBottom: hp(8,)
  },
  subtitle: {
    fontSize: fs(16),
    fontFamily: "DMSans-Regular",
  },
  section: {
    marginBottom: hp(28),
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: hp(12),
  },
  label: {
    fontSize: fs(16),
    fontFamily: "DMSans-SemiBold",
  },
  input: {
    borderWidth: wp(1),
    borderRadius: wp(12),
    paddingHorizontal: wp(16),
    paddingVertical: 14,
    fontSize: fs(16),
    fontFamily: "DMSans-Regular",
  },
  heartInput: {
    minHeight: hp(120),
  },
  takeawayInput: {
    minHeight: hp(100),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: hp(12),
  },
  button: {
    flex: 1,
    paddingVertical: wp(16),
    borderRadius: wp(12),
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    borderWidth: wp(2),
  },
  skipButtonText: {
    fontSize: fs(16),
    fontFamily: "DMSans-Bold",
  },
  saveButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: fs(16),
    fontFamily: "DMSans-Bold",
  },
});