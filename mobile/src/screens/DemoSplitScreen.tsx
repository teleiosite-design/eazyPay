import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Nfc, CircleCheck, ArrowLeft, Smartphone, Store, ShieldCheck, Lock } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

export const DemoSplitScreen: React.FC = () => {
  const { demoStep, stopDemoFlow, student, vendor, colors } = useApp();
  const styles = getStyles(colors);

  const getStepText = (step: number) => {
    switch (step) {
      case 1:
        return 'Step 1 of 5: Tap NTAG213 Smart Card against POS Terminal';
      case 2:
        return 'Step 2 of 5: Hardware Reads Customer ID (EP-0047)';
      case 3:
        return 'Step 3 of 5: Enter Meal Purchase Amount (₦200.00)';
      case 4:
        return 'Step 4 of 5: Authorize Transaction with 4-Digit Security PIN';
      case 5:
        return 'Step 5 of 5: Payment Received & Cryptographically Signed Offline!';
      default:
        return 'Interactive Offline Payment Demo';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={stopDemoFlow}>
          <ArrowLeft size={20} color={colors.textPrimary} />
          <Text style={styles.backText}>Exit Demo</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dual Split-Screen Demo</Text>
      </View>

      {/* Progress Step Banner */}
      <View style={styles.stepBanner}>
        <ShieldCheck size={20} color={colors.primaryTeal} />
        <Text style={styles.stepText}>{getStepText(demoStep)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TOP SPLIT: CUSTOMER PHONE DEVICE */}
        <View style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <Smartphone size={18} color={colors.primaryTeal} />
            <Text style={styles.deviceTitle}>Customer Device (Joy Adaeze)</Text>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>OFFLINE</Text>
            </View>
          </View>

          <View style={styles.deviceBody}>
            <Text style={styles.label}>WALLET BALANCE</Text>
            <Text style={styles.amountText}>₦{student.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>

            <View style={styles.nfcStatusRow}>
              <Nfc size={20} color={demoStep >= 1 ? colors.primaryTeal : colors.textMuted} />
              <Text style={styles.nfcStatusText}>
                {demoStep === 1 ? 'Broadcasting NTAG213 Payload...' : demoStep >= 2 ? 'Card Broadcasted to Terminal' : 'Ready for NFC Tap'}
              </Text>
            </View>

            {demoStep === 4 && (
              <View style={styles.pinVerifyNotice}>
                <Lock size={16} color={colors.primaryTeal} />
                <Text style={styles.pinVerifyText}>PIN Verified: •••• (1234)</Text>
              </View>
            )}
          </View>
        </View>

        {/* BOTTOM SPLIT: VENDOR TERMINAL POS DEVICE */}
        <View style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <Store size={18} color={colors.success} />
            <Text style={styles.deviceTitle}>Vendor POS ({vendor.name})</Text>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>OFFLINE POS</Text>
            </View>
          </View>

          <View style={styles.deviceBody}>
            <Text style={styles.label}>CHARGE AMOUNT</Text>
            <Text style={[styles.amountText, { color: colors.primaryTeal }]}>₦200.00</Text>

            {demoStep < 5 ? (
              <View style={styles.stateNotice}>
                <Nfc size={28} color={colors.primaryTeal} />
                <Text style={styles.stateText}>
                  {demoStep === 1 && 'Waiting for NFC Tap...'}
                  {demoStep === 2 && 'Customer ID Read: EP-0047'}
                  {demoStep === 3 && 'Amount Confirmed: ₦200.00'}
                  {demoStep === 4 && 'Verifying Customer Security PIN...'}
                </Text>
              </View>
            ) : (
              <View style={styles.successBox}>
                <CircleCheck size={36} color={colors.success} />
                <Text style={styles.successHeading}>Payment Received!</Text>
                <Text style={styles.signedTag}>✓ Cryptographically Signed & Verified Offline</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 10,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    backText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
    },
    stepBanner: {
      backgroundColor: colors.surfaceCard,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stepText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '700',
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      gap: 20,
    },
    deviceCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    deviceHeader: {
      backgroundColor: colors.surfaceCard,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    deviceTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
      flex: 1,
    },
    offlineBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    offlineText: {
      color: colors.warning,
      fontSize: 10,
      fontWeight: '800',
    },
    deviceBody: {
      padding: 20,
      gap: 10,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    amountText: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '900',
    },
    nfcStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 8,
    },
    nfcStatusText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    pinVerifyNotice: {
      backgroundColor: 'rgba(0, 242, 254, 0.1)',
      padding: 10,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pinVerifyText: {
      color: colors.primaryTeal,
      fontSize: 12,
      fontWeight: '700',
    },
    stateNotice: {
      backgroundColor: colors.surfaceCard,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
    },
    stateText: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
    },
    successBox: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
    },
    successHeading: {
      color: colors.success,
      fontSize: 18,
      fontWeight: '900',
    },
    signedTag: {
      color: colors.primaryTeal,
      fontSize: 11,
      fontWeight: '700',
    },
  });
