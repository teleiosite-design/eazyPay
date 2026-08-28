import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Nfc, QrCode, Camera, ShieldCheck, RefreshCw, CircleCheck, CircleAlert } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { OfflineQrCode } from '../components/OfflineQrCode';
import { CryptoService } from '../services/crypto';
import { ThemeColors } from '../theme/colors';

export const CustomerPayScreen: React.FC = () => {
  const { student, performNfcPayment, isOffline, colors } = useApp();
  const styles = getStyles(colors);

  const [payMode, setPayMode] = useState<'nfc' | 'qr_display' | 'qr_scan'>('nfc');
  const [payAmount, setPayAmount] = useState('200');
  const [qrPayload, setQrPayload] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    generateQrToken();
  }, [payAmount]);

  const generateQrToken = async () => {
    const amt = parseFloat(payAmount) || 200;
    const nonce = Math.floor(100000 + Math.random() * 900000);
    const ts = Date.now();
    const payloadStr = `${student.id}|${nonce}|${ts}|${amt}`;
    const sig = await CryptoService.signPayload(payloadStr);
    const pub = (await CryptoService.getOrGenerateDeviceKeyPair()).publicKey;
    setQrPayload(`${payloadStr}|${sig}|${pub}`);
  };

  const handleSimulateNfcTap = async () => {
    setIsScanning(true);
    const amt = parseFloat(payAmount) || 200;
    setTimeout(async () => {
      await performNfcPayment("Mama Tee's Kitchen", amt, true);
      setIsScanning(false);
      setPaySuccess(true);
      setTimeout(() => setPaySuccess(false), 3000);
    }, 1800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tap Pay & QR Payments</Text>
        <Text style={styles.subtitle}>Cryptographically signed offline transactions</Text>
      </View>

      {/* Payment Mode Selector Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.tabBtn, payMode === 'nfc' && styles.tabBtnActive]}
          onPress={() => setPayMode('nfc')}
        >
          <Nfc size={18} color={payMode === 'nfc' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabBtnText, payMode === 'nfc' && styles.tabBtnTextActive]}>NFC Tap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, payMode === 'qr_display' && styles.tabBtnActive]}
          onPress={() => setPayMode('qr_display')}
        >
          <QrCode size={18} color={payMode === 'qr_display' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabBtnText, payMode === 'qr_display' && styles.tabBtnTextActive]}>Offline QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, payMode === 'qr_scan' && styles.tabBtnActive]}
          onPress={() => setPayMode('qr_scan')}
        >
          <Camera size={18} color={payMode === 'qr_scan' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabBtnText, payMode === 'qr_scan' && styles.tabBtnTextActive]}>Scan Merchant</Text>
        </TouchableOpacity>
      </View>

      {/* Amount Preset Box */}
      <View style={styles.amountBox}>
        <Text style={styles.label}>TRANSACTION AMOUNT (₦)</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          value={payAmount}
          onChangeText={setPayAmount}
        />
        <View style={styles.presetRow}>
          {['100', '200', '500', '1000'].map((preset) => (
            <TouchableOpacity key={preset} style={styles.presetBtn} onPress={() => setPayAmount(preset)}>
              <Text style={styles.presetText}>₦{preset}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* MODE 1: NFC TAP PAY */}
      {payMode === 'nfc' && (
        <View style={styles.cardSection}>
          <View style={styles.pulseContainer}>
            <Nfc size={64} color={colors.primaryTeal} />
          </View>
          <Text style={styles.sectionHeading}>Ready to Tap Device</Text>
          <Text style={styles.sectionSub}>Hold device against merchant POS or tap physical NTAG213 card</Text>

          {paySuccess ? (
            <View style={styles.successBanner}>
              <CircleCheck size={24} color={colors.success} />
              <Text style={styles.successText}>Payment Completed Successfully!</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={handleSimulateNfcTap} disabled={isScanning}>
              {isScanning ? (
                <RefreshCw size={20} color={colors.background} />
              ) : (
                <Text style={styles.actionBtnText}>Simulate NFC Tap (₦{payAmount})</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* MODE 2: DYNAMIC OFFLINE QR DISPLAY */}
      {payMode === 'qr_display' && (
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Offline Payment QR Code</Text>
          <Text style={styles.sectionSub}>Merchant POS scans this token to deduct funds offline</Text>

          <View style={styles.qrWrapper}>
            <OfflineQrCode payload={qrPayload} size={210} />
          </View>

          <View style={styles.signedBadge}>
            <ShieldCheck size={16} color={colors.primaryTeal} />
            <Text style={styles.signedText}>Signed ECDSA Payload • Replay Protected Nonce</Text>
          </View>

          <TouchableOpacity style={styles.secondaryBtn} onPress={generateQrToken}>
            <RefreshCw size={16} color={colors.primaryTeal} />
            <Text style={styles.secondaryBtnText}>Refresh QR Payload</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODE 3: SCAN MERCHANT QR */}
      {payMode === 'qr_scan' && (
        <View style={styles.cardSection}>
          <Camera size={56} color={colors.primaryTeal} />
          <Text style={styles.sectionHeading}>Scan Merchant QR Code</Text>
          <Text style={styles.sectionSub}>Point camera at vendor's dynamic payment terminal QR</Text>

          <TouchableOpacity style={styles.actionBtn} onPress={handleSimulateNfcTap}>
            <Text style={styles.actionBtnText}>Scan & Authorize Payment</Text>
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
    scrollContent: {
      padding: 20,
      paddingTop: 50,
      gap: 20,
    },
    header: {
      gap: 4,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '900',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    modeTabs: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 4,
      gap: 4,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      gap: 6,
    },
    tabBtnActive: {
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabBtnText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    tabBtnTextActive: {
      color: colors.primaryTeal,
      fontWeight: '800',
    },
    amountBox: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    amountInput: {
      color: colors.primaryTeal,
      fontSize: 32,
      fontWeight: '900',
    },
    presetRow: {
      flexDirection: 'row',
      gap: 8,
    },
    presetBtn: {
      flex: 1,
      backgroundColor: colors.surfaceCard,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    presetText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
    cardSection: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pulseContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(0, 242, 254, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionHeading: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    sectionSub: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
    },
    actionBtn: {
      backgroundColor: colors.primaryTeal,
      width: '100%',
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    actionBtnText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '800',
    },
    successBanner: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      padding: 14,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      justifyContent: 'center',
    },
    successText: {
      color: colors.success,
      fontSize: 13,
      fontWeight: '800',
    },
    qrWrapper: {
      padding: 12,
      backgroundColor: colors.surfaceCard,
      borderRadius: 20,
    },
    signedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    signedText: {
      color: colors.primaryTeal,
      fontSize: 11,
      fontWeight: '600',
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
    },
    secondaryBtnText: {
      color: colors.primaryTeal,
      fontSize: 12,
      fontWeight: '700',
    },
  });
