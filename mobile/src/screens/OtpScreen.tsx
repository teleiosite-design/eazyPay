import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';
import { OtpInput } from '../components/OtpInput';

export const OtpScreen: React.FC = () => {
  const { verifyOtpOnline, student, role, loading, apiError, colors } = useApp();
  const styles = getStyles(colors);

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length === 6) {
      await verifyOtpOnline(student.email || student.phone, otp, role);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <ShieldCheck size={36} color={colors.primaryTeal} />
        </View>

        <Text style={styles.title}>Security Verification</Text>
        <Text style={styles.subtitle}>Enter 6-digit OTP code sent to {student.email || student.phone}</Text>

        {apiError && <Text style={styles.errorText}>{apiError}</Text>}

        <OtpInput value={otp} onChange={setOtp} length={6} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleVerify} disabled={loading || otp.length !== 6}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Verify OTP Code</Text>
              <ArrowRight size={18} color={colors.background} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.timerRow}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend code in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={styles.resendText}>Resend OTP Email / SMS</Text>
            </TouchableOpacity>
          )}
        </View>
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
      gap: 16,
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
      marginTop: 8,
    },
    submitBtnText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '800',
    },
    timerRow: {
      marginTop: 10,
    },
    timerText: {
      color: colors.textMuted,
      fontSize: 12,
    },
    resendText: {
      color: colors.primaryTeal,
      fontSize: 12,
      fontWeight: '700',
    },
  });
