import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Lock, Check } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';
import { PinBoxInput } from '../components/PinBoxInput';

export const SetPinScreen: React.FC = () => {
  const { setPinOnline, student, role, loading, apiError, colors } = useApp();
  const styles = getStyles(colors);

  const [pin, setPinState] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const handleSetPin = async () => {
    setErr(null);
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setErr('PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setErr('PIN numbers do not match');
      return;
    }

    await setPinOnline(student.phone, pin, 'password', role);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Lock size={36} color={colors.primaryTeal} />
        </View>

        <Text style={styles.title}>Create Security PIN</Text>
        <Text style={styles.subtitle}>Set a 4-digit PIN to authorize offline wallet & POS transactions</Text>

        {(err || apiError) && <Text style={styles.errorText}>{err || apiError}</Text>}

        <Text style={styles.inputLabel}>ENTER NEW 4-DIGIT PIN</Text>
        <PinBoxInput value={pin} onChange={setPinState} />

        <Text style={styles.inputLabel}>CONFIRM 4-DIGIT PIN</Text>
        <PinBoxInput value={confirmPin} onChange={setConfirmPin} />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSetPin}
          disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Check size={18} color={colors.background} />
              <Text style={styles.submitBtnText}>Complete Registration</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    content: {
      alignItems: 'center',
      gap: 12,
    },
    logoBadge: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: 'rgba(0, 242, 254, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primaryTeal,
      marginBottom: 4,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '900',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 8,
    },
    inputLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      alignSelf: 'flex-start',
      marginLeft: 10,
    },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: '700',
    },
    submitBtn: {
      backgroundColor: colors.primaryTeal,
      width: '100%',
      height: 50,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 14,
    },
    submitBtnText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '800',
    },
  });
