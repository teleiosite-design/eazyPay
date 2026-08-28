import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { House, Radio, History, User } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { CustomerHomeScreen } from './CustomerHomeScreen';
import { CustomerPayScreen } from './CustomerPayScreen';
import { CustomerHistoryScreen } from './CustomerHistoryScreen';
import { CustomerProfileScreen } from './CustomerProfileScreen';
import { ThemeColors } from '../theme/colors';

export const CustomerMainScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'home' | 'pay' | 'history' | 'profile'>('home');
  const { colors } = useApp();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <View style={styles.content}>
        {selectedTab === 'home' && <CustomerHomeScreen />}
        {selectedTab === 'pay' && <CustomerPayScreen />}
        {selectedTab === 'history' && <CustomerHistoryScreen />}
        {selectedTab === 'profile' && <CustomerProfileScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setSelectedTab('home')}>
          <House size={22} color={selectedTab === 'home' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabLabel, selectedTab === 'home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setSelectedTab('pay')}>
          <Radio size={22} color={selectedTab === 'pay' ? colors.primaryTeal : colors.textSecondary} />
          <Text style={[styles.tabLabel, selectedTab === 'pay' && styles.tabLabelActive]}>Tap Pay</Text>
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
