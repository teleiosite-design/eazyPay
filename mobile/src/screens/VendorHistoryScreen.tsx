import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Landmark, ArrowDownLeft } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

export const VendorHistoryScreen: React.FC = () => {
  const { transactions, colors } = useApp();
  const styles = getStyles(colors);

  const vendorTxList = transactions.filter((t) => !t.isDebit || t.title.includes('POS') || t.title.includes("Kitchen"));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>POS Settlement History</Text>
          <Text style={styles.subtitle}>Received offline transactions & daily batch totals</Text>
        </View>

        <View style={styles.txList}>
          {vendorTxList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Landmark size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>No terminal transactions received yet today</Text>
            </View>
          ) : (
            vendorTxList.map((t, idx) => (
              <View key={idx} style={styles.txCard}>
                <View style={styles.iconBox}>
                  <ArrowDownLeft size={18} color={colors.success} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{t.title}</Text>
                  <Text style={styles.txMeta}>{new Date(t.timestamp || Date.now()).toLocaleTimeString()} • Ref: {t.txRef}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.txAmount}>+₦{t.amount.toLocaleString('en-NG')}</Text>
                  <Text style={styles.signedTag}>✓ Signed Offline</Text>
                </View>
              </View>
            ))
          )}
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
    scrollContent: {
      padding: 20,
      paddingTop: 50,
      gap: 16,
    },
    header: { gap: 4 },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },
    subtitle: { color: colors.textSecondary, fontSize: 12 },
    txList: { gap: 10 },
    emptyBox: { backgroundColor: colors.surface, padding: 40, borderRadius: 20, alignItems: 'center', gap: 10 },
    emptyText: { color: colors.textMuted, fontSize: 13 },
    txCard: {
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
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    txTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
    txMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
    txAmount: { color: colors.success, fontSize: 14, fontWeight: '800' },
    signedTag: { color: colors.primaryTeal, fontSize: 10, fontWeight: '600', marginTop: 2 },
  });
