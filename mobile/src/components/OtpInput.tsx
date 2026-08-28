import React, { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
}) => {
  const { colors } = useApp();
  const styles = getStyles(colors);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Convert string value to array of characters of length 6
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleTextChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, '');

    // Handle full paste (e.g. user pasted '123456' into any box)
    if (clean.length > 1) {
      const pastedDigits = clean.slice(0, length);
      onChange(pastedDigits);
      // Focus the last input box or next empty box
      const targetIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    // Single digit input
    const newDigits = [...digits];
    newDigits[index] = clean;
    const combined = newDigits.join('');
    onChange(combined);

    // Auto advance to next input if single digit typed
    if (clean && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    // On backspace when current box is empty, focus previous box
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, idx) => {
        const isFilled = Boolean(digits[idx]);
        const isFocused =
          idx === Math.min(value.length, length - 1) || (idx === length - 1 && value.length === length);

        return (
          <View
            key={idx}
            style={[
              styles.box,
              isFilled && styles.boxFilled,
              isFocused && styles.boxFocused,
            ]}
          >
            <TextInput
              ref={(el) => { inputRefs.current[idx] = el; }}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              value={digits[idx]}
              onChangeText={(text) => handleTextChange(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              selectTextOnFocus
              contextMenuHidden={false} // Enables paste menu on long press
            />
          </View>
        );
      })}
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      gap: 8,
      marginVertical: 10,
    },
    box: {
      flex: 1,
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxFilled: {
      borderColor: colors.primaryTeal,
      backgroundColor: 'rgba(0, 242, 254, 0.08)',
    },
    boxFocused: {
      borderColor: colors.primaryTeal,
      borderWidth: 2,
    },
    input: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '900',
      textAlign: 'center',
      width: '100%',
      height: '100%',
    },
  });
