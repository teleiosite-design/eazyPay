import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { History, Search, ArrowUpRight, ArrowDownLeft, ListFilter } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { Transaction } from '../types';
import { TransactionReceiptModal } from '../components/Modals';
import { ThemeColors } from '../theme/colors';

export const CustomerHistoryScreen: React.FC = () => {
  const { transactions, colors } = useApp();
  const styles = getStyles(colors);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'food' | 'print' | 'topup'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.txRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transaction Ledger</Text>
          <Text style={styles.subtitle}>Immutable SHA-256 block history on device</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vendor or reference..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'food', 'print', 'topup'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterPill, filterCategory === cat && styles.filterPillActive]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}>
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <History size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySub}>Try adjusting your search query or category filter</Text>
            </View>
          ) : (
            filtered.map((t, idx) => (
              <TouchableOpacity key={idx} style={styles.txItem} onPress={() => setSelectedTx(t)}>
                <View style={[styles.iconBox, t.isDebit ? styles.debitBg : styles.creditBg]}>
                  {t.isDebit ? <ArrowUpRight size={18} color={colors.danger} /> : <ArrowDownLeft size={18} color={colors.success} />}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{t.title}</Text>
                  <Text style={styles.txSub}>
                    {new Date(t.timestamp || Date.now()).toLocaleDateString()} • {t.txRef}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmount, t.isDebit ? styles.debitText : styles.creditText]}>
                    {t.isDebit ? '-' : '+'}₦{t.amount.toLocaleString()}
                  </Text>
                  <Text style={[styles.syncTag, t.syncStatus === 'Pending' ? styles.pendingTag : styles.syncedTag]}>
                    {t.syncStatus}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TransactionReceiptModal
        transaction={selectedTx}
        visible={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
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
    searchBar: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
    },
    filterPill: {
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterPillActive: {
      borderColor: colors.primaryTeal,
      backgroundColor: colors.surfaceCard,
    },
    filterText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    filterTextActive: {
      color: colors.primaryTeal,
    },
    section: {
      gap: 10,
      marginTop: 6,
    },
    txItem: {
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    debitBg: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
    creditBg: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    txTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    txSub: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    txAmount: {
      fontSize: 14,
      fontWeight: '800',
    },
    debitText: { color: colors.danger },
    creditText: { color: colors.success },
    syncTag: {
      fontSize: 10,
      fontWeight: '700',
      marginTop: 2,
    },
    pendingTag: { color: colors.warning },
    syncedTag: { color: colors.primaryTeal },
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 10,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    emptySub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
