import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

interface PinBoxInputProps {
  value: string;
  onChange: (pin: string) => void;
  showEyeToggle?: boolean;
}

export const PinBoxInput: React.FC<PinBoxInputProps> = ({
  value,
  onChange,
  showEyeToggle = true,
}) => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const [isSecure, setIsSecure] = useState(true);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const length = 4;

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleTextChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, '');

    // Handle full paste (e.g. user pasted '1234' into any box)
    if (clean.length > 1) {
      const pastedDigits = clean.slice(0, length);
      onChange(pastedDigits);
      const targetIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    // Single digit input
    const newDigits = [...digits];
    newDigits[index] = clean;
    const combined = newDigits.join('');
    onChange(combined);

    // Auto advance to next box
    if (clean && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
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
    <View style={styles.outerRow}>
      <View style={styles.boxesRow}>
        {Array.from({ length }).map((_, idx) => {
          const isFilled = Boolean(digits[idx]);
          const isFocused =
            idx === Math.min(value.length, length - 1) ||
            (idx === length - 1 && value.length === length);

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
                maxLength={4}
                secureTextEntry={isSecure}
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

      {showEyeToggle && (
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setIsSecure(!isSecure)}>
          {isSecure ? (
            <Eye size={20} color={colors.textSecondary} />
          ) : (
            <EyeOff size={20} color={colors.primaryTeal} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    outerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      width: '100%',
      marginVertical: 6,
    },
    boxesRow: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
    },
    box: {
      width: 54,
      height: 56,
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
    eyeBtn: {
      padding: 8,
      backgroundColor: colors.surfaceCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
