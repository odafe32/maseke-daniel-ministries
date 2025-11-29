import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { getColor, wp } from '@/src/utils';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Toggle = ({ value, onValueChange, disabled = false }: ToggleProps) => {
  const colors = getColor("light");
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: value ? colors.primary : colors.border },
        disabled && styles.disabled
      ]}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: '#fff',
            transform: [{ translateX: value ? wp(20) : 0 }]
          }
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(48),
    height: wp(28),
    borderRadius: wp(14),
    justifyContent: 'center',
    paddingHorizontal: wp(3),
  },
  thumb: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
