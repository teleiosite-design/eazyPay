import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Delete, Lock } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({ visible, onClose, onSuccess, title = 'Enter Transaction PIN' }) => {
  const { pinBuffer, appendPinChar, deletePinChar, isLockedOut, pinAttemptsRemaining, resetPinAttempts, colors } = useApp();
  const styles = getStyles(colors);

  const handlePress = (num: string) => {
    const enteredPin = pinBuffer + num;
    appendPinChar(num, () => {
      onSuccess(enteredPin);
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Lock size={24} color={colors.primaryTeal} />
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {isLockedOut ? (
            <View style={styles.lockoutContainer}>
              <Text style={styles.lockoutTitle}>Security Lockout Active</Text>
              <Text style={styles.lockoutSub}>Too many incorrect PIN attempts. Please reset or contact support.</Text>
              <TouchableOpacity onPress={resetPinAttempts} style={styles.resetButton}>
                <Text style={styles.resetText}>Reset Security Attempts</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.dotsRow}>
                {[0, 1, 2, 3].map((idx) => (
                  <View
                    key={idx}
                    style={[styles.dot, pinBuffer.length > idx ? styles.dotFilled : styles.dotEmpty]}
                  />
                ))}
              </View>

              <Text style={styles.attemptsText}>Attempts remaining: {pinAttemptsRemaining}/3</Text>

              <View style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <TouchableOpacity key={digit} style={styles.key} onPress={() => handlePress(digit)}>
                    <Text style={styles.keyText}>{digit}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.keyEmpty} />
                <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
                  <Text style={styles.keyText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={deletePinChar}>
                  <Delete size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    closeText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 16,
      marginVertical: 20,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    dotEmpty: {
      borderWidth: 2,
      borderColor: colors.border,
    },
    dotFilled: {
      backgroundColor: colors.primaryTeal,
    },
    attemptsText: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 20,
    },
    keypad: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 280,
      justifyContent: 'space-between',
      gap: 16,
    },
    key: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyEmpty: {
      width: 72,
      height: 72,
    },
    keyText: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '700',
    },
    lockoutContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    lockoutTitle: {
      color: colors.danger,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },
    lockoutSub: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 20,
    },
    resetButton: {
      backgroundColor: colors.primaryTeal,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
    },
    resetText: {
      color: colors.background,
      fontWeight: '700',
    },
  });
