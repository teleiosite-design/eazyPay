import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../store/AppContext';

export const OfflineBanner: React.FC = () => {
  const { isOffline, toggleOffline, isSyncing, syncPendingTransactions } = useApp();

  if (!isOffline && !isSyncing) return null;

  return (
    <View style={[styles.container, isOffline ? styles.offlineBg : styles.syncingBg]}>
      <View style={styles.content}>
        {isOffline ? <WifiOff size={16} color="#FFFFFF" /> : <RefreshCw size={16} color="#FFFFFF" />}
        <Text style={styles.text}>
          {isOffline ? 'Offline Mode Active — Transactions auto-signed & queued' : 'Syncing transactions with NestJS ledger...'}
        </Text>
      </View>
      <TouchableOpacity onPress={isOffline ? toggleOffline : syncPendingTransactions} style={styles.button}>
        <Text style={styles.buttonText}>{isOffline ? 'Go Online' : 'Sync Now'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineBg: {
    backgroundColor: Colors.warning,
  },
  syncingBg: {
    backgroundColor: Colors.primaryBlue,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
