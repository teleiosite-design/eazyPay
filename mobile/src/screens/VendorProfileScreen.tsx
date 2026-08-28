import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Store, Landmark, LogOut, Check } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

export const VendorProfileScreen: React.FC = () => {
  const { vendor, updateVendorBankDetails, setIsRegistered, navigateTo, colors } = useApp();
  const styles = getStyles(colors);

  const [bankName, setBankName] = useState(vendor.bankName);
  const [accountNumber, setAccountNumber] = useState(vendor.accountNumber);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateVendorBankDetails(bankName, accountNumber);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = () => {
    setIsRegistered(false);
    navigateTo('register');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Store size={32} color={colors.background} />
          </View>
          <Text style={styles.name}>{vendor.name}</Text>
          <Text style={styles.meta}>Terminal ID: {vendor.id} • Registered Merchant</Text>
          <Text style={styles.phone}>{vendor.phone}</Text>
        </View>

        {/* Bank Configuration */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Landmark size={20} color={colors.primaryTeal} />
            <Text style={styles.cardTitle}>Bank Settlement Account</Text>
          </View>

          {saved && <Text style={styles.savedText}>✓ Settlement details updated!</Text>}

          <View style={{ gap: 12 }}>
            <TextInput
              style={styles.input}
              placeholder="Bank Name (e.g. GTBank)"
              placeholderTextColor={colors.textMuted}
              value={bankName}
              onChangeText={setBankName}
            />
            <TextInput
              style={styles.input}
              placeholder="Account Number (10 digits)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Check size={18} color={colors.background} />
              <Text style={styles.primaryBtnText}>Update Settlement Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out of POS Terminal</Text>
        </TouchableOpacity>
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
    scrollContent: {
      padding: 20,
      paddingTop: 50,
      gap: 20,
    },
    profileHeader: {
      backgroundColor: colors.surfaceCard,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0, 242, 254, 0.2)',
      gap: 6,
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.primaryTeal,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    name: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
    meta: { color: colors.textSecondary, fontSize: 12 },
    phone: { color: colors.primaryTeal, fontSize: 12, fontWeight: '700' },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
    savedText: { color: colors.success, fontSize: 12, fontWeight: '700' },
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 6,
    },
    primaryBtnText: { color: colors.background, fontSize: 14, fontWeight: '800' },
    signOutBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderWidth: 1,
      borderColor: colors.danger,
      height: 48,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    signOutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  });
