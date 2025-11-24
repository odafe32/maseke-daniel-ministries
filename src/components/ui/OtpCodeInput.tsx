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
      updateCode(index, "");
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
      return;
    }

    const digits = sanitized.split("");
    let nextIndex = index;

    digits.forEach((digit, idx) => {
      const targetIndex = index + idx;
      if (targetIndex < length) {
        updateCode(targetIndex, digit);
        nextIndex = targetIndex;
      }
    });

    const finalCode = assembleCode();
    onChange?.(finalCode);

    if (nextIndex < length - 1) {
      inputsRef.current[nextIndex + 1]?.focus();
    } else {
      inputsRef.current[nextIndex]?.blur();
      if (finalCode.length === length) {
        onComplete?.(finalCode);
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      updateCode(index - 1, "");
      inputsRef.current[index - 1]?.focus();
    }
  };

  const updateCode = (index: number, digit: string) => {
    setCode((prev) => {
      const next = prev.padEnd(length, "").split("");
      next[index] = digit;
      const joined = next.join("").slice(0, length);
      onChange?.(joined.trimEnd());
      if (joined.replace(/\s/g, "").length === length) {
        onComplete?.(joined);
      }
      return joined;
    });
  };

  const assembleCode = () => {
    return code.padEnd(length, "").substring(0, length);
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
          maxLength={1}
          secureTextEntry={secure}
          style={[styles.cell, { borderColor: colors.primary }]}
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
    borderRadius: 12,
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
});
