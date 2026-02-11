import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { fs, getColor, hp, wp } from "@/src/utils";

interface OtpCodeInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  inputProps?: TextInputProps;
}

export const OtpCodeInput = ({
  length = 6,
  value = "",
  onChange,
  onComplete,
  secure = false,
  keyboardType = "number-pad",
  inputProps,
}: OtpCodeInputProps) => {
  const colors = getColor();
  const [code, setCode] = useState(value.slice(0, length));
  const inputsRef = useRef<TextInput[]>([]);

  useEffect(() => {
    setCode(value.slice(0, length));
  }, [value, length]);

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, "");

    if (!sanitized) {
      // User cleared the field
      setCode((prev) => {
        const next = prev.padEnd(length, "").split("");
        next[index] = "";
        const updatedCode = next.join("").slice(0, length);
        onChange?.(updatedCode.trimEnd());
        return updatedCode;
      });
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
      return;
    }

    // Check if user pasted a full OTP code (or close to full length)
    if (sanitized.length >= length) {
      // User pasted the full OTP code - fill all fields at once
      const pastedCode = sanitized.slice(0, length);

      setCode(pastedCode);
      onChange?.(pastedCode);

      // Blur the current input and trigger onComplete
      inputsRef.current[length - 1]?.blur();
      onComplete?.(pastedCode);
      return;
    }

    // Handle single digit input or partial paste
    setCode((prev) => {
      const codeArray = prev.padEnd(length, "").split("");
      const digits = sanitized.split("");
      let nextIndex = index;

      digits.forEach((digit, idx) => {
        const targetIndex = index + idx;
        if (targetIndex < length) {
          codeArray[targetIndex] = digit;
          nextIndex = targetIndex;
        }
      });

      const finalCode = codeArray.join("").slice(0, length);
      onChange?.(finalCode.trimEnd());

      // Handle focus and completion
      if (nextIndex < length - 1) {
        inputsRef.current[nextIndex + 1]?.focus();
      } else {
        inputsRef.current[nextIndex]?.blur();
        if (finalCode.replace(/\s/g, "").length === length) {
          onComplete?.(finalCode);
        }
      }

      return finalCode;
    });
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      setCode((prev) => {
        const next = prev.padEnd(length, "").split("");
        next[index - 1] = "";
        const updatedCode = next.join("").slice(0, length);
        onChange?.(updatedCode.trimEnd());
        return updatedCode;
      });
      inputsRef.current[index - 1]?.focus();
    }
  };
  

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) {
              inputsRef.current[index] = ref;
            }
          }}
          value={code[index] || ""}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          keyboardType={keyboardType}
          maxLength={length}
          secureTextEntry={secure}
          placeholder="-"
          placeholderTextColor="#94A3B8"
          style={[styles.cell, styles.cellTheme]}
          selectionColor={colors.primary}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: wp(8),
  },
  cell: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(12),
    borderWidth: 1,
    textAlign: "center",
    fontSize: fs(20),
    fontFamily: "DMSans-Medium",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cellTheme: {
    borderColor: "#E1E1E1",
  },
});
