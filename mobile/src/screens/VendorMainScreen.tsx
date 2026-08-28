import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Store, History, User } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { VendorTerminalScreen } from './VendorTerminalScreen';
import { VendorHistoryScreen } from './VendorHistoryScreen';
import { VendorProfileScreen } from './VendorProfileScreen';
import { ThemeColors } from '../theme/colors';

export const VendorMainScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'terminal' | 'history' | 'profile'>('terminal');
  const { colors } = useApp();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <View style={styles.content}>
        {selectedTab === 'terminal' && <VendorTerminalScreen />}
        {selectedTab === 'history' && <VendorHistoryScreen />}
        {selectedTab === 'profile' && <VendorProfileScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setSelectedTab('terminal')}>
          <Store size={22} color={selectedTab === 'terminal' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabLabel, selectedTab === 'terminal' && styles.tabLabelActive]}>Terminal POS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setSelectedTab('history')}>
          <History size={22} color={selectedTab === 'history' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabLabel, selectedTab === 'history' && styles.tabLabelActive]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setSelectedTab('profile')}>
          <User size={22} color={selectedTab === 'profile' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabLabel, selectedTab === 'profile' && styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    bottomBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 12,
      justifyContent: 'space-around',
    },
    tabBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    tabLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    tabLabelActive: {
      color: colors.primaryTeal,
      fontWeight: '800',
    },
  });
