import { fs, getColor, hp, wp } from "@/src/utils";
import React, { ForwardedRef, forwardRef, useState } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { ThemeText } from "./ThemeText";

export interface InputFieldProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  containerStyle?: ViewStyle;
  wrapperStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      containerStyle,
      wrapperStyle,
      inputStyle,
      leftIcon,
      rightIcon,
      fullWidth = true,
      placeholderTextColor,
      onFocus,
      onBlur,
      ...rest
    },
    ref: ForwardedRef<TextInput>
  ) => {
    const colors = getColor();
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const resolvedPlaceholder = placeholderTextColor ?? colors.placeholder;
    const borderColor = errorMessage
      ? colors.error
      : isFocused
      ? colors.primary
      : colors.border;

    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
        {label && (
          <ThemeText variant="label" style={styles.label}>
            {label}
          </ThemeText>
        )}

        <View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              backgroundColor: colors.card,
              shadowOpacity: isFocused ? 0.12 : 0.05,
              shadowColor: colors.primary,
            },
            !fullWidth && styles.autoWidth,
            wrapperStyle,
          ]}
        >
          {leftIcon && <View style={styles.iconSlot}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[styles.input, { color: colors.text }, inputStyle]}
            placeholderTextColor={resolvedPlaceholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="none"
            {...rest}
          />

          {rightIcon && <View style={styles.iconSlot}>{rightIcon}</View>}
        </View>

        {errorMessage ? (
          <ThemeText
            variant="caption"
            color={colors.error}
            style={styles.helperText}
          >
            {errorMessage}
          </ThemeText>
        ) : helperText ? (
          <ThemeText
            variant="caption"
            color={colors.muted}
            style={styles.helperText}
          >
            {helperText}
          </ThemeText>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    gap: hp(6),
  },
  fullWidth: {
    width: "100%",
  },
  autoWidth: {
    alignSelf: "flex-start",
  },
  label: {
    paddingLeft: wp(2),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: wp(20),
    minHeight: hp(50),
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: fs(16),
    paddingVertical: hp(14),
    fontFamily: "DMSans-Regular",
  },
  iconSlot: {
    marginHorizontal: wp(4),
  },
  helperText: {
    marginTop: hp(-2),
  },
});

InputField.displayName = "InputField";
