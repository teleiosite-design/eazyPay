import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { User, Store, ArrowRight, Play, Shield, Radio } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { setRole, registerOnline, sendOtpOnline, verifyOtpOnline, setPinOnline, startDemoFlow, loading, apiError, colors } = useApp();
  const styles = getStyles(colors);

  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor'>('customer');
  const [step, setStep] = useState<'role' | 'register' | 'otp' | 'pin'>('role');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPinState] = useState('');

  const handleRegisterSubmit = async () => {
    if (!name || !phone) return;
    await registerOnline(name, phone, password || 'password123', selectedRole);
    await sendOtpOnline(phone, selectedRole);
    setStep('otp');
  };

  const handleOtpSubmit = async () => {
    if (!otp) return;
    const ok = await verifyOtpOnline(phone, otp, selectedRole);
    if (ok) {
      setStep('pin');
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return;
    await setPinOnline(phone, pin, password || 'password123', selectedRole);
    setRole(selectedRole);
    onComplete();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {step === 'role' && (
        <View style={styles.section}>
          <Text style={styles.badgeText}>WELCOME TO EAZYPAY BABCOCK</Text>
          <Text style={styles.heading}>Choose your account type</Text>
          <Text style={styles.subheading}>Select your primary role to customize your wallet and POS experience.</Text>

          <View style={styles.roleGrid}>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'customer' && styles.roleCardActive]}
              onPress={() => setSelectedRole('customer')}
            >
              <User size={32} color={selectedRole === 'customer' ? colors.primaryTeal : colors.textSecondary} />
              <Text style={styles.roleTitle}>Student / Customer</Text>
              <Text style={styles.roleSub}>Pay for meals, campus transportation, and printing with one tap.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'vendor' && styles.roleCardActive]}
              onPress={() => setSelectedRole('vendor')}
            >
              <Store size={32} color={selectedRole === 'vendor' ? colors.primaryTeal : colors.textSecondary} />
              <Text style={styles.roleTitle}>Campus Vendor</Text>
              <Text style={styles.roleSub}>Accept offline tap-to-pay transactions and withdraw directly to bank.</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.demoCard} onPress={startDemoFlow}>
            <Play size={20} color={colors.primaryTeal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoTitle}>Synchronized Split Demo</Text>
              <Text style={styles.demoSub}>Watch a simulated offline tap-to-pay transaction between devices.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('register')}>
            <Text style={styles.buttonText}>Continue as {selectedRole === 'customer' ? 'Customer' : 'Vendor'}</Text>
            <ArrowRight size={18} color={colors.background} />
          </TouchableOpacity>
        </View>
      )}

      {step === 'register' && (
        <View style={styles.section}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Enter your details to generate your cryptographic payment verifier.</Text>

          {apiError && <Text style={styles.errorText}>{apiError}</Text>}

          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Joy Adaeze"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 8012345678"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {selectedRole === 'vendor' && (
            <>
              <Text style={styles.label}>MERCHANT PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegisterSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Send OTP Code</Text>}
          </TouchableOpacity>
        </View>
      )}

      {step === 'otp' && (
        <View style={styles.section}>
          <Text style={styles.heading}>Phone Verification</Text>
          <Text style={styles.subheading}>Enter the 6-digit OTP code sent to +234 {phone}.</Text>

          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="000000"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleOtpSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Verify OTP</Text>}
          </TouchableOpacity>
        </View>
      )}

      {step === 'pin' && (
        <View style={styles.section}>
          <Text style={styles.heading}>Set 4-Digit PIN</Text>
          <Text style={styles.subheading}>Configure your secret PIN used for authorizing offline transactions.</Text>

          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="****"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            value={pin}
            onChangeText={setPinState}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handlePinSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Complete Setup</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 24,
      paddingTop: 60,
    },
    section: {
      gap: 16,
    },
    badgeText: {
      color: colors.primaryTeal,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    heading: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '800',
    },
    subheading: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    roleGrid: {
      gap: 16,
      marginVertical: 12,
    },
    roleCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      gap: 8,
    },
    roleCardActive: {
      borderColor: colors.primaryTeal,
      backgroundColor: colors.surfaceCard,
    },
    roleTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    roleSub: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    demoCard: {
      backgroundColor: colors.surfaceCard,
      borderColor: 'rgba(0, 242, 254, 0.3)',
      borderWidth: 1,
      padding: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 8,
    },
    demoTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    demoSub: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    primaryButton: {
      backgroundColor: colors.primaryTeal,
      height: 52,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '800',
    },
    label: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      marginTop: 8,
    },
    input: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    otpInput: {
      textAlign: 'center',
      fontSize: 24,
      letterSpacing: 8,
      fontWeight: '800',
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '600',
    },
  });
