import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { ThemeText } from './ThemeText';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Dropdown({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    options.find(option => option.value === selectedValue) || null
  );
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedOption(options.find(option => option.value === selectedValue) || null);
  }, [selectedValue, options]);

  const toggleDropdown = () => {
    if (disabled) return;
    
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const openDropdown = () => {
    setIsOpen(true);
    Animated.timing(animatedHeight, {
      toValue: Math.min(options.length * 50, 200),
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setIsOpen(false);
    });
  };

  const handleSelectOption = (option: DropdownOption) => {
    setSelectedOption(option);
    onValueChange(option.value);
    closeDropdown();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          disabled && styles.disabledButton,
        ]}
        onPress={toggleDropdown}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <ThemeText
          variant="body"
          style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemeText>
        <ThemeText variant="body" style={styles.arrow}>
          {isOpen ? '▲' : '▼'}
        </ThemeText>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <Animated.View style={[styles.dropdownList, { height: animatedHeight }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    selectedOption?.value === option.value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelectOption(option)}
                  activeOpacity={0.8}
                >
                  <ThemeText
                    variant="body"
                    style={[
                      styles.optionText,
                      selectedOption?.value === option.value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </ThemeText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  dropdownText: {
    flex: 1,
    fontFamily: 'Geist-Regular',
    color: '#121116',
    fontSize: 16,
  },
  placeholderText: {
    color: '#999',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10000,
    marginTop: 4,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#F0F9FF',
  },
  optionText: {
    fontFamily: 'Geist-Regular',
    color: '#121116',
    fontSize: 16,
  },
  selectedOptionText: {
    fontFamily: 'Geist-SemiBold',
    color: '#0C154C',
  },
});
