import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User, CreditCard, ShieldCheck, Lock, HelpCircle, Moon, LogOut, FileText, ChevronRight } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';
import {
  PersonalDetailsModal,
  NfcCardsModal,
  BiometricsLockModal,
  ChangePinModal,
  ThemePreferenceModal,
  LedgerSecurityAuditModal,
} from '../components/Modals';
import { SupportModal } from '../components/SupportModal';

export const CustomerProfileScreen: React.FC = () => {
  const { student, setIsRegistered, navigateTo, colors, themePreference } = useApp();
  const styles = getStyles(colors);

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleSignOut = () => {
    setIsRegistered(false);
    navigateTo('register');
  };

  const getThemeSub = () => {
    if (themePreference === 'system') return 'System Default (Phone Settings)';
    if (themePreference === 'dark') return 'Dark Mode Active';
    return 'Light Mode Active';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{student.name.split(' ').map((n) => n[0]).join('')}</Text>
          </View>

          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.meta}>{student.department} • {student.level}</Text>
          <Text style={styles.idBadge}>ID: {student.id} • Babcock University</Text>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT & SECURITY</Text>

          <ProfileRow icon={User} title="Personal Details" sub="Edit name, department & email" onPress={() => setActiveModal('personal')} colors={colors} />
          <ProfileRow icon={CreditCard} title="NFC Smart Cards & Stickers" sub="Manage NTAG213 chips" onPress={() => setActiveModal('nfc')} colors={colors} />
          <ProfileRow icon={ShieldCheck} title="Biometric Security" sub="Toggle Fingerprint / Face ID" onPress={() => setActiveModal('biometrics')} colors={colors} />
          <ProfileRow icon={Lock} title="Change Security PIN" sub="Update 4-digit authorization PIN" onPress={() => setActiveModal('pin')} colors={colors} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES & SUPPORT</Text>

          <ProfileRow icon={HelpCircle} title="Babcock Support Hub" sub="Live Agent Chat & Cached FAQs" onPress={() => setActiveModal('support')} colors={colors} />
          <ProfileRow icon={Moon} title="Theme Preference" sub={getThemeSub()} onPress={() => setActiveModal('theme')} colors={colors} />
          <ProfileRow icon={FileText} title="Cryptographic Ledger Audit" sub="Verify SHA-256 block chain" onPress={() => setActiveModal('audit')} colors={colors} />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out of Wallet</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <PersonalDetailsModal visible={activeModal === 'personal'} onClose={() => setActiveModal(null)} />
      <NfcCardsModal visible={activeModal === 'nfc'} onClose={() => setActiveModal(null)} />
      <BiometricsLockModal visible={activeModal === 'biometrics'} onClose={() => setActiveModal(null)} />
      <ChangePinModal visible={activeModal === 'pin'} onClose={() => setActiveModal(null)} />
      <SupportModal visible={activeModal === 'support'} onClose={() => setActiveModal(null)} />
      <ThemePreferenceModal visible={activeModal === 'theme'} onClose={() => setActiveModal(null)} />
      <LedgerSecurityAuditModal visible={activeModal === 'audit'} onClose={() => setActiveModal(null)} />
    </View>
  );
};

const ProfileRow: React.FC<{
  icon: any;
  title: string;
  sub: string;
  onPress: () => void;
  colors: ThemeColors;
}> = ({ icon: IconComp, title, sub, onPress, colors }) => {
  const styles = getStyles(colors);
  return (
    <TouchableOpacity style={styles.rowCard} onPress={onPress}>
      <View style={styles.iconBox}>
        <IconComp size={20} color={colors.primaryTeal} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>

      <ChevronRight size={18} color={colors.textMuted} />
    </TouchableOpacity>
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
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primaryTeal,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    avatarText: {
      color: colors.background,
      fontSize: 24,
      fontWeight: '900',
    },
    name: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '800',
    },
    meta: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    idBadge: {
      color: colors.primaryTeal,
      fontSize: 11,
      fontWeight: '700',
      marginTop: 4,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    rowCard: {
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(0, 242, 254, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    rowSub: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
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
      marginTop: 10,
    },
    signOutText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '800',
    },
  });
