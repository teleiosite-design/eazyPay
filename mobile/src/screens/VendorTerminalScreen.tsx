import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Store, Nfc, ArrowUpRight, CircleCheck, Delete, CircleAlert, RefreshCw, Landmark } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { ThemeColors } from '../theme/colors';

export const VendorTerminalScreen: React.FC = () => {
  const { vendor, performNfcPayment, withdrawVendorEarnings, setRole, isOffline, offlineSpent, colors } = useApp();
  const styles = getStyles(colors);

  const [amount, setAmount] = useState('200');
  const [terminalState, setTerminalState] = useState<'input' | 'scanning' | 'success'>('input');
  const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [lastTxRef, setLastTxRef] = useState('');

  const handleKeyPress = (val: string) => {
    if (amount === '0') setAmount(val);
    else setAmount((prev) => prev + val);
  };

  const handleDelete = () => {
    if (amount.length > 1) setAmount((prev) => prev.slice(0, -1));
    else setAmount('0');
  };

  const handleStartScan = () => {
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;
    setTerminalState('scanning');

    // Simulate scanning tag tap
    setTimeout(async () => {
      await performNfcPayment("Mama Tee's POS", numAmt, false, 'EP-0047');
      setLastTxRef(`TXN-FOOD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setTerminalState('success');
    }, 2000);
  };

  const handleWithdrawalConfirm = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!isNaN(amt) && amt > 0) {
      const ok = await withdrawVendorEarnings(amt);
      if (ok) setWithdrawalModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{vendor.name}</Text>
            <Text style={styles.subTitle}>Terminal ID: {vendor.id} • POS Mode</Text>
          </View>
          <TouchableOpacity style={styles.switchBtn} onPress={() => setRole('customer')}>
            <Text style={styles.switchText}>Switch to Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>TODAY'S TOTAL EARNINGS</Text>
          <Text style={styles.earningsAmount}>₦{vendor.todayEarnings.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
          <Text style={styles.bankMeta}>Settlement: {vendor.bankName} ({vendor.accountNumber})</Text>

          <TouchableOpacity style={styles.withdrawBtn} onPress={() => setWithdrawalModalVisible(true)}>
            <Landmark size={16} color={colors.background} />
            <Text style={styles.withdrawText}>Withdraw to Bank</Text>
          </TouchableOpacity>
        </View>

        {/* Terminal Input View */}
        {terminalState === 'input' && (
          <View style={styles.terminalSection}>
            <Text style={styles.sectionLabel}>ENTER CHARGE AMOUNT</Text>
            <Text style={styles.chargeDisplay}>₦{parseFloat(amount || '0').toLocaleString()}</Text>

            <View style={styles.numpad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <TouchableOpacity key={digit} style={styles.numKey} onPress={() => handleKeyPress(digit)}>
                  <Text style={styles.numText}>{digit}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.numKey} onPress={() => setAmount('0')}>
                <Text style={styles.numText}>C</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numKey} onPress={() => handleKeyPress('0')}>
                <Text style={styles.numText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.numKey} onPress={handleDelete}>
                <Delete size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.scanBtn} onPress={handleStartScan}>
              <Nfc size={22} color={colors.background} />
              <Text style={styles.scanBtnText}>Charge via NFC Tap</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scanning View */}
        {terminalState === 'scanning' && (
          <View style={styles.scanningSection}>
            <View style={styles.pulseBadge}>
              <Nfc size={56} color={colors.primaryTeal} />
            </View>
            <Text style={styles.scanHeading}>Ready to Receive NFC Payment</Text>
            <Text style={styles.scanSub}>Hold student ID card or sticker against back of terminal</Text>
            <Text style={styles.scanAmount}>Amount: ₦{parseFloat(amount).toLocaleString()}</Text>

            <TouchableOpacity style={styles.cancelScanBtn} onPress={() => setTerminalState('input')}>
              <Text style={styles.cancelScanText}>Cancel Terminal Charge</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Success View */}
        {terminalState === 'success' && (
          <View style={styles.successSection}>
            <CircleCheck size={64} color={colors.success} />
            <Text style={styles.successHeading}>Payment Received!</Text>
            <Text style={styles.successAmount}>₦{parseFloat(amount).toLocaleString()}</Text>
            <Text style={styles.receiptRef}>Ref: {lastTxRef}</Text>
            <Text style={styles.signedTag}>✓ Signed & Verified Offline</Text>

            <TouchableOpacity style={styles.newChargeBtn} onPress={() => setTerminalState('input')}>
              <Text style={styles.newChargeText}>New Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal visible={withdrawalModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bank Withdrawal</Text>
            <Text style={styles.modalSub}>Transfer POS earnings directly to {vendor.bankName} ({vendor.accountNumber})</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleWithdrawalConfirm}>
              <Text style={styles.confirmText}>Confirm Settlement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setWithdrawalModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '800',
    },
    subTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    switchBtn: {
      backgroundColor: colors.surfaceCard,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primaryTeal,
    },
    switchText: {
      color: colors.primaryTeal,
      fontSize: 12,
      fontWeight: '700',
    },
    earningsCard: {
      backgroundColor: colors.surfaceCard,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(0, 242, 254, 0.2)',
    },
    earningsLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
    },
    earningsAmount: {
      color: colors.textPrimary,
      fontSize: 32,
      fontWeight: '900',
      marginVertical: 8,
    },
    bankMeta: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 16,
    },
    withdrawBtn: {
      backgroundColor: colors.primaryTeal,
      height: 42,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    withdrawText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '700',
    },
    terminalSection: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      gap: 16,
    },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    chargeDisplay: {
      color: colors.primaryTeal,
      fontSize: 36,
      fontWeight: '900',
    },
    numpad: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 280,
      justifyContent: 'space-between',
      gap: 12,
    },
    numKey: {
      width: 76,
      height: 60,
      borderRadius: 16,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numText: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
    },
    scanBtn: {
      backgroundColor: colors.primaryTeal,
      width: '100%',
      height: 52,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginTop: 8,
    },
    scanBtnText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '800',
    },
    scanningSection: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      gap: 14,
    },
    pulseBadge: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(0, 242, 254, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanHeading: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
    scanSub: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
    },
    scanAmount: {
      color: colors.primaryTeal,
      fontSize: 22,
      fontWeight: '800',
      marginVertical: 10,
    },
    cancelScanBtn: {
      paddingVertical: 10,
    },
    cancelScanText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '600',
    },
    successSection: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      gap: 12,
    },
    successHeading: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '800',
    },
    successAmount: {
      color: colors.success,
      fontSize: 32,
      fontWeight: '900',
    },
    receiptRef: {
      color: colors.textMuted,
      fontSize: 12,
    },
    signedTag: {
      color: colors.primaryTeal,
      fontSize: 12,
      fontWeight: '600',
    },
    newChargeBtn: {
      backgroundColor: colors.primaryTeal,
      width: '100%',
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    newChargeText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      gap: 14,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
    modalSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    modalInput: {
      backgroundColor: colors.surfaceCard,
      color: colors.textPrimary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
    },
    confirmBtn: {
      backgroundColor: colors.primaryTeal,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '700',
    },
    cancelBtn: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    cancelText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });
