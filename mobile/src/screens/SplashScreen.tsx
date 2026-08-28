import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Nfc } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { ThemeColors } from '../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { colors } = useApp();
  const styles = getStyles(colors);

  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Nfc size={48} color={colors.primaryTeal} />
      </View>
      <Text style={styles.title}>EazyPay</Text>
      <Text style={styles.subtitle}>One Tap. Zero Internet.</Text>
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoBadge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(0, 242, 254, 0.15)',
      borderWidth: 2,
      borderColor: colors.primaryTeal,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: 2,
    },
    subtitle: {
      color: colors.primaryTeal,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 6,
      letterSpacing: 1,
    },
  });
