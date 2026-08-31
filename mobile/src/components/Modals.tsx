import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { X, ShieldCheck, TriangleAlert, CreditCard, Lock, Sun, Moon, Laptop, User, Check, RefreshCw, CircleAlert, FileText } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { Transaction } from '../types';
import { ThemeColors } from '../theme/colors';

// 1. Transaction Receipt & Dispute Modal
export const TransactionReceiptModal: React.FC<{
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
}> = ({ transaction, visible, onClose }) => {
  const { disputeTransaction, disputedTransactions, colors } = useApp();
  if (!transaction) return null;

  const styles = getStyles(colors);
  const isDisputed = transaction.id ? disputedTransactions.has(transaction.id) : false;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Transaction Receipt</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 14 }}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>{transaction.title}</Text>
              <Text style={[styles.receiptAmount, transaction.isDebit ? styles.amountDebit : styles.amountCredit]}>
                {transaction.isDebit ? '-' : '+'}₦{transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </Text>
              <View style={[styles.badge, transaction.syncStatus === 'Pending' ? styles.badgePending : styles.badgeSynced]}>
                <Text style={styles.badgeText}>{transaction.syncStatus}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <ReceiptRow label="Reference ID" value={transaction.txRef} colors={colors} />
              <ReceiptRow label="Timestamp" value={new Date(transaction.timestamp || Date.now()).toLocaleString()} colors={colors} />
              <ReceiptRow label="Category" value={transaction.category.toUpperCase()} colors={colors} />
              <ReceiptRow label="Payer ID" value={transaction.payerId || transaction.customerId || 'EP-0047'} colors={colors} />
              <ReceiptRow label="Payee ID" value={transaction.payeeId || transaction.vendorId || 'EP-V-8765'} colors={colors} />
              <ReceiptRow label="Standard Fee" value={`₦${(transaction.fee || 10).toFixed(2)}`} colors={colors} />
              <ReceiptRow label="Campus Node" value={transaction.campusId || 'Babcock-Main'} colors={colors} />
              <ReceiptRow label="Previous Hash" value={transaction.prevHash.substring(0, 16) + '...'} colors={colors} />
              <ReceiptRow label="Block Hash" value={transaction.hash.substring(0, 16) + '...'} colors={colors} />
              <ReceiptRow label="ECDSA Signature" value={transaction.signature.substring(0, 20) + '...'} colors={colors} />
            </View>

            {isDisputed ? (
              <View style={styles.disputedNotice}>
                <CircleAlert size={18} color={colors.danger} />
                <Text style={styles.disputedText}>Transaction Disputed • Under Admin Review</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.disputeBtn}
                onPress={() => {
                  if (transaction.id) disputeTransaction(transaction.id);
                }}
              >
                <TriangleAlert size={16} color={colors.danger} />
                <Text style={styles.disputeText}>Dispute Transaction</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ReceiptRow: React.FC<{ label: string; value: string; colors: ThemeColors }> = ({ label, value, colors }) => {
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
};

// 2. NFC Cards Management Modal
export const NfcCardsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { registeredCards, addNfcCard, removeNfcCard, colors } = useApp();
  const [newCardName, setNewCardName] = useState('');
  const [isProgramming, setIsProgramming] = useState(false);
  const styles = getStyles(colors);

  const handleAddCard = () => {
    if (newCardName.trim()) {
      setIsProgramming(true);
      setTimeout(() => {
        addNfcCard(newCardName.trim());
        setNewCardName('');
        setIsProgramming(false);
      }, 1500);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Registered NFC Cards</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 12 }}>
            <Text style={styles.modalSub}>Link & manage physical NTAG213 cards or stickers for offline tap payment</Text>

            {registeredCards.map((card, idx) => (
              <View key={idx} style={styles.cardBox}>
                <CreditCard size={20} color={colors.primaryTeal} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardBoxTitle}>{card}</Text>
                  <Text style={styles.cardBoxSub}>Password Protected NTAG213</Text>
                </View>
                <TouchableOpacity onPress={() => removeNfcCard(card)}>
                  <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {isProgramming ? (
              <View style={styles.programmingBox}>
                <RefreshCw size={24} color={colors.primaryTeal} />
                <Text style={styles.programmingText}>Writing cryptographic credentials onto NTAG213 tag...</Text>
                <Text style={styles.programmingSub}>Place physical card against back of device</Text>
              </View>
            ) : (
              <View style={styles.addCardBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Card Name (e.g. Backup Sticker)"
                  placeholderTextColor={colors.textMuted}
                  value={newCardName}
                  onChangeText={setNewCardName}
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleAddCard}>
                  <Text style={styles.primaryBtnText}>Register New Tag</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// 3. Biometrics Lock Modal
export const BiometricsLockModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { isBiometricEnabled, setBiometricEnabled, biometricStatus, colors } = useApp();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Biometric Authentication</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16, paddingVertical: 10 }}>
            <View style={styles.statusBox}>
              <ShieldCheck size={28} color={colors.primaryTeal} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }}>Hardware Diagnostic</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{biometricStatus}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.toggleBtn, isBiometricEnabled ? styles.toggleBtnActive : styles.toggleBtnInactive]}
              onPress={() => setBiometricEnabled(!isBiometricEnabled)}
            >
              <Lock size={18} color={isBiometricEnabled ? colors.background : colors.textPrimary} />
              <Text style={{ color: isBiometricEnabled ? colors.background : colors.textPrimary, fontWeight: '800', fontSize: 14 }}>
                {isBiometricEnabled ? 'Biometric Security Active' : 'Enable Fingerprint / Face ID'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 4. Change PIN Modal
export const ChangePinModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { setPin, verifyPin, colors } = useApp();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const styles = getStyles(colors);

  const handleSubmit = async () => {
    setError(null);
    const ok = await verifyPin(oldPin);
    if (!ok) {
      setError('Current PIN is incorrect');
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('New PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and confirmation do not match');
      return;
    }

    await setPin(newPin);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Change Security PIN</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {success ? (
            <View style={styles.successNotice}>
              <Check size={32} color={colors.success} />
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>PIN Changed Successfully!</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {error && <Text style={styles.errText}>{error}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Current 4-digit PIN"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={oldPin}
                onChangeText={setOldPin}
              />
              <TextInput
                style={styles.input}
                placeholder="New 4-digit PIN"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={newPin}
                onChangeText={setNewPin}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New 4-digit PIN"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                value={confirmPin}
                onChangeText={setConfirmPin}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
                <Text style={styles.primaryBtnText}>Update PIN</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// 5. Ledger Security Audit Modal
export const LedgerSecurityAuditModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { isLedgerSecure, transactions, tamperLedger, repairLedger, colors } = useApp();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Cryptographic Audit</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 14 }}>
            <View style={[styles.statusBanner, isLedgerSecure ? styles.bannerSecure : styles.bannerTampered]}>
              <ShieldCheck size={28} color={isLedgerSecure ? colors.success : colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: isLedgerSecure ? colors.success : colors.danger, fontWeight: '800', fontSize: 15 }}>
                  {isLedgerSecure ? 'Ledger Verified Secure' : 'Tamper Warning Detected'}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {isLedgerSecure ? 'SHA-256 block hash chain is intact' : 'Block hashes failed signature verification'}
                </Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <ReceiptRow label="Total Blockchain Blocks" value={`${transactions.length} Blocks`} colors={colors} />
              <ReceiptRow label="Genesis Hash" value="GENESIS" colors={colors} />
              <ReceiptRow label="Curve Standard" value="secp256r1 ECDSA" colors={colors} />
              <ReceiptRow label="Storage Layer" value="Encrypted SQLite" colors={colors} />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.actionBtnHalf, { backgroundColor: colors.danger }]} onPress={tamperLedger}>
                <Text style={styles.primaryBtnText}>Simulate Attack</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtnHalf, { backgroundColor: colors.primaryTeal }]} onPress={repairLedger}>
                <Text style={[styles.primaryBtnText, { color: colors.background }]}>Repair Ledger</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// 6. Theme Preference Modal
export const ThemePreferenceModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { themePreference, setThemePreference, colors } = useApp();
  const styles = getStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Theme Preference</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12, paddingVertical: 10 }}>
            <TouchableOpacity
              style={[styles.themeOption, themePreference === 'system' && styles.themeOptionSelected]}
              onPress={() => { setThemePreference('system'); onClose(); }}
            >
              <Laptop size={20} color={colors.primaryTeal} />
              <Text style={styles.themeText}>System Default</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, themePreference === 'dark' && styles.themeOptionSelected]}
              onPress={() => { setThemePreference('dark'); onClose(); }}
            >
              <Moon size={20} color={colors.primaryTeal} />
              <Text style={styles.themeText}>Dark Mode (Recommended)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, themePreference === 'light' && styles.themeOptionSelected]}
              onPress={() => { setThemePreference('light'); onClose(); }}
            >
              <Sun size={20} color={colors.primaryTeal} />
              <Text style={styles.themeText}>Light Mode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 7. Personal Details Modal
export const PersonalDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { student, updateCustomerDetails, colors } = useApp();
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [dept, setDept] = useState(student.department);
  const [level, setLevel] = useState(student.level);
  const styles = getStyles(colors);

  const handleSave = () => {
    updateCustomerDetails(name, email, student.phone, dept, level);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Personal Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12 }}>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor={colors.textMuted} />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textMuted} />
            <TextInput style={styles.input} value={dept} onChangeText={setDept} placeholder="Department" placeholderTextColor={colors.textMuted} />
            <TextInput style={styles.input} value={level} onChangeText={setLevel} placeholder="Level" placeholderTextColor={colors.textMuted} />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Text style={styles.primaryBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      padding: 20,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    modalSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    closeBtn: {
      padding: 4,
    },
    receiptHeader: {
      alignItems: 'center',
      backgroundColor: colors.surfaceCard,
      padding: 16,
      borderRadius: 16,
      gap: 6,
    },
    receiptTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    receiptAmount: {
      fontSize: 28,
      fontWeight: '900',
    },
    amountDebit: { color: colors.danger },
    amountCredit: { color: colors.success },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeSynced: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    badgePending: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
    badgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
    detailCard: {
      backgroundColor: colors.surfaceCard,
      borderRadius: 16,
      padding: 14,
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowLabel: { color: colors.textSecondary, fontSize: 12 },
    rowValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', maxWidth: 180 },
    disputeBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderWidth: 1,
      borderColor: colors.danger,
      height: 44,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    disputeText: { color: colors.danger, fontWeight: '800', fontSize: 13 },
    disputedNotice: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      padding: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    disputedText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
    cardBox: {
      backgroundColor: colors.surfaceCard,
      padding: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardBoxTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
    cardBoxSub: { color: colors.textSecondary, fontSize: 11 },
    addCardBox: { gap: 10, marginTop: 10 },
    programmingBox: {
      backgroundColor: colors.surfaceCard,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      gap: 10,
    },
    programmingText: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    programmingSub: { color: colors.textSecondary, fontSize: 11 },
    input: {
      backgroundColor: colors.surfaceCard,
      color: colors.textPrimary,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
    },
    primaryBtn: {
      backgroundColor: colors.primaryTeal,
      height: 46,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { color: colors.background, fontSize: 14, fontWeight: '800' },
    statusBox: {
      backgroundColor: colors.surfaceCard,
      padding: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    toggleBtn: {
      height: 48,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    toggleBtnActive: { backgroundColor: colors.primaryTeal },
    toggleBtnInactive: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.border },
    errText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
    successNotice: { alignItems: 'center', padding: 20, gap: 10 },
    statusBanner: {
      padding: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    bannerSecure: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    bannerTampered: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
    actionBtnHalf: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeOption: {
      backgroundColor: colors.surfaceCard,
      padding: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeOptionSelected: { borderColor: colors.primaryTeal, backgroundColor: 'rgba(0, 242, 254, 0.1)' },
    themeText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  });
