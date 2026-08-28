import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Nfc, ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff, CreditCard, Shield, MessageSquare, Send, Play, RefreshCw, TriangleAlert, CircleCheck, Building } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { PinModal } from '../components/PinModal';
import { SupportModal } from '../components/SupportModal';
import { ThemeColors } from '../theme/colors';

export const CustomerHomeScreen: React.FC = () => {
  const {
    customer,
    student,
    transactions,
    offers,
    registeredCards,
    topUpWallet,
    performNfcPayment,
    transferOnline,
    startDemoFlow,
    isLedgerSecure,
    tamperLedger,
    repairLedger,
    setRole,
    colors,
  } = useApp();

  const styles = getStyles(colors);

  const [hideBalance, setHideBalance] = useState(false);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);

  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [transferAmount, setTransferAmount] = useState('500');

  const activeUser = student || customer;
  const nubanAcc = activeUser.phone ? `99${activeUser.phone.replace(/\D/g, '').slice(-8)}` : '9901234567';

  const handleTopUpConfirm = async () => {
    const amt = parseFloat(topUpAmount);
    if (!isNaN(amt) && amt > 0) {
      await topUpWallet(amt);
      setTopUpModalVisible(false);
    }
  };

  const handleTransferPinSuccess = async () => {
    const amt = parseFloat(transferAmount);
    if (recipientPhone && !isNaN(amt)) {
      await transferOnline(recipientPhone, amt, '1234');
      setTransferModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {activeUser.name} 👋</Text>
            <Text style={styles.studentMeta}>{activeUser.department} • {activeUser.level}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setSupportVisible(true)} style={styles.iconBtn}>
              <MessageSquare size={20} color={colors.primaryTeal} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRole('vendor')} style={styles.switchBtn}>
              <Text style={styles.switchText}>Switch to POS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ledger Integrity Alert */}
        {!isLedgerSecure && (
          <View style={styles.securityAlert}>
            <TriangleAlert size={20} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Ledger Tampering Detected</Text>
              <Text style={styles.alertSub}>Local block hashes do not verify against signatures.</Text>
            </View>
            <TouchableOpacity onPress={repairLedger} style={styles.repairBtn}>
              <Text style={styles.repairText}>Repair</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>AVAILABLE WALLET BALANCE</Text>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
              {hideBalance ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {hideBalance ? '••••••••' : `₦${activeUser.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
          </Text>

          <Text style={styles.accountMeta}>Student ID: {activeUser.id} • Babcock University</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setTopUpModalVisible(true)}>
              <Plus size={18} color={colors.background} />
              <Text style={styles.actionBtnText}>Top-up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={() => setTransferModalVisible(true)}>
              <Send size={18} color={colors.primaryTeal} />
              <Text style={styles.actionBtnOutlineText}>Send P2P</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sterling Bank Dedicated NUBAN Virtual Account Card */}
        <View style={styles.sterlingCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Building size={22} color={colors.primaryTeal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sterlingLabel}>DEDICATED STERLING BANK NUBAN</Text>
              <Text style={styles.sterlingNuban}>{nubanAcc} • Sterling Bank</Text>
            </View>
          </View>
          <Text style={styles.sterlingSub}>
            Transfer money from any bank app to this NUBAN to credit your offline EazyPay wallet instantly via 24/7 Sterling Webhook.
          </Text>
        </View>

        {/* Quick Demo Payment Simulation Banner */}
        <TouchableOpacity style={styles.demoBanner} onPress={startDemoFlow}>
          <Play size={20} color={colors.primaryTeal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.demoTitle}>Simulate Offline NFC Payment</Text>
            <Text style={styles.demoSub}>Watch split-screen tap-to-pay transaction on ₦200 meal purchase</Text>
          </View>
        </TouchableOpacity>

        {/* Registered Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REGISTERED NFC SMART CARDS & STICKERS</Text>
          {registeredCards.map((card, idx) => (
            <View key={idx} style={styles.cardItem}>
              <CreditCard size={20} color={colors.primaryTeal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{card}</Text>
                <Text style={styles.cardStatus}>Active • Password Protected NTAG213</Text>
              </View>
              <CircleCheck size={18} color={colors.success} />
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
          {transactions.slice(0, 5).map((t, idx) => (
            <View key={idx} style={styles.txRow}>
              <View style={[styles.txIcon, t.isDebit ? styles.txDebit : styles.txCredit]}>
                {t.isDebit ? <ArrowUpRight size={18} color={colors.danger} /> : <ArrowDownLeft size={18} color={colors.success} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txTitle}>{t.title}</Text>
                <Text style={styles.txMeta}>{new Date(t.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.txRef}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, t.isDebit ? styles.txAmountDebit : styles.txAmountCredit]}>
                  {t.isDebit ? '-' : '+'}₦{t.amount.toLocaleString()}
                </Text>
                <Text style={[styles.statusBadge, t.syncStatus === 'Pending' ? styles.statusPending : styles.statusSynced]}>
                  {t.syncStatus}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={topUpModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Top-up Wallet</Text>
            <Text style={styles.modalSub}>Transfer to your Sterling Bank Virtual Account or enter top-up amount</Text>
            
            <View style={styles.modalSterlingBox}>
              <Building size={20} color={colors.primaryTeal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSterlingTitle}>Sterling Bank Virtual NUBAN</Text>
                <Text style={styles.modalSterlingAcc}>{nubanAcc}</Text>
                <Text style={styles.modalSterlingSub}>Account Name: {activeUser.name} / EazyPay</Text>
              </View>
            </View>

            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              placeholder="Amount (₦)"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setTopUpModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleTopUpConfirm}>
                <Text style={styles.confirmBtnText}>Confirm Top-up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transfer Modal */}
      <Modal visible={transferModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send P2P Funds</Text>
            <Text style={styles.modalSub}>Enter recipient phone number & amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Recipient Phone (+234)"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={recipientPhone}
              onChangeText={setRecipientPhone}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Amount (₦)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={transferAmount}
              onChangeText={setTransferAmount}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setTransferModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={() => setPinModalVisible(true)}>
                <Text style={styles.confirmBtnText}>Authorize with PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PinModal
        visible={pinModalVisible}
        onClose={() => setPinModalVisible(false)}
        onSuccess={handleTransferPinSuccess}
        title="Authorize Transfer"
      />

      <SupportModal visible={supportVisible} onClose={() => setSupportVisible(false)} />
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
      padding: 16,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
    },
    studentMeta: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    switchBtn: {
      backgroundColor: 'rgba(0, 242, 254, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primaryTeal,
    },
    switchText: {
      color: colors.primaryTeal,
      fontSize: 12,
      fontWeight: '700',
    },
    securityAlert: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      padding: 12,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    alertTitle: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '800',
    },
    alertSub: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    repairBtn: {
      backgroundColor: colors.danger,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    repairText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    balanceCard: {
      backgroundColor: colors.surfaceCard,
      padding: 20,
      borderRadius: 20,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    balanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    balanceLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    balanceAmount: {
      color: colors.textPrimary,
      fontSize: 32,
      fontWeight: '900',
    },
    accountMeta: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 6,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: colors.primaryTeal,
      height: 44,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    actionBtnText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '800',
    },
    actionBtnOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primaryTeal,
    },
    actionBtnOutlineText: {
      color: colors.primaryTeal,
      fontSize: 14,
      fontWeight: '800',
    },
    sterlingCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sterlingLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
    },
    sterlingNuban: {
      color: colors.primaryTeal,
      fontSize: 16,
      fontWeight: '900',
    },
    sterlingSub: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
    demoBanner: {
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    demoTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
    },
    demoSub: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    cardItem: {
      backgroundColor: colors.surfaceCard,
      padding: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardName: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    cardStatus: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    txRow: {
      backgroundColor: colors.surfaceCard,
      padding: 12,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    txIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txDebit: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    txCredit: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    txTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '700',
    },
    txMeta: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    txAmount: {
      fontSize: 14,
      fontWeight: '800',
    },
    txAmountDebit: {
      color: colors.textPrimary,
    },
    txAmountCredit: {
      color: colors.success,
    },
    statusBadge: {
      fontSize: 10,
      fontWeight: '700',
      marginTop: 2,
    },
    statusPending: {
      color: colors.warning,
    },
    statusSynced: {
      color: colors.success,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
    },
    modalSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    modalSterlingBox: {
      backgroundColor: colors.surfaceCard,
      padding: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalSterlingTitle: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '800',
    },
    modalSterlingAcc: {
      color: colors.primaryTeal,
      fontSize: 16,
      fontWeight: '900',
    },
    modalSterlingSub: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    modalInput: {
      backgroundColor: colors.surfaceCard,
      color: colors.textPrimary,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalBtnRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 6,
    },
    cancelBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceCard,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelBtnText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
    },
    confirmBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primaryTeal,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmBtnText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '800',
    },
  });
